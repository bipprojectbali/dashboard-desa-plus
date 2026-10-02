export interface PointerPoint {
	x: number;
	y: number;
}

/** Jeda kursor terlihat diam di tengah layar (setelah fade-in) sebelum meluncur. */
export const SPAWN_DWELL_MS = 260;
/** Durasi fade/scale-in kursor saat muncul. */
export const SPAWN_FADE_MS = 220;
/** Durasi meluncur dari posisi terakhir ke target. */
export const GLIDE_MS = 900;
/** Durasi ring sorotan memudar masuk/keluar. */
export const RING_FADE_MS = 260;
/** Durasi kursor memudar keluar di akhir. */
export const LEAVE_FADE_MS = 320;
/** Lama kursor + ring bertahan setelah aksi terakhir sebelum memudar. */
export const POINTER_HOLD_MS = 4000;
/** Lengkung lintasan: simpangan tegak lurus sebagai pecahan jarak, dibatasi px maksimum. */
export const GLIDE_CURVE_BULGE = 0.18;
export const GLIDE_CURVE_MAX_PX = 120;
/** Skala awal kursor saat spawn (tumbuh ke 1). */
export const SPAWN_SCALE = 0.6;
/** Batas tunggu gulir halus selesai. */
export const SCROLL_SETTLE_MAX_MS = 1200;
/** Bila tidak ada gulir sama sekali dalam jeda ini, elemen dianggap sudah terlihat. */
export const SCROLL_START_GRACE_MS = 120;
export const SCROLL_POLL_MS = 50;

/** Opsi waktu yang bisa dipersingkat (dipakai test). */
export interface MotionTiming {
	glideMs?: number;
	spawnDwellMs?: number;
	holdMs?: number;
	scrollMaxMs?: number;
	scrollGraceMs?: number;
	scrollPollMs?: number;
}

export const easeInOutCubic = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export function viewportCenter(): PointerPoint {
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

/** Titik pada kurva bezier kuadratik from→to yang sedikit melengkung ke atas (t 0..1). */
export function curvePoint(
	from: PointerPoint,
	to: PointerPoint,
	t: number,
): PointerPoint {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dist = Math.hypot(dx, dy);
	const bulge = Math.min(dist * GLIDE_CURVE_BULGE, GLIDE_CURVE_MAX_PX);
	const nx = dist === 0 ? 0 : dy / dist;
	const ny = dist === 0 ? 0 : -dx / dist;
	const cx = (from.x + to.x) / 2 + nx * bulge;
	const cy = (from.y + to.y) / 2 + ny * bulge;
	const u = 1 - t;
	return {
		x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
		y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
	};
}

export const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Luncurkan kursor lewat kurva dengan rAF. Tujuan dibaca ulang tiap frame
 * (target boleh bergeser); `cancelled()` menghentikan tanpa frame tambahan.
 */
export function glide(opts: {
	from: PointerPoint;
	to: () => PointerPoint;
	durationMs: number;
	onFrame: (p: PointerPoint) => void;
	cancelled: () => boolean;
}): Promise<void> {
	return new Promise((resolve) => {
		const start = performance.now();
		const step = () => {
			if (opts.cancelled()) return resolve();
			const t = Math.min(1, (performance.now() - start) / opts.durationMs);
			opts.onFrame(curvePoint(opts.from, opts.to(), easeInOutCubic(t)));
			if (t >= 1) return resolve();
			requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	});
}
