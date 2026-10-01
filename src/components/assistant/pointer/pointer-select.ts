import type { UiActionFailure } from "@/types/ai-assistant-pointer";
import { sleep } from "./pointer-dom";

const TRIGGER_SELECTOR = "input, [role='combobox'], button";

/** Teks opsi cocok dengan nilai: sama persis, atau salah satu kata (mis. "Tahun 2025" ↔ "2025"). */
export function optionMatches(text: string, value: string): boolean {
	const t = text.trim();
	return t === value || t.split(/\s+/).includes(value);
}

function findOption(
	doc: Document,
	trigger: Element,
	value: string,
): HTMLElement | null {
	const listboxId = trigger.getAttribute("aria-controls");
	const scope = (listboxId && doc.getElementById(listboxId)) || doc;
	for (const opt of Array.from(
		scope.querySelectorAll<HTMLElement>("[role='option']"),
	)) {
		if (opt.getAttribute("aria-disabled") === "true") continue;
		if (opt.hasAttribute("data-combobox-disabled")) continue;
		if (optionMatches(opt.textContent ?? "", value)) return opt;
	}
	return null;
}

/**
 * Pilih opsi pada Mantine `Select`: buka dropdown (portal), cari opsi
 * berdasarkan teks, klik. Opsi tidak ada → dropdown ditutup, gagal.
 */
export async function pickSelectOption(
	doc: Document,
	anchor: HTMLElement,
	value: string,
	timeoutMs: number,
	pollMs = 50,
): Promise<{ ok: true } | { ok: false; reason: UiActionFailure }> {
	const trigger = anchor.matches(TRIGGER_SELECTOR)
		? anchor
		: anchor.querySelector<HTMLElement>(TRIGGER_SELECTOR);
	if (!trigger) return { ok: false, reason: "option-not-found" };
	if (trigger.getAttribute("aria-expanded") !== "true") trigger.click();
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		const option = findOption(doc, trigger, value);
		if (option) {
			option.click();
			return { ok: true };
		}
		if (Date.now() >= deadline) break;
		await sleep(pollMs);
	}
	trigger.dispatchEvent(
		new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
	);
	return { ok: false, reason: "option-not-found" };
}
