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
	INFO: "#38BDF8", // cyan-sky untuk aksen sekunder
	VIOLET: "#A78BFA", // ungu untuk kategori/ KPI tambahan
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

/**
 * Ukuran minimum kartu widget untuk grid responsif. Lebar min menentukan
 * jumlah kolom (auto-fill): makin lebar layar → makin banyak kolom. Tinggi min
 * menjaga chart tetap terbaca; saat widget sedikit, baris melar mengisi layar.
 */
export const WALL_MIN_CARD_WIDTH = 460;
export const WALL_MIN_CARD_HEIGHT = 300;

/** Interval refetch snapshot di klien (ms) — di atas cache server 10s. */
export const WALL_REFETCH_MS = 30_000;

/**
 * Interval refetch layout (ms). Lebih longgar dari snapshot: layout jarang
 * berubah (hanya saat admin simpan), jadi 60s cukup buat propagasi ke TV
 * tanpa polling berlebih. GET read-only → poll ini nol-write.
 */
export const WALL_LAYOUT_REFETCH_MS = 60_000;
