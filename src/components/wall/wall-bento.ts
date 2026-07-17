/**
 * Sistem geometri bento untuk grid `/wall` — PURE, tanpa import React.
 *
 * Bento = grid asimetris: tiap widget menempati sel berukuran beda. Dulu ukuran
 * dipilih dari token tetap (sm/wide/tall/lg); sekarang tiap widget punya
 * geometri numerik {@link WidgetGeom} `{w, h}` (span kolom×baris) yang bisa
 * admin ubah bebas lewat drag-resize di mode edit lalu disimpan ke DB.
 *
 * Token {@link WallSize} dipertahankan HANYA sebagai default seed per widget di
 * registry (dikonversi ke {w,h} via {@link sizeToGeom}) — layout tanpa ukuran
 * tersimpan jatuh balik ke default ini.
 *
 * Dipisah dari komponen supaya bisa diuji tanpa render & dipakai lintas file
 * (server validasi + klien render).
 */

/** Geometri span sebuah tile: berapa kolom (w) × baris (h) grid yang ditempati. */
export interface WidgetGeom {
	/** Span kolom grid. */
	w: number;
	/** Span baris grid. */
	h: number;
}

/**
 * Batas ukuran tile (inklusif). W maks 4 & H maks 3 pas untuk TV 1080p/4K:
 * cukup besar untuk donut hero tanpa satu widget menelan seluruh layar, dan
 * cukup kecil agar selalu muat di grid auto-fill (CSS meng-clamp span berlebih
 * ke jumlah kolom yang ada, jadi tak pernah overflow horizontal).
 */
export const GEOM_BOUNDS = {
	minW: 1,
	maxW: 4,
	minH: 1,
	maxH: 3,
} as const;

/**
 * Lebar & tinggi unit sel dasar (px). Kolom auto-fill: jumlah kolom mengikuti
 * lebar layar (tiap kolom minimal {@link WALL_BENTO_COL}px, melar via `1fr`).
 * Tinggi baris tetap agar chart & span vertikal konsisten terbaca di TV.
 * Dipakai juga oleh handle resize untuk mengubah delta pointer → langkah sel.
 */
export const WALL_BENTO_COL = 300;
export const WALL_BENTO_ROW = 240;

/** Token ukuran preset — sumber default seed per widget (bukan lagi satu-satunya opsi). */
export type WallSize = "sm" | "wide" | "tall" | "lg";

/** Peta token preset → geometri numerik. Dipakai sebagai default saat DB kosong. */
const SIZE_GEOM: Record<WallSize, WidgetGeom> = {
	sm: { w: 1, h: 1 },
	wide: { w: 2, h: 1 },
	tall: { w: 1, h: 2 },
	lg: { w: 2, h: 2 },
};

/** Konversi token preset → geometri {w,h}. */
export function sizeToGeom(size: WallSize): WidgetGeom {
	return { ...SIZE_GEOM[size] };
}

/** Bulatkan ke integer & jepit w/h ke {@link GEOM_BOUNDS}. Input cacat → aman. */
export function clampGeom(geom: WidgetGeom): WidgetGeom {
	const w = clampAxis(geom.w, GEOM_BOUNDS.minW, GEOM_BOUNDS.maxW);
	const h = clampAxis(geom.h, GEOM_BOUNDS.minH, GEOM_BOUNDS.maxH);
	return { w, h };
}

/** Jepit satu sumbu: NaN/non-finite → batas bawah; bulatkan; clamp min..max. */
function clampAxis(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	const rounded = Math.round(value);
	return Math.min(max, Math.max(min, rounded));
}

/**
 * Cek apakah geometri valid (integer & dalam batas) — dipakai validasi simpan.
 * Beda dari {@link clampGeom} yang memperbaiki: ini menilai tanpa mengubah.
 */
export function isValidGeom(geom: WidgetGeom): boolean {
	return (
		Number.isInteger(geom.w) &&
		Number.isInteger(geom.h) &&
		geom.w >= GEOM_BOUNDS.minW &&
		geom.w <= GEOM_BOUNDS.maxW &&
		geom.h >= GEOM_BOUNDS.minH &&
		geom.h <= GEOM_BOUNDS.maxH
	);
}

/**
 * Style span inline untuk sebuah geometri. `span N` di grid auto-fill di-clamp
 * otomatis oleh CSS ke jumlah kolom yang muat — jadi di layar/TV sempit tile
 * lebar menyusut sendiri tanpa media query. Inline (bukan class) karena span
 * kini dinamis per widget, bukan sekumpulan preset tetap.
 */
export function spanStyle(geom: WidgetGeom): {
	gridColumn: string;
	gridRow: string;
} {
	const { w, h } = clampGeom(geom);
	return {
		gridColumn: `span ${w}`,
		gridRow: `span ${h}`,
	};
}
