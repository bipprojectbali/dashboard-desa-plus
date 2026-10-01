import { APP_TIMEZONE_OFFSET_MINUTES } from "@/config/timezone";
import type { AssistantSettingsValues } from "../config/settings.repo";

/**
 * Batas pemakaian assistant — fungsi murni (query ada di usage.repo.ts).
 * Semua angka dari AssistantSettings; 0 = tanpa batas. Hari dihitung WITA
 * (reset 00:00 WITA), sama untuk semua user.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const OFFSET_MS = APP_TIMEZONE_OFFSET_MINUTES * 60 * 1000;
export const RATE_WINDOW_MS = 60 * 1000;

export const LIMIT_MESSAGES = {
	rate_limited: "Terlalu cepat, coba lagi sebentar.",
	daily_user: "Kuota harian habis.",
	daily_global: "Kuota harian asisten habis.",
	input_empty: "Pesan tidak boleh kosong.",
	input_too_long: "Pesan terlalu panjang.",
} as const;

export type LimitCode = keyof typeof LIMIT_MESSAGES;

export interface LimitViolation {
	code: LimitCode;
	status: 422 | 429;
	message: string;
	/** Detik sampai boleh mencoba lagi (untuk header Retry-After), bila diketahui. */
	retryAfterSec?: number;
}

type QuotaSettings = Pick<
	AssistantSettingsValues,
	| "dailyMessageLimitPerUser"
	| "dailyMessageLimitKiosk"
	| "kioskUserId"
	| "dailyTokenLimitGlobal"
>;

/** Awal hari ini (00:00 WITA) sebagai instant UTC. */
export function startOfDayWita(now: Date): Date {
	const shifted = now.getTime() + OFFSET_MS;
	return new Date(shifted - (shifted % DAY_MS) - OFFSET_MS);
}

/** Detik sampai reset kuota berikutnya (00:00 WITA besok). */
export function secondsUntilResetWita(now: Date): number {
	const next = startOfDayWita(now).getTime() + DAY_MS;
	return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

/** Batas pesan harian untuk user: akun kiosk /wall memakai kuota kiosk, lainnya kuota per user. */
export function dailyMessageLimitFor(
	settings: QuotaSettings,
	userId: string,
): number {
	return settings.kioskUserId !== null && settings.kioskUserId === userId
		? settings.dailyMessageLimitKiosk
		: settings.dailyMessageLimitPerUser;
}

/** Validasi panjang input (`maxInputChars` 0 = tanpa batas). */
export function checkInput(
	text: string,
	maxInputChars: number,
): LimitViolation | null {
	if (text.trim().length === 0) {
		return {
			code: "input_empty",
			status: 422,
			message: LIMIT_MESSAGES.input_empty,
		};
	}
	if (maxInputChars > 0 && text.length > maxInputChars) {
		return {
			code: "input_too_long",
			status: 422,
			message: `${LIMIT_MESSAGES.input_too_long} Maksimal ${maxInputChars.toLocaleString("id-ID")} karakter.`,
		};
	}
	return null;
}

/** Kuota harian: pesan per user (atau kiosk) lalu token global. */
export function checkDailyQuota(input: {
	settings: QuotaSettings;
	userId: string;
	messagesToday: number;
	tokensToday: number;
	now: Date;
}): LimitViolation | null {
	const retryAfterSec = secondsUntilResetWita(input.now);
	const messageLimit = dailyMessageLimitFor(input.settings, input.userId);
	if (messageLimit > 0 && input.messagesToday >= messageLimit) {
		return {
			code: "daily_user",
			status: 429,
			message: LIMIT_MESSAGES.daily_user,
			retryAfterSec,
		};
	}
	const tokenLimit = input.settings.dailyTokenLimitGlobal;
	if (tokenLimit > 0 && input.tokensToday >= tokenLimit) {
		return {
			code: "daily_global",
			status: 429,
			message: LIMIT_MESSAGES.daily_global,
			retryAfterSec,
		};
	}
	return null;
}

/** Jumlah pesan riwayat yang dikirim ke LLM; undefined = semua (historyWindow 0). */
export function historyTake(historyWindow: number): number | undefined {
	return historyWindow > 0 ? historyWindow : undefined;
}

/**
 * Rate limit jendela geser per kunci (userId), di memori proses — cukup
 * selama deploy satu container. Panggilan yang lolos langsung dicatat.
 */
export class SlidingWindowRateLimiter {
	private readonly hits = new Map<string, number[]>();

	constructor(private readonly windowMs: number = RATE_WINDOW_MS) {}

	/** Catat satu permintaan; `limit` 0 = tanpa batas. */
	hit(key: string, limit: number, nowMs: number): LimitViolation | null {
		if (limit <= 0) return null;
		const recent = (this.hits.get(key) ?? []).filter(
			(t) => nowMs - t < this.windowMs,
		);
		if (recent.length >= limit) {
			this.hits.set(key, recent);
			const oldest = recent[0] ?? nowMs;
			return {
				code: "rate_limited",
				status: 429,
				message: LIMIT_MESSAGES.rate_limited,
				retryAfterSec: Math.max(
					1,
					Math.ceil((oldest + this.windowMs - nowMs) / 1000),
				),
			};
		}
		recent.push(nowMs);
		this.hits.set(key, recent);
		return null;
	}

	/** Buang kunci yang semua catatannya sudah di luar jendela (cegah Map tumbuh). */
	prune(nowMs: number): void {
		for (const [key, times] of this.hits) {
			if (times.every((t) => nowMs - t >= this.windowMs)) this.hits.delete(key);
		}
	}

	get size(): number {
		return this.hits.size;
	}
}

/** Limiter bersama untuk endpoint chat assistant. */
export const assistantRateLimiter = new SlidingWindowRateLimiter();
