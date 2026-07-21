/**
 * Utilitas layout video wall (`/wall`) — PURE, tanpa import React.
 *
 * Dipisah dari `widget-registry.tsx` (yang berisi komponen React) supaya bisa
 * dipakai di server (validasi PUT) dan diuji tanpa render. `WidgetId` di sini
 * adalah single source of truth untuk id yang valid; registry memetakan id ini
 * ke komponen Body-nya. Ukuran default tiap widget ({@link DEFAULT_WIDGET_SIZE})
 * juga di sini supaya server bisa resolve geometri tanpa memuat komponen.
 */

import {
	clampGeom,
	isValidGeom,
	sizeToGeom,
	type WallSize,
	type WidgetGeom,
} from "./wall-bento";

/** Semua widget id yang dikenal. Urutan tak bermakna — cuma katalog. */
export const ALL_WIDGET_IDS = [
	// Beranda — 7 widget live meniru card halaman utama
	"beranda-kpi",
	"beranda-surat-trend",
	"beranda-kepuasan",
	"beranda-divisi",
	"beranda-kalender",
	"beranda-apbdes",
	"beranda-sdgs",
	// Keuangan
	"keuangan-apbdes",
	"keuangan-kepuasan",
	"keuangan-sdgs",
	// Pengaduan & layanan
	"pengaduan-status",
	"pengaduan-trend",
	"pengaduan-service-type",
	"pengaduan-kepuasan",
	// Demografi
	"demografi-gender",
	"demografi-age",
	"demografi-religion",
	"demografi-occupation",
	"demografi-stats",
	// Kinerja divisi
	"divisi-kinerja",
	"divisi-documents",
	// Keamanan
	"keamanan-status",
	// Ops / sistem
	"ops-panel",
] as const;

export type WidgetId = (typeof ALL_WIDGET_IDS)[number];

/**
 * Ukuran preset default tiap widget — bobot visual kontennya. Jadi default seed
 * saat admin belum pernah me-resize (DB tak punya `sizes`). Donut hero → `lg`,
 * chart lebar → `wide`, list panjang → `tall`, KPI ringkas → `sm`. Admin boleh
 * menimpa bebas via drag-resize; nilai override tersimpan terpisah di DB.
 */
export const DEFAULT_WIDGET_SIZE: Record<WidgetId, WallSize> = {
	"beranda-kpi": "wide",
	"beranda-surat-trend": "wide",
	"beranda-kepuasan": "lg",
	"beranda-divisi": "tall",
	"beranda-kalender": "tall",
	"beranda-apbdes": "wide",
	"beranda-sdgs": "tall",
	"keuangan-apbdes": "wide",
	"keuangan-kepuasan": "lg",
	"keuangan-sdgs": "tall",
	"pengaduan-status": "sm",
	"pengaduan-trend": "wide",
	"pengaduan-service-type": "wide",
	"pengaduan-kepuasan": "lg",
	"demografi-gender": "lg",
	"demografi-age": "wide",
	"demografi-religion": "lg",
	"demografi-occupation": "wide",
	"demografi-stats": "sm",
	"divisi-kinerja": "tall",
	"divisi-documents": "wide",
	"keamanan-status": "sm",
	"ops-panel": "tall",
};

/** Geometri {w,h} default sebuah widget (dari preset {@link DEFAULT_WIDGET_SIZE}). */
export function defaultGeom(id: WidgetId): WidgetGeom {
	return sizeToGeom(DEFAULT_WIDGET_SIZE[id]);
}

/** Kategori untuk pengelompokan di galeri tambah-widget. */
export type WallCategory =
	| "beranda"
	| "keuangan"
	| "pengaduan"
	| "demografi"
	| "divisi"
	| "keamanan"
	| "ops";

/**
 * Jumlah widget default saat wall pertama kali boot (DB kosong). BUKAN batas
 * atas — admin boleh menambah widget hingga sebanyak katalog. Grid render
 * responsif (auto-fill), jadi jumlah kolom mengikuti lebar layar, bukan tetap.
 */
export const WALL_DEFAULT_COUNT = 6;

/** Batas atas layout = sebanyak widget unik yang tersedia (tak boleh duplikat). */
export const WALL_MAX_SLOTS = ALL_WIDGET_IDS.length;

/** Id baris singleton di tabel `wall_layout`. */
export const WALL_LAYOUT_ID = "singleton";

/**
 * Layout default saat DB kosong — wall 24/7 tak boleh boot kosong.
 * Satu widget mewakili tiap kategori utama + status sistem.
 */
export const DEFAULT_LAYOUT: WidgetId[] = [
	"keuangan-apbdes",
	"pengaduan-status",
	"pengaduan-trend",
	"demografi-gender",
	"divisi-kinerja",
	"ops-panel",
];

const KNOWN_IDS: ReadonlySet<string> = new Set(ALL_WIDGET_IDS);

/** Type guard: apakah string ini WidgetId yang dikenal. */
export function isKnownWidgetId(id: string): id is WidgetId {
	return KNOWN_IDS.has(id);
}

