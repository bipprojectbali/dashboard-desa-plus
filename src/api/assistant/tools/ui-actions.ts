import { parseUiAction } from "@/config/assistant-pointer";
import type { UiAction } from "@/types/ai-assistant-pointer";
import type { ToolResult } from "./types";

/** Batas aksi per jawaban: satu urutan penunjukan, bukan tur panjang. */
export const MAX_UI_ACTIONS = 6;

/**
 * Ambil aksi UI dari hasil tool penunjuk. Hanya aksi yang lolos validasi bentuk
 * yang keluar; aksi dari tool lain / hasil error diabaikan.
 */
export function extractUiActions(result: ToolResult): UiAction[] {
	if (!result.ok || typeof result.data !== "object" || result.data === null)
		return [];
	const raw = (result.data as { actions?: unknown }).actions;
	if (!Array.isArray(raw)) return [];
	return raw.flatMap((item) => parseUiAction(item) ?? []);
}

/**
 * Gabungkan aksi baru ke daftar giliran: buang duplikat identik, potong di batas.
 * Panduan bertahap berdiri sendiri: begitu ada, ia menggantikan aksi lain dan
 * aksi sesudahnya diabaikan (panduan sudah mengatur navigasi antar langkah).
 */
export function appendUiActions(
	current: UiAction[],
	incoming: readonly UiAction[],
): void {
	if (current.some((a) => a.type === "guide")) return;
	const guide = incoming.find((a) => a.type === "guide");
	if (guide) {
		current.splice(0, current.length, guide);
		return;
	}
	for (const action of incoming) {
		if (current.length >= MAX_UI_ACTIONS) return;
		const key = JSON.stringify(action);
		if (!current.some((a) => JSON.stringify(a) === key)) current.push(action);
	}
}
