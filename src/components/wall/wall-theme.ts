/** Token warna dark untuk NOC wall. Bernama agar tak ada hex tersebar. */
export const WALL_THEME = {
	PAGE_BG: "#11192D",
	CARD: "#1E293B",
	BORDER: "#334155",
	TEXT: "#E2E8F0",
	TEXT_DIM: "#94A3B8",
	ACCENT: "#3B82F6", // darmasaba-blue
	OK: "#22C55E",
	WARN: "#F59E0B",
	DANGER: "#EF4444",
} as const;

/** Interval rotasi antar scene di area tengah (ms). */
export const SCENE_INTERVAL_MS = 20_000;

/** Interval refetch snapshot di klien (ms) — di atas cache server 10s. */
export const WALL_REFETCH_MS = 30_000;

/**
 * Interval refetch layout (ms). Lebih longgar dari snapshot: layout jarang
 * berubah (hanya saat admin simpan), jadi 60s cukup buat propagasi ke TV
 * tanpa polling berlebih. GET read-only → poll ini nol-write.
 */
export const WALL_LAYOUT_REFETCH_MS = 60_000;
