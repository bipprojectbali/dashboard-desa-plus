import type { UiAction } from "@/types/ai-assistant-pointer";
import { UI_ACTION_TYPES } from "@/types/ai-assistant-pointer";

function nonEmptyString(v: unknown): string | null {
	return typeof v === "string" && v !== "" ? v : null;
}

/**
 * Validasi bentuk aksi dari sumber tak tepercaya (respons server). Hanya cek
 * jenis & tipe field; keanggotaan registry dicek pelaksana/tool. `null` = tidak valid.
 */
export function parseUiAction(raw: unknown): UiAction | null {
	if (typeof raw !== "object" || raw === null) return null;
	const a = raw as Record<string, unknown>;
	if (!UI_ACTION_TYPES.some((t) => t === a.type)) return null;
	if (a.type === "navigate") {
		const route = nonEmptyString(a.route);
		return route ? { type: "navigate", route } : null;
	}
	const target = nonEmptyString(a.target);
	if (!target) return null;
	if (a.type === "pilih") {
		const value = nonEmptyString(a.value);
		return value ? { type: "pilih", target, value } : null;
	}
	return { type: a.type as "pointTo" | "click", target };
}
