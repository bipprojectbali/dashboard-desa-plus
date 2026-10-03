/**
 * Kontrak endpoint percakapan AI assistant (`/api/assistant/chat` &
 * `/api/assistant/conversations/*`), rancangan 04 §3. Dipakai server sekarang
 * dan panel chat (F1-c). Riwayat tidak pernah dikirim klien — server memuatnya.
 */

import type { UiAction } from "./ai-assistant-pointer";

export type AssistantLang = "id" | "en";

/** Cara pesan dikirim: ketik (`text`) atau mode suara (`voice`, ikon 🎙 di riwayat). */
export type AssistantModality = "text" | "voice";

/**
 * Respons `GET /api/assistant/status` — dipakai tombol FAB & panel. Hanya
 * boolean + nama + batas input, tanpa detail kredensial.
 */
export interface AssistantStatusDto {
	enabled: boolean;
	assistantName: string;
	/** Batas panjang pesan (0 = tanpa batas) — untuk penghitung sisa karakter. */
	maxInputChars: number;
	/** `pointer` ikut `chat` bila kosong; `voice` hanya true bila slot voice sendiri siap. */
	slots: { chat: boolean; pointer: boolean; voice: boolean };
	/** Mode suara boleh dipakai: asisten aktif + slot voice siap + izin `use-ai-voice`. */
	voiceAllowed: boolean;
	/** Persetujuan mikrofon sudah diberikan user (tersimpan di DB, sekali per user). */
	voiceConsented: boolean;
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
	/** `voice` = giliran mode suara: wajib `voiceSessionId` aktif, jawaban ringkas tanpa markdown. */
	modality?: AssistantModality;
	voiceSessionId?: string;
}

/** Aksi UI fitur 2 (penunjuk); kosong bila jawaban tidak menunjuk apa pun. */
export type AssistantUiAction = UiAction;

export interface AssistantMessageDto {
	id: string;
	role: "user" | "assistant";
	content: string;
	/** Nama tool sumber data — untuk label "Sumber". */
	toolsUsed: string[];
	modality: AssistantModality;
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
