/**
 * Utilitas layout video wall (`/wall`) — PURE, tanpa import React.
 *
 * Dipisah dari `widget-registry.tsx` (yang berisi komponen React) supaya bisa
 * dipakai di server (validasi PUT) dan diuji tanpa render. `WidgetId` di sini
 * adalah single source of truth untuk id yang valid; registry memetakan id ini
 * ke komponen Body-nya.
 */

/** Semua widget id yang dikenal. Urutan tak bermakna — cuma katalog. */
export const ALL_WIDGET_IDS = [
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

/** Kategori untuk pengelompokan di galeri tambah-widget. */
export type WallCategory =
	| "keuangan"
	| "pengaduan"
	| "demografi"
	| "divisi"
	| "keamanan"
	| "ops";

/** Grid tetap 3×2 = 6 slot. Konstanta bernama — tak ada hardcode 3/2. */
export const WALL_COLS = 3;
export const WALL_ROWS = 2;
export const WALL_SLOTS = WALL_COLS * WALL_ROWS;

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
 * Resolusi untuk RENDER — selalu balikin tepat {@link WALL_SLOTS} widget unik & valid.
 * Pipeline: buang unknown → dedupe → cap ke SLOTS → backfill dari DEFAULT_LAYOUT
 * (yang belum terpakai) → slice ke SLOTS. Toleran: input rusak apa pun tetap
 * menghasilkan grid penuh yang bisa dirender.
 */
export function resolveLayout(ids?: readonly string[] | null): WidgetId[] {
	const seen = new Set<WidgetId>();
	const out: WidgetId[] = [];

	for (const id of ids ?? []) {
		if (out.length >= WALL_SLOTS) break;
		if (isKnownWidgetId(id) && !seen.has(id)) {
			seen.add(id);
			out.push(id);
		}
	}

	// Backfill slot kosong dengan default yang belum dipakai.
	for (const id of DEFAULT_LAYOUT) {
		if (out.length >= WALL_SLOTS) break;
		if (!seen.has(id)) {
			seen.add(id);
			out.push(id);
		}
	}

	return out.slice(0, WALL_SLOTS);
}

export interface LayoutValidation {
	ok: boolean;
	errors: string[];
}

/**
 * Validasi STRICT untuk guard sebelum simpan (server + klien).
 * Beda dari {@link resolveLayout}: ini TOLAK input cacat, bukan perbaiki —
 * supaya klien tak diam-diam menyimpan sesuatu yang beda dari yang dia kira.
 * Aturan: hanya id dikenal, tanpa duplikat, jumlah 1..WALL_SLOTS.
 */
export function validateLayout(ids: readonly string[]): LayoutValidation {
	const errors: string[] = [];

	if (!Array.isArray(ids)) {
		return { ok: false, errors: ["order harus array"] };
	}
	if (ids.length === 0) {
		errors.push("order tidak boleh kosong");
	}
	if (ids.length > WALL_SLOTS) {
		errors.push(`order melebihi ${WALL_SLOTS} slot (${ids.length})`);
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
