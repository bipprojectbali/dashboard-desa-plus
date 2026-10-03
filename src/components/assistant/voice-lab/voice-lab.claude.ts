import { AssistantApiError } from "../assistant.api";
import { streamChatMessage } from "../assistant-stream.api";

/** Satu pertanyaan ke Claude lewat `/api/assistant/chat/stream` (memakai kuota chat sungguhan). */

export interface ClaudeHandlers {
	onStatus(tool: string): void;
	onDelta(text: string): void;
}

export interface ClaudeAnswer {
	conversationId: string;
	text: string;
	actionCount: number;
}

export async function askClaude(
	message: string,
	conversationId: string | undefined,
	handlers: ClaudeHandlers,
	signal: AbortSignal,
): Promise<ClaudeAnswer> {
	const res = await streamChatMessage(
		{ message, conversationId },
		{ onStatus: handlers.onStatus, onDelta: handlers.onDelta },
		signal,
	);
	return {
		conversationId: res.conversationId,
		text: res.message.content,
		actionCount: res.actions.length,
	};
}

/** Pesan galat yang aman ditampilkan (tanpa isi percakapan). */
export function describeError(err: unknown): string {
	if (err instanceof AssistantApiError) {
		const retry = err.retryAfterSec
			? ` (coba lagi ${err.retryAfterSec} dtk)`
			: "";
		return `${err.message}${retry}`;
	}
	return err instanceof Error ? err.message : "Terjadi kesalahan";
}

export function isAbort(err: unknown): boolean {
	return err instanceof DOMException && err.name === "AbortError";
}
