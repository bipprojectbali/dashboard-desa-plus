import { isWallRoute } from "@/config/assistant-pointer";
import type {
	AssistantChatResponse,
	AssistantPageContext,
} from "@/types/ai-assistant-chat";
import {
	type AssistantSettingsValues,
	getAssistantSettings,
} from "../config/settings.repo";
import * as conversationRepo from "../conversation/conversation.repo";
import type { AssistantPrincipal } from "../http/access";
import {
	assistantRateLimiter,
	checkDailyQuota,
	checkInput,
	historyTake,
	type SlidingWindowRateLimiter,
} from "../limits/usage";
import { getUsageToday, type UsageToday } from "../limits/usage.repo";
import { buildSystemPrompt, sanitizeInline } from "../prompt/system-prompt";
import { getProvider, type ResolveProviderResult } from "../provider/resolve";
import { AiProviderError, type ChatMessage } from "../provider/types";
import { type ExecuteOptions, executeWithTools } from "../tools/executor";
import { hasPointerTools, scopePointerTools } from "../tools/pointer";
import {
	ASSISTANT_TOOLS,
	getAvailableTools,
	getUnavailableModules,
} from "../tools/registry";
import type { ToolContext, ToolDefinition } from "../tools/types";
import { recordFailedTurn, saveTurn } from "./chat.persist";

/** Satu giliran `POST /api/assistant/chat` (rancangan 04 §3, alur 03 §1). */

export const CHAT_MESSAGES = {
	disabled: "Asisten AI sedang dinonaktifkan admin.",
	notReady:
		"Asisten AI belum siap dipakai: kredensial chat belum diatur admin.",
	notFound: "Percakapan tidak ditemukan.",
	busy: "Layanan AI sedang sibuk, coba lagi sebentar.",
	unavailable: "Layanan AI sedang tidak tersedia, coba lagi nanti.",
} as const;

const PAGE_ROUTE_MAX_CHARS = 200;

export interface ChatTurnInput {
	principal: AssistantPrincipal;
	conversationId?: string;
	message: string;
	pageContext?: AssistantPageContext;
	/** Klien memutus/membatalkan → giliran dihentikan dan tidak ada yang disimpan. */
	signal?: AbortSignal;
	/** Mode stream (`/chat/stream`): status tool & potongan teks. */
	stream?: {
		onStatus: (toolName: string) => void;
		onDelta: (text: string) => void;
	};
}

/** Kode internal: klien membatalkan sebelum jawaban selesai (tidak dikirim ke siapa pun). */
export const CLIENT_CLOSED = 499;

export type ChatTurnOutcome =
	| { ok: true; value: AssistantChatResponse }
	| {
			ok: false;
			status: 404 | 409 | 422 | 429 | 503 | typeof CLIENT_CLOSED;
			error: string;
			retryAfterSec?: number;
			/** Diisi bila pesan gagal tetap tersimpan (503) agar klien melanjutkan percakapan yang sama. */
			conversationId?: string;
	  };

/** Akses percakapan yang dipakai chat (default: conversation.repo); bisa diganti di test. */
export interface ChatRepo {
	getConversation(
		userId: string,
		conversationId: string,
	): Promise<{ id: string } | null>;
	getRecentMessages: typeof conversationRepo.getRecentMessages;
	appendMessages: typeof conversationRepo.appendMessages;
	startConversation: typeof conversationRepo.startConversation;
}

export interface ChatServiceDeps {
	loadSettings?: () => Promise<AssistantSettingsValues>;
	resolveProvider?: () => Promise<ResolveProviderResult>;
	getUsage?: (userId: string, now: Date) => Promise<UsageToday>;
	rateLimiter?: SlidingWindowRateLimiter;
	tools?: readonly ToolDefinition[];
	repo?: ChatRepo;
	now?: () => Date;
	executeOptions?: Omit<ExecuteOptions, "conversationId">;
}

function fail(
	status: 404 | 409 | 422 | 429 | 503 | typeof CLIENT_CLOSED,
	error: string,
	extra: { retryAfterSec?: number; conversationId?: string } = {},
): ChatTurnOutcome {
	return { ok: false, status, error, ...extra };
}

