import type { AssistantSettingsValues } from "../config/settings.repo";
import { VOICE_STALE_AFTER_MS } from "./voice.constants";

/**
 * Aturan menit suara (murni, tanpa DB): batas harian per WITA (kiosk punya
 * batas sendiri, 0 = tanpa batas), batas per sesi + perpanjangan, sesi basi,
 * dan detik yang ditagih. Menit dihitung dari waktu nyata server, bukan
 * laporan klien.
 */

export type VoiceSessionStatus = "starting" | "active" | "ended" | "failed";

export interface VoiceSessionRow {
	id: string;
	userId: string;
	status: string;
	startedAt: Date;
	lastHeartbeatAt: Date;
	endedAt: Date | null;
	billedSeconds: number;
	extendedSeconds: number;
	endReason: string | null;
}

type VoiceQuotaSettings = Pick<
	AssistantSettingsValues,
	| "kioskUserId"
	| "voiceDailyMinutesUser"
	| "voiceDailyMinutesKiosk"
	| "voiceSessionMaxMinutes"
>;

/** Batas detik suara harian untuk user ini; null = tanpa batas (setelan 0). */
export function dailyVoiceLimitSeconds(
	settings: VoiceQuotaSettings,
	userId: string,
): number | null {
	const isKiosk =
		settings.kioskUserId !== null && settings.kioskUserId === userId;
	const minutes = isKiosk
		? settings.voiceDailyMinutesKiosk
		: settings.voiceDailyMinutesUser;
	return minutes > 0 ? minutes * 60 : null;
}

/** Batas satu sesi (detik) termasuk perpanjangan manual. */
export function sessionMaxSeconds(
	settings: VoiceQuotaSettings,
	extendedSeconds: number,
): number {
	return settings.voiceSessionMaxMinutes * 60 + extendedSeconds;
}

/** Sesi masih tercatat terbuka (belum ditutup/gagal). */
export function isOpenSession(row: VoiceSessionRow): boolean {
	return (
		(row.status === "starting" || row.status === "active") &&
		row.endedAt === null
	);
}

/** Terbuka tetapi heartbeat terakhir sudah lewat ambang basi → dianggap selesai. */
export function isStaleSession(row: VoiceSessionRow, now: Date): boolean {
	return (
		isOpenSession(row) &&
		now.getTime() - row.lastHeartbeatAt.getTime() > VOICE_STALE_AFTER_MS
	);
}

/** Detik berjalan sejak sesi dimulai sampai `until` (tidak negatif). */
export function elapsedSeconds(row: VoiceSessionRow, until: Date): number {
	return Math.max(
		0,
		Math.floor((until.getTime() - row.startedAt.getTime()) / 1000),
	);
}

/** Detik yang ditagih saat sesi ditutup di `until`: waktu nyata, maksimal batas sesi. */
export function billableSeconds(
	row: VoiceSessionRow,
	until: Date,
	settings: VoiceQuotaSettings,
): number {
	return Math.min(
		elapsedSeconds(row, until),
		sessionMaxSeconds(settings, row.extendedSeconds),
	);
}

/** Penutupan sesi basi: ditagih sampai heartbeat terakhir saja. */
export function settleStaleSession(
	row: VoiceSessionRow,
	settings: VoiceQuotaSettings,
): { endedAt: Date; billedSeconds: number; endReason: "stale" } {
	return {
		endedAt: row.lastHeartbeatAt,
		billedSeconds: billableSeconds(row, row.lastHeartbeatAt, settings),
		endReason: "stale",
	};
}

/** Sisa detik hari ini; null = tanpa batas. */
export function remainingTodaySeconds(
	limitSeconds: number | null,
	usedSeconds: number,
): number | null {
	return limitSeconds === null ? null : Math.max(0, limitSeconds - usedSeconds);
}
