import { LIVE_INSTRUCTIONS_MAX } from "@/config/assistant-identity";
import { VOICE_SDP_MAX_CHARS } from "../voice/voice.constants";

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

/** Batas waktu penuh satu permintaan TTS (header + badan audio). */
export const VOICE_LAB_TTS_TIMEOUT_MS = 60_000;

/** Batas input (dokumen OpenAI: `input` TTS maksimum 4096 karakter). */
export const VOICE_LAB_LIMITS = {
	ttsTextMax: 4000,
	instructionsMax: LIVE_INSTRUCTIONS_MAX,
	sdpMax: VOICE_SDP_MAX_CHARS,
} as const;

/** Pola nama (allowlist sederhana): bukan daftar tetap supaya model baru bisa dicoba tanpa deploy. */
export const VOICE_LAB_PATTERNS = {
	model: /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,
	voice: /^[a-z][a-z0-9_-]{1,31}$/,
	language: /^[a-z]{2,3}$/,
} as const;
