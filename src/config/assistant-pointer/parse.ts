import type {
	GuideAction,
	GuideStep,
	UiAction,
} from "@/types/ai-assistant-pointer";
import {
	GUIDE_AUTO_ADVANCE_MAX_SEC,
	GUIDE_AUTO_ADVANCE_MIN_SEC,
	GUIDE_MAX_STEPS,
	GUIDE_MAX_TEXT,
	UI_ACTION_TYPES,
} from "@/types/ai-assistant-pointer";

function nonEmptyString(v: unknown): string | null {
	return typeof v === "string" && v !== "" ? v : null;
}

function parseGuideStep(raw: unknown): GuideStep | null {
	if (typeof raw !== "object" || raw === null) return null;
	const s = raw as Record<string, unknown>;
	const target = nonEmptyString(s.target);
	const text = typeof s.text === "string" ? s.text.trim() : "";
	if (!target || text === "" || text.length > GUIDE_MAX_TEXT) return null;
	return { target, text };
}

/** Panduan valid bila 1–5 langkah semuanya valid; detik lanjut otomatis di luar rentang dijepit. */
function parseGuide(a: Record<string, unknown>): GuideAction | null {
	if (!Array.isArray(a.steps)) return null;
	if (a.steps.length < 1 || a.steps.length > GUIDE_MAX_STEPS) return null;
	const steps: GuideStep[] = [];
	for (const raw of a.steps) {
		const step = parseGuideStep(raw);
		if (!step) return null;
		steps.push(step);
	}
	const sec = a.autoAdvanceSec;
	if (typeof sec !== "number" || !Number.isFinite(sec))
		return { type: "guide", steps };
	const autoAdvanceSec = Math.min(
		GUIDE_AUTO_ADVANCE_MAX_SEC,
		Math.max(GUIDE_AUTO_ADVANCE_MIN_SEC, Math.round(sec)),
	);
	return { type: "guide", steps, autoAdvanceSec };
}

/**
 * Validasi bentuk aksi dari sumber tak tepercaya (respons server). Hanya cek
 * jenis & tipe field; keanggotaan registry dicek pelaksana/tool. `null` = tidak valid.
 */
export function parseUiAction(raw: unknown): UiAction | null {
	if (typeof raw !== "object" || raw === null) return null;
	const a = raw as Record<string, unknown>;
	if (!UI_ACTION_TYPES.some((t) => t === a.type)) return null;
	if (a.type === "guide") return parseGuide(a);
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
