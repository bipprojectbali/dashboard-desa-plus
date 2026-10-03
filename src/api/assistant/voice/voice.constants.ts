/**
 * Konstanta server mode suara (S1) — dipakai panel Jenna dan halaman uji
 * voice-lab. Ambang sesi/kuota yang bisa diubah admin ada di
 * `AssistantSettings` (lihat `VOICE_SETTINGS_DEFAULTS`).
 */

import { VOICE_HEARTBEAT_INTERVAL_MS } from "@/types/ai-assistant-voice";

/** Batas waktu permintaan ke OpenAI yang bukan streaming audio. */
export const VOICE_UPSTREAM_TIMEOUT_MS = 20_000;

/** Batas ukuran SDP tawaran browser. */
export const VOICE_SDP_MAX_CHARS = 64 * 1024;

/**
 * Sesi tanpa heartbeat selama 3× interval dianggap selesai (tab ditutup,
 * jaringan putus): kunci "satu sesi aktif" dilepas dan sesi ditagih sampai
 * heartbeat terakhir.
 */
export const VOICE_STALE_AFTER_MS = VOICE_HEARTBEAT_INTERVAL_MS * 3;

/** Header identitas pengguna untuk moderasi OpenAI (nilai = hash ID user, bukan email). */
export const SAFETY_IDENTIFIER_HEADER = "OpenAI-Safety-Identifier";

export const VOICE_SLOT_MESSAGES = {
	slotEmpty:
		"Slot Suara belum diisi — isi Base URL dan API key di /admin/ai-assistant (slot Suara). Mode suara tidak memakai slot Chat.",
	slotDisabled: "Slot Suara tidak aktif — aktifkan di /admin/ai-assistant",
	cryptoMissing: "AI_CREDENTIALS_KEY belum diset di server",
	needsReentry: "API key slot Suara perlu diisi ulang (tidak bisa didekripsi)",
	upstreamUnreachable: "Tidak bisa menghubungi OpenAI (jaringan/timeout)",
	upstreamRejected: "OpenAI menolak permintaan",
	upstreamBadShape: "Respons OpenAI tidak sesuai bentuk yang diharapkan",
	invalidInput: "Input tidak valid",
} as const;

export const VOICE_SESSION_MESSAGES = {
	disabled: "Asisten AI sedang dinonaktifkan admin.",
	consentRequired: "Setujui penggunaan mikrofon terlebih dahulu.",
	quotaExhausted: "Kuota menit suara hari ini sudah habis.",
	sessionActive:
		"Mode suara sedang aktif di tab atau perangkat lain. Matikan di sana dulu.",
	notFound: "Sesi suara tidak ditemukan.",
	ended: "Sesi suara sudah berakhir.",
} as const;