/** Jalankan satu giliran chat: cek berurutan (murah → mahal), LLM ⇄ tool, lalu simpan. */
export async function runChatTurn(
	input: ChatTurnInput,
	deps: ChatServiceDeps = {},
): Promise<ChatTurnOutcome> {
	const repo = deps.repo ?? conversationRepo;
	const now = deps.now?.() ?? new Date();
	const { user } = input.principal;

	const settings = await (deps.loadSettings ?? getAssistantSettings)();
	if (!settings.enabled) return fail(409, CHAT_MESSAGES.disabled);

	const inputViolation = checkInput(input.message, settings.maxInputChars);
	if (inputViolation) return fail(422, inputViolation.message);

	const resolved = await (
		deps.resolveProvider ?? (() => getProvider("chat"))
	)();
	if (!resolved.ok) return fail(409, CHAT_MESSAGES.notReady);

	const conversationId = input.conversationId;
	if (conversationId && !(await repo.getConversation(user.id, conversationId)))
		return fail(404, CHAT_MESSAGES.notFound);

	const limiter = deps.rateLimiter ?? assistantRateLimiter;
	limiter.prune(now.getTime());
	const rate = limiter.hit(
		user.id,
		settings.ratePerMinutePerUser,
		now.getTime(),
	);
	if (rate)
		return fail(429, rate.message, { retryAfterSec: rate.retryAfterSec });

	const usage = await (deps.getUsage ?? getUsageToday)(user.id, now);
	const quota = checkDailyQuota({ settings, userId: user.id, ...usage, now });
	if (quota)
		return fail(429, quota.message, { retryAfterSec: quota.retryAfterSec });

	const pageRoute = input.pageContext?.route
		? sanitizeInline(input.pageContext.route, PAGE_ROUTE_MAX_CHARS)
		: undefined;
	const ctx: ToolContext = {
		user,
		allowedFeatures: new Set(input.principal.allowedFeatures),
		pageRoute,
		now,
	};
	const tools = scopePointerTools(
		getAvailableTools(ctx, deps.tools ?? ASSISTANT_TOOLS),
		ctx,
	);
	const history = conversationId
		? await repo.getRecentMessages(
				user.id,
				conversationId,
				historyTake(settings.historyWindow),
			)
		: [];
	const messages: ChatMessage[] = [
		{
			role: "system",
			content: buildSystemPrompt({
				assistantName: settings.assistantName,
				personaNote: settings.personaNote,
				userRole: user.role,
				now,
				lang: input.pageContext?.lang ?? "id",
				page: { route: pageRoute, title: input.pageContext?.title },
				unavailableModules: getUnavailableModules(ctx.allowedFeatures),
				hasDataTools: tools.some((t) => t.requiredFeature.startsWith("view-")),
				hasPointerTools: hasPointerTools(tools),
				onWall: isWallRoute(pageRoute),
			}),
		},
		...history,
		{ role: "user", content: input.message },
	];

	const turnInput = {
		userId: user.id,
		conversationId,
		message: input.message,
		pageRoute,
	};
	let turn: Awaited<ReturnType<typeof executeWithTools>>;
	try {
		turn = await executeWithTools(resolved.provider, messages, tools, ctx, {
			...deps.executeOptions,
			conversationId,
			signal: input.signal,
			onStatus: input.stream?.onStatus,
			onDelta: input.stream?.onDelta,
		});
	} catch (err) {
		// Dibatalkan klien: jangan simpan pertanyaan setengah jadi.
		if (input.signal?.aborted)
			return fail(CLIENT_CLOSED, "Client closed request");
		const savedId = await recordFailedTurn(repo, turnInput);
		if (!(err instanceof AiProviderError)) throw err;
		return fail(
			503,
			err.kind === "busy" ? CHAT_MESSAGES.busy : CHAT_MESSAGES.unavailable,
			{ conversationId: savedId ?? undefined },
		);
	}

	const saved = await saveTurn(repo, turnInput, turn);
	if (!saved) return fail(404, CHAT_MESSAGES.notFound);
	return { ok: true, value: { ...saved, actions: turn.actions } };
}
