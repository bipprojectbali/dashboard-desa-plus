import type { AssistantChatResponse } from "@/types/ai-assistant-chat";
import type {
	MessageModality,
	NewMessage,
	SavedMessage,
} from "../conversation/conversation.repo";
import type { TurnResult } from "../tools/executor";
import type { ChatRepo } from "./chat.service";

/** Penyimpanan hasil satu giliran chat — percakapan baru dibuat hanya saat ada yang disimpan. */

export interface TurnInput {
	userId: string;
	conversationId?: string;
	message: string;
	pageRoute?: string;
	modality: MessageModality;
}

/** Tambah ke percakapan lama atau buat baru; null bila percakapan lama sudah bukan milik user. */
async function persist(
	repo: ChatRepo,
	input: TurnInput,
	messages: NewMessage[],
): Promise<{ conversationId: string; messages: SavedMessage[] } | null> {
	if (!input.conversationId)
		return repo.startConversation(input.userId, input.message, messages);
	const saved = await repo.appendMessages(
		input.userId,
		input.conversationId,
		messages,
	);
	return saved && { conversationId: input.conversationId, messages: saved };
}

/** Simpan pertanyaan + jawaban (token, latensi, tool) dan bentuk respons endpoint. */
export async function saveTurn(
	repo: ChatRepo,
	input: TurnInput,
	turn: TurnResult,
): Promise<Omit<AssistantChatResponse, "actions"> | null> {
	const saved = await persist(repo, input, [
		{
			role: "user",
			content: input.message,
			pageRoute: input.pageRoute,
			modality: input.modality,
		},
		{
			role: "assistant",
			content: turn.text,
			toolsUsed: turn.toolsUsed,
			pageRoute: input.pageRoute,
			modality: input.modality,
			inputTokens: turn.usage.inputTokens,
			outputTokens: turn.usage.outputTokens,
			latencyMs: turn.latencyMs,
		},
	]);
	const reply = saved?.messages.find((m) => m.role === "assistant");
	if (!saved || !reply) return null;
	return {
		conversationId: saved.conversationId,
		message: {
			id: reply.id,
			role: "assistant",
			content: reply.content,
			toolsUsed: reply.toolsUsed,
			modality: reply.modality === "voice" ? "voice" : "text",
			createdAt: reply.createdAt.toISOString(),
		},
	};
}

/**
 * Catat pertanyaan yang gagal dijawab (status "error"): muncul sebagai
 * "error terakhir" di statistik admin, tapi tidak dihitung kuota dan tidak
 * masuk riwayat LLM. Mengembalikan id percakapan, atau null bila tidak tersimpan.
 */
export async function recordFailedTurn(
	repo: ChatRepo,
	input: TurnInput,
): Promise<string | null> {
	const saved = await persist(repo, input, [
		{
			role: "user",
			content: input.message,
			pageRoute: input.pageRoute,
			modality: input.modality,
			status: "error",
		},
	]);
	return saved?.conversationId ?? null;
}
