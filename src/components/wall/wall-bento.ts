/**
 * Sistem span bento untuk grid `/wall` — PURE, tanpa import React.
 *
 * Bento = grid asimetris: tiap widget menempati sel berukuran beda sesuai bobot
 * visual kontennya (donut hero lebih besar, KPI kecil 1×1). Ukuran ditetapkan
 * per-widget di registry (bukan per-user), jadi tak menyentuh schema DB.
 *
 * Dipisah dari komponen supaya bisa diuji tanpa render & dipakai lintas file.
 */

/** Token ukuran tile. Dipetakan ke span kolom×baris di grid. */
export type WallSize = "sm" | "wide" | "tall" | "lg";

export interface BentoSpan {
	/** Jumlah kolom grid yang ditempati. */
	col: number;
	/** Jumlah baris grid yang ditempati. */
	row: number;
}

/**
 * Peta ukuran → span. `sm` = unit dasar 1×1; sisanya membesar di satu/dua
 * sumbu. Maks span 2 supaya di layar sempit cukup di-collapse ke 1 kolom
 * (lihat {@link bentoCollapseCss}) tanpa overflow horizontal.
 */
export const BENTO_SPAN: Record<WallSize, BentoSpan> = {
	sm: { col: 1, row: 1 },
	wide: { col: 2, row: 1 },
	tall: { col: 1, row: 2 },
	lg: { col: 2, row: 2 },
};

/**
 * Lebar & tinggi unit sel dasar (px). Kolom auto-fill: jumlah kolom mengikuti
 * lebar layar (tiap kolom minimal {@link WALL_BENTO_COL}px, melar via `1fr`).
 * Tinggi baris tetap agar chart & span vertikal konsisten terbaca di TV.
 */
export const WALL_BENTO_COL = 300;
export const WALL_BENTO_ROW = 240;

/** Ambang lebar (px) di bawahnya tile lebar/lg di-collapse jadi 1 kolom. */
export const WALL_BENTO_COLLAPSE_PX = 720;

/**
 * Nama class CSS untuk span sebuah ukuran. `sm` (unit dasar) tak butuh class —
 * balikin string kosong supaya tak menaruh atribut class kosong yang percuma.
 */
export function bentoClass(size: WallSize): string {
	return size === "sm" ? "" : `wall-bento-${size}`;
}

/**
 * CSS span + aturan collapse responsif. Dipakai lewat <style> sekali di grid.
 * Span pakai class (bukan inline) supaya media-query bisa meng-override-nya di
 * layar sempit — inline style tak bisa dikalahkan CSS eksternal tanpa !important.
 */
export const bentoCss = `
.wall-bento-wide { grid-column: span 2; }
.wall-bento-tall { grid-row: span 2; }
.wall-bento-lg { grid-column: span 2; grid-row: span 2; }
@media (max-width: ${WALL_BENTO_COLLAPSE_PX}px) {
	.wall-bento-wide, .wall-bento-lg { grid-column: span 1; }
}
`;
