/**
 * Aksi UI fitur 2 (penunjuk AI), rancangan 05 §4. Dihasilkan tool server,
 * dijalankan pelaksana aksi di browser. Hanya empat jenis; selain itu ditolak.
 */

export const UI_ACTION_TYPES = [
	"navigate",
	"pointTo",
	"click",
	"pilih",
] as const;

export type UiActionType = (typeof UI_ACTION_TYPES)[number];

export type UiAction =
	| { type: "navigate"; route: string }
	| { type: "pointTo"; target: string }
	| { type: "click"; target: string }
	| { type: "pilih"; target: string; value: string };

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
	| "wall-restricted";

export type UiActionOutcome =
	| { ok: true }
	| { ok: false; reason: UiActionFailure };
