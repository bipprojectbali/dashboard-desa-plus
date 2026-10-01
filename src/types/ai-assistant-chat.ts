/**
 * Kontrak endpoint percakapan AI assistant (`/api/assistant/chat` &
 * `/api/assistant/conversations/*`), rancangan 04 §3. Dipakai server sekarang
 * dan panel chat (F1-c). Riwayat tidak pernah dikirim klien — server memuatnya.
 */

export type AssistantLang = "id" | "en";

/**
 * Respons `GET /api/assistant/status` — dipakai tombol FAB & panel. Hanya
 * boolean + nama + batas input, tanpa detail kredensial.
 */
export interface AssistantStatusDto {
	enabled: boolean;
	assistantName: string;
	/** Batas panjang pesan (0 = tanpa batas) — untuk penghitung sisa karakter. */
	maxInputChars: number;
	slots: { chat: boolean; pointer: boolean; voice: boolean };
}

export interface AssistantPageContext {
	route: string;
	title?: string;
	lang?: AssistantLang;
}

export interface AssistantChatRequest {
	conversationId?: string;
	message: string;
	pageContext?: AssistantPageContext;
}

/** Aksi UI untuk fitur 2 (penunjuk); selalu kosong di MVP fitur 1. */
export type AssistantUiAction = never;

export interface AssistantMessageDto {
	id: string;
	role: "user" | "assistant";
	content: string;
	/** Nama tool sumber data — untuk label "Sumber". */
	toolsUsed: string[];
	/** ISO 8601. */
	createdAt: string;
}

export interface AssistantChatResponse {
	conversationId: string;
	message: AssistantMessageDto & { role: "assistant" };
	actions: AssistantUiAction[];
}

export interface AssistantConversationDto {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

/** Pesan di riwayat; `status` "error" = pertanyaan yang gagal dijawab. */
export interface AssistantHistoryMessageDto extends AssistantMessageDto {
	pageRoute: string | null;
	status: string;
}

export interface AssistantPage<T> {
	items: T[];
	/** Kirim sebagai `cursor` untuk halaman berikutnya; null = habis. */
	nextCursor: string | null;
}
