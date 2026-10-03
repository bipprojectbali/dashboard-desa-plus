/**
 * Kapan giliran V1-B dianggap selesai bicara: setelah jawaban dikirim, tunggu
 * minimal `minWaitMs`, lalu tutup begitu audio GPT-Live hening `quietMs`
 * (jawaban panjang tidak terpotong), dengan batas keras `maxWaitMs`.
 */

export const SETTLE_DEFAULTS = {
	/** Tunggu audio pertama maksimal selama ini sebelum pengukuran boleh ditutup. */
	minWaitMs: 10_000,
	/** Hening audio GPT-Live selama ini = selesai bicara. */
	quietMs: 1500,
	/** Batas keras menunggu (jawaban sangat panjang/audio macet). */
	maxWaitMs: 90_000,
	pollMs: 500,
} as const;

export type SettleConfig = { [K in keyof typeof SETTLE_DEFAULTS]: number };

export function isSettled(
	sentAt: number,
	lastAudibleAt: number,
	now: number,
	cfg: SettleConfig = SETTLE_DEFAULTS,
): boolean {
	if (now - sentAt >= cfg.maxWaitMs) return true;
	return now - sentAt >= cfg.minWaitMs && now - lastAudibleAt >= cfg.quietMs;
}

export interface SettleWatcher {
	/** Audio GPT-Live terdengar pada `now`. */
	heard(now: number): void;
	/** Panggil `done` sekali saat giliran yang jawabannya dikirim pada `sentAt` selesai bicara. */
	wait(sentAt: number, done: () => void): void;
	stopAll(): void;
}

export function createSettleWatcher(
	now: () => number = () => performance.now(),
	cfg: SettleConfig = SETTLE_DEFAULTS,
): SettleWatcher {
	let lastAudibleAt = Number.NEGATIVE_INFINITY;
	const timers = new Set<ReturnType<typeof setTimeout>>();
	return {
		heard(at) {
			lastAudibleAt = at;
		},
		wait(sentAt, done) {
			const tick = () => {
				const timer = setTimeout(() => {
					timers.delete(timer);
					if (isSettled(sentAt, lastAudibleAt, now(), cfg)) done();
					else tick();
				}, cfg.pollMs);
				timers.add(timer);
			};
			tick();
		},
		stopAll() {
			for (const timer of timers) clearTimeout(timer);
			timers.clear();
		},
	};
}
