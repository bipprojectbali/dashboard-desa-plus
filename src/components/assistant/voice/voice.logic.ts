import type { AssistantText } from "@/locales/assistant";
import type { AssistantVoiceText } from "@/locales/assistant-voice";
import type { VoiceBeat, VoiceStatus } from "@/store/assistant-voice";
import {
	VOICE_EXTEND_SECONDS,
	type VoiceClientEndReason,
	type VoiceHeartbeatResponse,
} from "@/types/ai-assistant-voice";
import { fillTemplate, formatRetryAfter } from "../assistant.logic";
import { VoiceApiError } from "./voice.api";

/** Logika murni mode suara panel: status, sisa waktu, ajakan perpanjang, pesan galat. */

/** Penyebab sesi berhenti sendiri (bukan tombol Off). */
export type VoiceStopCause = "idle" | "max_duration" | "quota" | "ended";

/** Sisa detik yang ditampilkan = yang lebih dulu habis: batas sesi atau jatah hari ini. */
export function remainingSeconds(beat: VoiceBeat): number {
	const session = Math.max(0, beat.maxSeconds - beat.elapsedSeconds);
	return beat.remainingTodaySeconds === null
		? session
		: Math.max(0, Math.min(session, beat.remainingTodaySeconds));
}

/** Ajak perpanjang hanya bila batas sesi yang akan habis (bukan jatah harian). */
export function shouldInviteExtend(beat: VoiceBeat): boolean {
	const session = beat.maxSeconds - beat.elapsedSeconds;
	if (session <= 0 || session > VOICE_EXTEND_SECONDS) return false;
	return (
		beat.remainingTodaySeconds === null || beat.remainingTodaySeconds > session
	);
}

/** Laporan server terakhir digeser `driftSeconds` detik (hitung mundur lokal antar-heartbeat). */
export function projectBeat(beat: VoiceBeat, driftSeconds: number): VoiceBeat {
	const drift = Math.max(0, Math.floor(driftSeconds));
	return {
		elapsedSeconds: beat.elapsedSeconds + drift,
		maxSeconds: beat.maxSeconds,
		remainingTodaySeconds:
			beat.remainingTodaySeconds === null
				? null
				: Math.max(0, beat.remainingTodaySeconds - drift),
	};
}

/** Mati otomatis bila hening `idleOffSeconds`; tidak saat sedang menjawab. */
export function isIdleTimeout(
	status: VoiceStatus,
	lastActivityMs: number,
	nowMs: number,
	idleOffSeconds: number,
): boolean {
	if (status === "off" || status === "answering" || idleOffSeconds <= 0)
		return false;
	return nowMs - lastActivityMs >= idleOffSeconds * 1000;
}

/** Perintah berhenti dari heartbeat → alasan tutup ke server (null = server sudah menutup). */
export function stopCloseReason(
	stop: NonNullable<VoiceHeartbeatResponse["stop"]>,
): VoiceClientEndReason | null {
	return stop === "ended" ? null : stop;
}

/** "m:ss" untuk indikator sisa sesi. */
export function formatClock(seconds: number): string {
	const s = Math.max(0, Math.floor(seconds));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Tombol suara dinonaktifkan dengan alasan; null = boleh dipakai. */
export function voiceDisabledReason(
	supported: boolean,
	t: AssistantVoiceText,
): string | null {
	return supported ? null : t.unsupported;
}

const SLOT_CODES = new Set([
	"voice_disabled",
	"voice_slot_empty",
	"voice_slot_disabled",
	"crypto_unconfigured",
	"key_unreadable",
]);

/** Galat start/sesi → kalimat sederhana untuk user (tanpa detail teknis). */
export function voiceErrorMessage(
	err: unknown,
	t: AssistantVoiceText,
	text: AssistantText,
): string {
	if (err instanceof DOMException && err.name === "NotAllowedError")
		return t.errors.micDenied;
	if (!(err instanceof VoiceApiError)) return t.errors.connectionLost;
	if (err.status === null) return t.errors.connectionLost;
	if (err.status === 429 || err.code === "voice_quota_exhausted")
		return fillTemplate(t.errors.quota, {
			durasi: formatRetryAfter(err.retryAfterSec ?? 0, text),
		});
	if (err.code && SLOT_CODES.has(err.code)) return t.errors.slotEmpty;
	if (err.code === "voice_session_active") return t.errors.secondTab;
	if (err.code === "voice_forbidden" || err.status === 403)
		return t.errors.forbidden;
	if (
		err.code === "voice_session_ended" ||
		err.code === "voice_session_not_found"
	)
		return t.ended.closed;
	return t.errors.failed;
}

/** Pesan saat sesi berhenti sendiri. */
export function voiceStopMessage(
	cause: VoiceStopCause,
	t: AssistantVoiceText,
): string {
	if (cause === "idle") return t.ended.idle;
	if (cause === "max_duration") return t.ended.maxDuration;
	if (cause === "quota") return t.ended.quota;
	return t.ended.closed;
}
