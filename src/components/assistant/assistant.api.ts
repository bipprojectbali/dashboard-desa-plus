import type {
	AssistantChatRequest,
	AssistantChatResponse,
	AssistantConversationDto,
	AssistantHistoryMessageDto,
	AssistantPage,
	AssistantStatusDto,
} from "@/types/ai-assistant-chat";
import type { ChatFailure } from "./assistant.logic";

/** Klien endpoint `/api/assistant/*` (sesi browser, cookie ikut terkirim). */

const BASE = "/api/assistant";

/** Request gagal: `status` null = jaringan/respons tak terbaca. Tanpa isi pesan pengguna. */
export class AssistantApiError extends Error implements ChatFailure {
	constructor(
		readonly status: number | null,
		message: string,
		readonly retryAfterSec?: number,
		/** Diisi server pada 503 bila pertanyaan tetap tersimpan. */
		readonly conversationId?: string,
	) {
		super(message);
		this.name = "AssistantApiError";
	}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${BASE}${path}`, {
			credentials: "include",
			...init,
			headers: { "Content-Type": "application/json", ...init.headers },
		});
	} catch (err) {
		throw new AssistantApiError(
			null,
			`Network error on ${path}: ${(err as Error).message}`,
		);
	}
	const body = (await res.json().catch(() => null)) as
		| (T & { error?: string; conversationId?: string })
		| null;
	if (!res.ok) {
		const retry = Number(res.headers.get("retry-after"));
		throw new AssistantApiError(
			res.status,
			body?.error ?? `Request ${path} failed (${res.status})`,
			Number.isFinite(retry) && retry > 0 ? retry : undefined,
			body?.conversationId,
		);
	}
	if (body === null)
		throw new AssistantApiError(null, `Invalid JSON response from ${path}`);
	return body;
}

function pageQuery(cursor?: string, limit?: number): string {
	const q = new URLSearchParams();
	if (cursor) q.set("cursor", cursor);
	if (limit) q.set("limit", String(limit));
	const s = q.toString();
	return s ? `?${s}` : "";
}

export function fetchAssistantStatus(): Promise<AssistantStatusDto> {
	return request<AssistantStatusDto>("/status");
}

/** Satu giliran tanya-jawab; riwayat dimuat server, bukan dikirim dari sini. */
export function sendChatMessage(
	body: AssistantChatRequest,
): Promise<AssistantChatResponse> {
	return request<AssistantChatResponse>("/chat", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function fetchConversations(
	cursor?: string,
): Promise<AssistantPage<AssistantConversationDto>> {
	return request(`/conversations${pageQuery(cursor)}`);
}

/** Pesan satu percakapan, terbaru dulu. */
export function fetchMessages(
	conversationId: string,
	cursor?: string,
): Promise<AssistantPage<AssistantHistoryMessageDto>> {
	return request(
		`/conversations/${encodeURIComponent(conversationId)}/messages${pageQuery(cursor)}`,
	);
}

export function renameConversation(
	conversationId: string,
	title: string,
): Promise<AssistantConversationDto> {
	return request(`/conversations/${encodeURIComponent(conversationId)}`, {
		method: "PATCH",
		body: JSON.stringify({ title }),
	});
}

export function deleteConversation(
	conversationId: string,
): Promise<{ ok: true }> {
	return request(`/conversations/${encodeURIComponent(conversationId)}`, {
		method: "DELETE",
	});
}

/** Izin user (dipakai di /profile & /wall yang tidak memuat permissionStore lewat MainLayout). */
export async function fetchMyPermissions(): Promise<string[]> {
	const res = await fetch("/api/my-permissions", { credentials: "include" });
	if (!res.ok)
		throw new AssistantApiError(res.status, "Failed to load permissions");
	const body = (await res.json()) as { allowed?: unknown };
	return Array.isArray(body.allowed)
		? body.allowed.filter((a): a is string => typeof a === "string")
		: [];
}
