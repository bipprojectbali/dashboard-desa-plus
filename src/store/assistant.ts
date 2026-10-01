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
	/** Mode stream: tool yang sedang berjalan (null = belum/tidak ada). */
	streamStatus: string | null;
	/** Mode stream: teks jawaban yang sedang mengalir. */
	streamingText: string;
	/** Id bubble pertanyaan yang sedang menunggu jawaban; jawaban giliran lain diabaikan. */
	turnId: string | null;
}

const initialConversation = () => ({
	conversationId: null,
	messages: [] as ChatBubble[],
	olderCursor: null,
	error: null,
	retryText: null,
	pending: false,
	streamStatus: null,
	streamingText: "",
	turnId: null,
});

export const assistantStore = proxy<AssistantState>({
	open: false,
	maximized: false,
	view: "chat",
	...initialConversation(),
});

/** Pengendali pembatalan giliran aktif (di luar proxy: bukan state tampilan). */
let activeTurn: AbortController | null = null;

/** Mulai giliran baru; giliran sebelumnya (bila masih berjalan) dibatalkan. */
export function beginTurn(): AbortController {
	activeTurn?.abort();
	activeTurn = new AbortController();
	return activeTurn;
}

/** Batalkan giliran yang sedang berjalan (tombol batal, ganti/buat percakapan). */
export function cancelActiveTurn() {
	activeTurn?.abort();
	activeTurn = null;
}

/** Giliran ini masih yang ditunggu panel (belum dibatalkan/diganti percakapan). */
export function isCurrentTurn(bubbleId: string): boolean {
	return assistantStore.turnId === bubbleId;
}

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
	cancelActiveTurn();
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
	cancelActiveTurn();
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
	assistantStore.turnId = id;
	clearStream();
}

function clearStream() {
	assistantStore.streamStatus = null;
	assistantStore.streamingText = "";
}

/** Tool mulai berjalan: teks yang sudah mengalir bukan jawaban akhir, dibuang. */
export function setStreamStatus(bubbleId: string, tool: string) {
	if (!isCurrentTurn(bubbleId)) return;
	assistantStore.streamStatus = tool;
	assistantStore.streamingText = "";
}

export function appendStreamDelta(bubbleId: string, text: string) {
	if (isCurrentTurn(bubbleId)) assistantStore.streamingText += text;
}

/** Jawaban akhir (dari `done`/`/chat`) menggantikan teks yang mengalir. */
export function receiveAnswer(
	bubbleId: string,
	conversationId: string,
	message: AssistantMessageDto,
) {
	if (!isCurrentTurn(bubbleId)) return;
	clearStream();
	assistantStore.turnId = null;
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
	if (!isCurrentTurn(bubbleId)) return;
	clearStream();
	assistantStore.turnId = null;
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
