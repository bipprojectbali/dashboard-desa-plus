/**
 * Kontrak mode suara Jenna (Fitur 3, S1): endpoint `/api/assistant/voice/*`,
 * default & batas setelan suara (sama dengan default schema.prisma), dipakai
 * server, panel, dan form admin.
 */

/** Default setelan suara — harus sama dengan default kolom di schema.prisma. */
export const VOICE_SETTINGS_DEFAULTS = {
	voiceDailyMinutesUser: 60,
	voiceDailyMinutesKiosk: 60,
	voiceSessionMaxMinutes: 10,
	voiceIdleOffSeconds: 120,
	voiceLiveModel: "gpt-live-1",
	voiceName: null,
	voiceReadExactInstruction: null,
} as const;

/** Rentang yang boleh diisi admin. Menit harian 0 = tanpa batas. */
export const VOICE_SETTINGS_LIMITS = {
	dailyMinutesMax: 1440,
	sessionMaxMinutesMin: 1,
	sessionMaxMinutesMax: 60,
	idleOffSecondsMin: 30,
	idleOffSecondsMax: 600,
} as const;

/** Pola nama model & suara GPT-Live (allowlist sederhana, bukan daftar tetap). */
export const VOICE_NAME_PATTERNS = {
	model: /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,
	voice: /^[a-z][a-z0-9_-]{1,31}$/,
} as const;

/** Detak jantung klien → server selama sesi suara aktif. */
export const VOICE_HEARTBEAT_INTERVAL_MS = 15_000;

/** Perpanjangan sesi per tekan tombol "Perpanjang". */
export const VOICE_EXTEND_SECONDS = 60;

/** Alasan sesi berakhir yang dikirim klien saat menutup sesi. */
export const VOICE_CLIENT_END_REASONS = [
	"user",
	"idle",
	"max_duration",
	"quota",
	"error",
	"page_hidden",
] as const;
export type VoiceClientEndReason = (typeof VOICE_CLIENT_END_REASONS)[number];

/** Kode galat endpoint suara — dipetakan ke teks i18n di panel. */
export type VoiceErrorCode =
	| "voice_forbidden"
	| "voice_disabled"
	| "voice_slot_empty"
	| "voice_slot_disabled"
	| "crypto_unconfigured"
	| "key_unreadable"
	| "voice_quota_exhausted"
	| "voice_session_active"
	| "voice_consent_required"
	| "voice_session_not_found"
	| "voice_session_ended"
	| "upstream_failed"
	| "invalid_input";

export interface VoiceErrorBody {
	error: string;
	code?: VoiceErrorCode;
}

/** `POST /api/assistant/voice/sessions` → sesi WebRTC siap dipasang. */
export interface VoiceSessionStartResponse {
	sessionId: string;
	/** SDP jawaban GPT-Live untuk `setRemoteDescription`. */
	sdp: string;
	/** Batas sesi (detik) termasuk perpanjangan. */
	maxSeconds: number;
	idleOffSeconds: number;
	/** Sisa menit hari ini (detik); null = tanpa batas. */
	remainingTodaySeconds: number | null;
}

/** Balasan heartbeat; `stop` ≠ null = klien harus menutup sesi. */
export interface VoiceHeartbeatResponse {
	elapsedSeconds: number;
	maxSeconds: number;
	remainingTodaySeconds: number | null;
	stop: "quota" | "max_duration" | "ended" | null;
}

export interface VoiceExtendResponse {
	maxSeconds: number;
}

export interface VoiceCloseResponse {
	billedSeconds: number;
}

/** Bagian status asisten untuk mode suara (`GET /api/assistant/status`). */
export interface VoiceConsentDto {
	accepted: boolean;
}
