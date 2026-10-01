import { proxy } from "valtio";
import type {
	AssistantHistoryMessageDto,
	AssistantMessageDto,
	AssistantPage,
} from "@/types/ai-assistant-chat";

/**
 * State panel AI assistant. Sengaja di level modul (bukan state komponen):
 * menutup panel — termasuk penutupan sementara saat Fitur 2 menunjuk elemen —
 * tidak boleh mereset percakapan. Hanya "Percakapan baru" yang mengosongkan.
 */

export interface ChatBubble {
	id: string;
	role: "user" | "assistant";
	content: string;
	toolsUsed: readonly string[];
	/** Pertanyaan yang gagal dijawab (status "error" di server). */
	failed?: boolean;
}

interface AssistantState {
	open: boolean;
	maximized: boolean;
	view: "chat" | "list";
	conversationId: string | null;
	messages: ChatBubble[];
	/** Cursor pesan lebih lama di server; null = sudah semua. */
	olderCursor: string | null;
	pending: boolean;
	error: string | null;
	/** Teks pertanyaan terakhir yang gagal — untuk tombol "Kirim ulang". */
	retryText: string | null;
}

const initialConversation = () => ({
	conversationId: null,
	messages: [] as ChatBubble[],
	olderCursor: null,
	error: null,
	retryText: null,
});

export const assistantStore = proxy<AssistantState>({
	open: false,
	maximized: false,
	view: "chat",
	pending: false,
	...initialConversation(),
});

export function openAssistant() {
	assistantStore.open = true;
}

/** Tutup panel tanpa menyentuh percakapan. */
export function closeAssistant() {
	assistantStore.open = false;
}

export function toggleMaximized() {
	assistantStore.maximized = !assistantStore.maximized;
}

export function setAssistantView(view: AssistantState["view"]) {
	assistantStore.view = view;
}

export function startNewConversation() {
	Object.assign(assistantStore, initialConversation(), { view: "chat" });
}

/** Riwayat server (terbaru dulu) → bubble urut lama → baru. */
export function historyToBubbles(
	items: readonly AssistantHistoryMessageDto[],
): ChatBubble[] {
	return [...items].reverse().map((m) => ({
		id: m.id,
		role: m.role,
		content: m.content,
		toolsUsed: [...m.toolsUsed],
		failed: m.status === "error" || undefined,
	}));
}

/** Tampilkan percakapan dari halaman pesan terbaru. */
export function showConversation(
	conversationId: string,
	page: AssistantPage<AssistantHistoryMessageDto>,
) {
	Object.assign(assistantStore, initialConversation(), {
		conversationId,
		messages: historyToBubbles(page.items),
		olderCursor: page.nextCursor,
		view: "chat",
	});
}

/** Sisipkan pesan lebih lama di atas daftar. */
export function prependOlderMessages(
	page: AssistantPage<AssistantHistoryMessageDto>,
) {
	assistantStore.messages.unshift(...historyToBubbles(page.items));
	assistantStore.olderCursor = page.nextCursor;
}

export function addUserBubble(id: string, content: string) {
	assistantStore.messages.push({ id, role: "user", content, toolsUsed: [] });
	assistantStore.pending = true;
	assistantStore.error = null;
	assistantStore.retryText = null;
}

export function receiveAnswer(
	conversationId: string,
	message: AssistantMessageDto,
) {
	assistantStore.conversationId = conversationId;
	assistantStore.messages.push({
		id: message.id,
		role: "assistant",
		content: message.content,
		toolsUsed: [...message.toolsUsed],
	});
	assistantStore.pending = false;
}

/** Tandai pertanyaan gagal; percakapan yang tersimpan di server (503) tetap dipakai. */
export function failQuestion(
	bubbleId: string,
	error: string,
	text: string,
	conversationId?: string,
) {
	const bubble = assistantStore.messages.find((m) => m.id === bubbleId);
	if (bubble) bubble.failed = true;
	if (conversationId) assistantStore.conversationId = conversationId;
	assistantStore.pending = false;
	assistantStore.error = error;
	assistantStore.retryText = text;
}

export function setAssistantError(error: string | null) {
	assistantStore.error = error;
}
