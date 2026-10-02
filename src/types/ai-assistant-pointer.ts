/**
 * Aksi UI fitur 2 (penunjuk AI), rancangan 05 §4. Dihasilkan tool server,
 * dijalankan pelaksana aksi di browser. Hanya empat jenis; selain itu ditolak.
 */

export const UI_ACTION_TYPES = [
	"navigate",
	"pointTo",
	"click",
	"pilih",
	"guide",
] as const;

/** Batas panduan bertahap (#43): jumlah langkah dan panjang teks penjelasan per langkah. */
export const GUIDE_MAX_STEPS = 5;
export const GUIDE_MAX_TEXT = 500;
/** Rentang detik lanjut otomatis di /wall (diatur admin) dan nilai awalnya. */
export const GUIDE_AUTO_ADVANCE_MIN_SEC = 3;
export const GUIDE_AUTO_ADVANCE_MAX_SEC = 60;
export const GUIDE_AUTO_ADVANCE_DEFAULT_SEC = 8;

/** Satu langkah panduan: bagian yang ditunjuk + penjelasan (teks biasa, bukan HTML/Markdown). */
export interface GuideStep {
	target: string;
	text: string;
}

export type UiActionType = (typeof UI_ACTION_TYPES)[number];

export type UiAction =
	| { type: "navigate"; route: string }
	| { type: "pointTo"; target: string }
	| { type: "click"; target: string }
	| { type: "pilih"; target: string; value: string }
	/** Panduan bertahap: hanya menunjuk; `autoAdvanceSec` hanya diisi server untuk /wall. */
	| { type: "guide"; steps: GuideStep[]; autoAdvanceSec?: number };

export type GuideAction = Extract<UiAction, { type: "guide" }>;

/** Alasan pelaksana aksi di browser tidak menjalankan sebuah aksi. */
export type UiActionFailure =
	| "invalid-action"
	| "unknown-route"
	| "unknown-target"
	| "forbidden-target"
	| "not-clickable"
	| "anchor-timeout"
	| "option-not-found"
	| "navigate-unavailable"
	| "wall-restricted"
	/** Langkah panduan gagal di tengah jalan (mis. navigasi melempar error). */
	| "guide-step-failed"
	/** Dihentikan user (gulir, Esc, navigasi manual, panel ditutup); dilaporkan senyap. */
	| "cancelled";

export type UiActionOutcome =
	| { ok: true }
	| { ok: false; reason: UiActionFailure };
