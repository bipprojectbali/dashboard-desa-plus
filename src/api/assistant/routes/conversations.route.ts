import Elysia, { t } from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import type {
	AssistantConversationDto,
	AssistantHistoryMessageDto,
	AssistantPage,
} from "@/types/ai-assistant-chat";
import logger from "@/utils/logger";
import {
	toConversationDto,
	toMessageDto,
} from "../conversation/conversation.dto";
import {
	deleteConversation,
	getConversation,
	listConversations,
	listMessages,
	PAGE_SIZE_MAX,
	renameConversation,
} from "../conversation/conversation.repo";
import { checkAssistantUser } from "../http/access";

/**
 * `/api/assistant/conversations/*` — riwayat milik user sendiri (berhalaman
 * cursor). Id milik user lain → 404 (bukan 403) agar keberadaannya tidak bocor.
 */

const NOT_FOUND = { error: "Percakapan tidak ditemukan." } as const;
/** Rancangan 04 §3: pesan default 50 per halaman (percakapan default 20 dari repo). */
const MESSAGES_PAGE_DEFAULT = PAGE_SIZE_MAX;

const idParams = t.Object({ id: t.String({ minLength: 1, maxLength: 64 }) });
const pageQuery = t.Object({
	cursor: t.Optional(t.String({ maxLength: 64 })),
	limit: t.Optional(t.Numeric({ minimum: 1 })),
});

export const assistantConversationsApi = new Elysia({
	prefix: "/assistant/conversations",
})
	.use(apiMiddleware)
	.onBeforeHandle(async ({ user, set }) => {
		const denied = await checkAssistantUser(user);
		if (denied) {
			set.status = denied.status;
			return { error: denied.error };
		}
	})
	.onError(({ error, code, set, request }) => {
		if (code === "VALIDATION" || code === "NOT_FOUND") return;
		logger.error(
			{
				err: error,
				method: request.method,
				path: new URL(request.url).pathname,
			},
			"[ASSISTANT] Conversation request failed",
		);
		set.status = 500;
		return { error: "Terjadi kesalahan server" };
	})
	.get(
		"/",
		async ({
			user,
			query,
		}): Promise<AssistantPage<AssistantConversationDto>> => {
			const page = await listConversations(user?.id ?? "", query);
			return {
				items: page.items.map(toConversationDto),
				nextCursor: page.nextCursor,
			};
		},
		{
			query: pageQuery,
			detail: { summary: "List own assistant conversations" },
		},
	)
	.get(
		"/:id/messages",
		async ({ user, params, query, set }) => {
			const page = await listMessages(user?.id ?? "", params.id, {
				cursor: query.cursor,
				limit: query.limit ?? MESSAGES_PAGE_DEFAULT,
			});
			if (!page) {
				set.status = 404;
				return NOT_FOUND;
			}
			const result: AssistantPage<AssistantHistoryMessageDto> = {
				items: page.items.map(toMessageDto),
				nextCursor: page.nextCursor,
			};
			return result;
		},
		{
			params: idParams,
			query: pageQuery,
			detail: { summary: "Messages of one own conversation, newest first" },
		},
	)
	.patch(
		"/:id",
		async ({ user, params, body, set }) => {
			const userId = user?.id ?? "";
			if (!body.title.trim()) {
				set.status = 422;
				return { error: "Judul tidak boleh kosong." };
			}
			const conv = (await renameConversation(userId, params.id, body.title))
				? await getConversation(userId, params.id)
				: null;
			if (!conv) {
				set.status = 404;
				return NOT_FOUND;
			}
			return toConversationDto(conv);
		},
		{
			params: idParams,
			body: t.Object({ title: t.String({ maxLength: 500 }) }),
			detail: { summary: "Rename own conversation" },
		},
	)
	.delete(
		"/:id",
		async ({ user, params, set }) => {
			if (!(await deleteConversation(user?.id ?? "", params.id))) {
				set.status = 404;
				return NOT_FOUND;
			}
			return { ok: true };
		},
		{ params: idParams, detail: { summary: "Delete own conversation" } },
	);
