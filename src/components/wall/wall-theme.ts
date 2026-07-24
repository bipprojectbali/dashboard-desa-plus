/** Token warna dark untuk NOC wall. Bernama agar tak ada hex tersebar. */
export const WALL_THEME = {
	PAGE_BG: "#11192D",
	CARD: "#1E293B",
	BORDER: "#334155",
	TEXT: "#E2E8F0",
	TEXT_DIM: "#94A3B8",
	ACCENT: "#5A8DD6", // darmasaba-blue (soft)
	OK: "#57A773",
	WARN: "#DFA94E",
	DANGER: "#D25E5E",
	INFO: "#5C9DB8", // cyan-sky untuk aksen sekunder (soft)
	VIOLET: "#9385D1", // ungu untuk kategori/ KPI tambahan
	TRACK: "#273449", // rel progress bar di atas CARD
} as const;

/** Palet kategorikal untuk chart/list dgn banyak seri — hindari warna muddy. */
export const WALL_CATEGORICAL = [
	WALL_THEME.ACCENT,
	WALL_THEME.OK,
	WALL_THEME.WARN,
	WALL_THEME.VIOLET,
	WALL_THEME.INFO,
	WALL_THEME.DANGER,
] as const;

/** Interval refetch snapshot di klien (ms) — di atas cache server 10s. */
export const WALL_REFETCH_MS = 30_000;

/**
 * Interval refetch layout (ms). Lebih longgar dari snapshot: layout jarang
 * berubah (hanya saat admin simpan), jadi 60s cukup buat propagasi ke TV
 * tanpa polling berlebih. GET read-only → poll ini nol-write.
 */
export const WALL_LAYOUT_REFETCH_MS = 60_000;
