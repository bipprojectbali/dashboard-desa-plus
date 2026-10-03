/** Jam sesi suara: mati otomatis bila diam melewati `idleMs`, atau total melewati `maxMs`. */

export interface SessionClock {
	startedAt: number;
	lastActivityAt: number;
}

export type SessionVerdict = "ok" | "idle" | "cap";

export interface SessionLimits {
	idleMs: number;
	maxMs: number;
}

export function startSession(nowMs: number): SessionClock {
	return { startedAt: nowMs, lastActivityAt: nowMs };
}

/** Catat aktivitas (suara terdeteksi, giliran baru, jawaban mengalir). */
export function touchSession(clock: SessionClock, nowMs: number): SessionClock {
	return { ...clock, lastActivityAt: nowMs };
}

/** Batas total menang atas idle bila keduanya terlewati. */
export function evaluateSession(
	clock: SessionClock,
	nowMs: number,
	limits: SessionLimits,
): SessionVerdict {
	if (nowMs - clock.startedAt >= limits.maxMs) return "cap";
	if (nowMs - clock.lastActivityAt >= limits.idleMs) return "idle";
	return "ok";
}

/** Sisa waktu (ms) sebelum sesi mati; 0 bila sudah lewat. */
export function remainingMs(
	clock: SessionClock,
	nowMs: number,
	limits: SessionLimits,
): number {
	const untilCap = clock.startedAt + limits.maxMs - nowMs;
	const untilIdle = clock.lastActivityAt + limits.idleMs - nowMs;
	return Math.max(0, Math.min(untilCap, untilIdle));
}