/**
 * Resolusi untuk RENDER — balikin daftar widget unik & valid, sebanyak yang
 * disimpan admin (tanpa batas atas selain katalog). Pipeline: buang unknown →
 * dedupe. Bila hasil KOSONG (input null/rusak total) → pakai DEFAULT_LAYOUT
 * supaya wall 24/7 tak boot kosong. Toleran: input rusak tetap menghasilkan
 * grid yang bisa dirender.
 */
export function resolveLayout(ids?: readonly string[] | null): WidgetId[] {
	const seen = new Set<WidgetId>();
	const out: WidgetId[] = [];

	for (const id of ids ?? []) {
		if (isKnownWidgetId(id) && !seen.has(id)) {
			seen.add(id);
			out.push(id);
		}
	}

	// Kosong (belum di-set / semua id rusak) → jangan boot kosong.
	return out.length > 0 ? out : [...DEFAULT_LAYOUT];
}

export interface LayoutValidation {
	ok: boolean;
	errors: string[];
}

/**
 * Validasi STRICT untuk guard sebelum simpan (server + klien).
 * Beda dari {@link resolveLayout}: ini TOLAK input cacat, bukan perbaiki —
 * supaya klien tak diam-diam menyimpan sesuatu yang beda dari yang dia kira.
 * Aturan: hanya id dikenal, tanpa duplikat, jumlah 1..WALL_MAX_SLOTS.
 */
export function validateLayout(ids: readonly string[]): LayoutValidation {
	const errors: string[] = [];

	if (!Array.isArray(ids)) {
		return { ok: false, errors: ["order harus array"] };
	}
	if (ids.length === 0) {
		errors.push("order tidak boleh kosong");
	}
	if (ids.length > WALL_MAX_SLOTS) {
		errors.push(`order melebihi ${WALL_MAX_SLOTS} widget (${ids.length})`);
	}

	const seen = new Set<string>();
	for (const id of ids) {
		if (!isKnownWidgetId(id)) {
			errors.push(`widget id tak dikenal: ${id}`);
		}
		if (seen.has(id)) {
			errors.push(`widget duplikat: ${id}`);
		}
		seen.add(id);
	}

	return { ok: errors.length === 0, errors };
}

/**
 * Peta ukuran per widget seperti disimpan di DB: `{ [widgetId]: {w, h} }`.
 * Partial — hanya widget yang di-resize admin yang punya entri; sisanya pakai
 * default. Tipe longgar (`string` key, `unknown`-ish) karena berasal dari JSON
 * DB / body request yang belum tepercaya; {@link resolveSizes} yang menyaring.
 */
export type WallSizeMap = Record<string, WidgetGeom>;

/**
 * Resolusi untuk RENDER — untuk tiap id di `order`, balikin geometri final:
 * override tersimpan (bila valid & dikenal) di-clamp ke batas, selain itu
 * default preset widget. Toleran: entri rusak/asing di `raw` diabaikan, id
 * tanpa override jatuh ke default. Hasil selalu lengkap untuk tiap id valid.
 */
export function resolveSizes(
	order: readonly string[],
	raw?: WallSizeMap | null,
): Record<string, WidgetGeom> {
	const out: Record<string, WidgetGeom> = {};
	for (const id of order) {
		if (!isKnownWidgetId(id) || out[id]) continue;
		const override = raw?.[id];
		out[id] =
			override && isGeomShape(override) ? clampGeom(override) : defaultGeom(id);
	}
	return out;
}

/** True bila objek punya bentuk {w:number, h:number} — belum tentu dalam batas. */
function isGeomShape(v: unknown): v is WidgetGeom {
	return (
		typeof v === "object" &&
		v !== null &&
		typeof (v as WidgetGeom).w === "number" &&
		typeof (v as WidgetGeom).h === "number"
	);
}

/**
 * Validasi STRICT peta sizes sebelum simpan (server + klien). Beda dari
 * {@link resolveSizes} yang memperbaiki: ini TOLAK input cacat supaya klien tak
 * diam-diam menyimpan geometri di luar batas. Aturan: tiap key adalah widget id
 * dikenal, tiap nilai geometri integer dalam {@link GEOM_BOUNDS}. Peta kosong /
 * tak ada (tak ada override) = valid.
 */
export function validateSizes(
	raw: WallSizeMap | null | undefined,
): LayoutValidation {
	const errors: string[] = [];
	if (raw == null) return { ok: true, errors };
	if (typeof raw !== "object" || Array.isArray(raw)) {
		return { ok: false, errors: ["sizes harus objek"] };
	}

	for (const [id, geom] of Object.entries(raw)) {
		if (!isKnownWidgetId(id)) {
			errors.push(`sizes: widget id tak dikenal: ${id}`);
			continue;
		}
		if (!isGeomShape(geom)) {
			errors.push(`sizes: geometri ${id} bukan {w,h} angka`);
			continue;
		}
		if (!isValidGeom(geom)) {
			errors.push(`sizes: ukuran ${id} di luar batas (${geom.w}×${geom.h})`);
		}
	}

	return { ok: errors.length === 0, errors };
}
