/**
 * Konstanta halaman uji suara S0 (sekali pakai). Nama model & suara hanyalah
 * contoh dari docs OpenAI per 2026-10-02 (06-fitur-3-suara §13) — bisa diganti
 * di halaman uji; server hanya memvalidasi pola, bukan daftar tetap.
 */

export const VOICE_LAB_DEFAULTS = {
	transcribeModel: "gpt-live-transcribe",
	transcribeLanguage: "id",
	transcribeDelay: "low",
	ttsModel: "gpt-4o-mini-tts",
	ttsVoice: "coral",
	liveModel: "gpt-live-1",
} as const;

/** Pilihan awal di dropdown halaman uji (nama bebas lain tetap boleh via pola). */
export const VOICE_LAB_SUGGESTIONS = {
	transcribeModels: ["gpt-live-transcribe", "gpt-transcribe"],
	ttsModels: ["gpt-4o-mini-tts"],
	ttsVoices: [
		"alloy",
		"ash",
		"ballad",
		"coral",
		"echo",
		"fable",
		"nova",
		"onyx",
		"sage",
		"shimmer",
		"verse",
	],
	liveModels: ["gpt-live-1"],
	transcribeDelays: ["minimal", "low", "medium", "high", "xhigh"],
} as const;

/** Masa hidup token sementara — hanya perlu cukup untuk membuka koneksi WebRTC. */
export const VOICE_LAB_TOKEN_TTL_SECONDS = 120;

/** Batas waktu permintaan ke OpenAI yang bukan streaming audio. */
export const VOICE_LAB_UPSTREAM_TIMEOUT_MS = 20_000;
/** Batas waktu penuh satu permintaan TTS (header + badan audio). */
export const VOICE_LAB_TTS_TIMEOUT_MS = 60_000;

/** Batas input (dokumen OpenAI: `input` TTS maksimum 4096 karakter). */
export const VOICE_LAB_LIMITS = {
	ttsTextMax: 4000,
	instructionsMax: 500,
	sdpMax: 64 * 1024,
} as const;

/** Pola nama (allowlist sederhana): bukan daftar tetap supaya model baru bisa dicoba tanpa deploy. */
export const VOICE_LAB_PATTERNS = {
	model: /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,
	voice: /^[a-z][a-z0-9_-]{1,31}$/,
	language: /^[a-z]{2,3}$/,
} as const;

export const VOICE_LAB_MESSAGES = {
	slotEmpty:
		"Slot Suara belum diisi — isi Base URL dan API key di /admin/ai-assistant (slot Suara). Halaman uji tidak memakai slot Chat.",
	slotDisabled: "Slot Suara tidak aktif — aktifkan di /admin/ai-assistant",
	cryptoMissing: "AI_CREDENTIALS_KEY belum diset di server",
	needsReentry: "API key slot Suara perlu diisi ulang (tidak bisa didekripsi)",
	invalidInput: "Input tidak valid",
	upstreamUnreachable: "Tidak bisa menghubungi OpenAI (jaringan/timeout)",
	upstreamRejected: "OpenAI menolak permintaan",
	upstreamBadShape: "Respons OpenAI tidak sesuai bentuk yang diharapkan",
} as const;

/** Header identitas pengguna untuk moderasi OpenAI (nilai = hash ID user, bukan email). */
export const SAFETY_IDENTIFIER_HEADER = "OpenAI-Safety-Identifier";
