import type {
	AssistantChatRequest,
	AssistantChatResponse,
} from "@/types/ai-assistant-chat";
import { readSseStream } from "@/utils/sse-parser";
import { AssistantApiError, sendChatMessage } from "./assistant.api";

/**
 * Klien `POST /api/assistant/chat/stream` (fetch + ReadableStream; bukan
 * EventSource karena POST). `askAssistant` mencoba stream dulu dan jatuh
 * ke `/chat` hanya bila stream tidak tersedia SEBELUM ada event diterima.
 */

/** Stream tidak bisa dipakai (endpoint tidak ada, bukan text/event-stream, gagal tersambung). */
export class StreamUnavailableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "StreamUnavailableError";
	}
}

export interface StreamHandlers {
	/** Tool mulai berjalan; teks yang sudah mengalir sebelumnya bukan jawaban akhir. */
	onStatus: (tool: string) => void;
	onDelta: (text: string) => void;
}

interface StreamErrorData {
	status?: number;
	error?: string;
	retryAfterSec?: number;
	conversationId?: string;
}

export async function streamChatMessage(
	body: AssistantChatRequest,
	handlers: StreamHandlers,
	signal?: AbortSignal,
): Promise<AssistantChatResponse> {
	let res: Response;
	try {
		res = await fetch("/api/assistant/chat/stream", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal,
		});
	} catch (err) {
		if (signal?.aborted) throw err;
		throw new StreamUnavailableError(
			`Stream connect failed: ${(err as Error).message}`,
		);
	}
	if (res.status === 404 || res.status === 405)
		throw new StreamUnavailableError(
			`Stream endpoint unavailable (${res.status})`,
		);
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as StreamErrorData;
		const retry = Number(res.headers.get("retry-after"));
		throw new AssistantApiError(
			res.status,
			data.error ?? `Stream request failed (${res.status})`,
			Number.isFinite(retry) && retry > 0 ? retry : undefined,
		);
	}
	if (
		!res.body ||
		!res.headers.get("content-type")?.includes("text/event-stream")
	)
		throw new StreamUnavailableError("Response is not an event stream");

	let done: AssistantChatResponse | null = null;
	let failure: AssistantApiError | null = null;
	await readSseStream(res.body, ({ event, data }) => {
		let payload: unknown;
		try {
			payload = JSON.parse(data);
		} catch {
			failure = new AssistantApiError(null, `Invalid ${event} event`);
			return;
		}
		if (event === "status")
			handlers.onStatus(String((payload as { tool?: unknown }).tool ?? ""));
		else if (event === "delta")
			handlers.onDelta(String((payload as { text?: unknown }).text ?? ""));
		else if (event === "done") done = payload as AssistantChatResponse;
		else if (event === "error") {
			const e = payload as StreamErrorData;
			failure = new AssistantApiError(
				e.status ?? null,
				e.error ?? "Stream error",
				e.retryAfterSec,
				e.conversationId,
			);
		}
	});
	if (failure) throw failure;
	if (done) return done;
	throw new AssistantApiError(null, "Stream ended without a result");
}

export interface AskApi {
	stream: typeof streamChatMessage;
	send: typeof sendChatMessage;
}

/** Tanya asisten: stream dulu, lalu `/chat` bila stream tidak tersedia (bukan bila gagal di tengah). */
export async function askAssistant(
	body: AssistantChatRequest,
	handlers: StreamHandlers,
	signal?: AbortSignal,
	api: AskApi = { stream: streamChatMessage, send: sendChatMessage },
): Promise<AssistantChatResponse> {
	try {
		return await api.stream(body, handlers, signal);
	} catch (err) {
		if (err instanceof StreamUnavailableError && !signal?.aborted)
			return api.send(body, signal);
		throw err;
	}
}
