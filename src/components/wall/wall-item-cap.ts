/**
 * Cap jumlah item list widget berdasar geometri — PURE, tanpa import React.
 *
 * Wall (`/wall`) adalah kiosk/TV 24/7 tanpa interaksi mouse/touch di layar
 * fisik (lihat komentar "Fallback fullscreen dalam app; kiosk browser tetap
 * jalur utama" di `wall-page.tsx`), jadi scroll/pagination di dalam widget
 * tidak dipakai. Alih-alih, tiap widget list membatasi jumlah item yang
 * ditampilkan sesuai tinggi slotnya (`geom.h` × {@link WALL_BENTO_ROW}) dan
 * menampilkan indikator non-interaktif "+N lainnya" bila data terpotong.
 *
 * Estimasi ini perkiraan (bukan ResizeObserver pixel-perfect) — cukup untuk
 * mencegah overflow tanpa perlu threading layout measurement penuh.
 */

import { WALL_BENTO_ROW, type WidgetGeom } from "./wall-bento";

/** Overhead tetap `WidgetCard`: padding 18px×2 + baris judul + margin. */
const CARD_OVERHEAD_PX = 70;

/** Tinggi per baris list ringkas satu-baris (StatRow, teks tabel). */
export const LIST_ITEM_COMPACT_PX = 40;
/** Tinggi per baris list kartu ikon+judul+subjudul (default). */
export const LIST_ITEM_REGULAR_PX = 52;
/** Tinggi per baris list dengan progress bar / badge / 2 baris teks. */
export const LIST_ITEM_TALL_PX = 68;

/** Minimal item yang tetap ditampilkan meski widget dikecilkan maksimal. */
const MIN_VISIBLE_ITEMS = 2;

/**
 * Perkiraan jumlah item yang muat di widget berdasar `geom.h` (span baris).
 * `itemPx` disesuaikan per jenis baris widget (lihat konstanta di atas).
 * Tanpa `geom` (mis. belum di-thread) → asumsikan ukuran terkecil (h=1).
 */
export function maxVisibleItems(
	geom: WidgetGeom | undefined,
	itemPx: number = LIST_ITEM_REGULAR_PX,
): number {
	const h = geom?.h ?? 1;
	const available = h * WALL_BENTO_ROW - CARD_OVERHEAD_PX;
	return Math.max(MIN_VISIBLE_ITEMS, Math.floor(available / itemPx));
}
