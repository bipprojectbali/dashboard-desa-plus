import { anchorSelector } from "@/config/assistant-pointer";
import { rectOf, showPointer } from "./pointer-store";

export const sleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/** Tunggu elemen `data-ai-target` muncul (halaman/data masih dimuat); null bila batas waktu habis. */
export async function waitForAnchor(
	doc: Document,
	id: string,
	timeoutMs: number,
	pollMs = 50,
): Promise<HTMLElement | null> {
	const selector = anchorSelector(id);
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		const el = doc.querySelector<HTMLElement>(selector);
		if (el?.isConnected) return el;
		if (Date.now() >= deadline) return null;
		await sleep(pollMs);
	}
}

const SCROLL_SETTLE_MAX_MS = 900;

/** Tunggu gulir halus selesai (posisi elemen tidak berubah dua kali berturut-turut). */
async function waitForScrollSettle(el: Element): Promise<void> {
	const deadline = Date.now() + SCROLL_SETTLE_MAX_MS;
	let prev = rectOf(el);
	let stable = 0;
	while (stable < 2 && Date.now() < deadline) {
		await sleep(50);
		const cur = rectOf(el);
		stable = cur.x === prev.x && cur.y === prev.y ? stable + 1 : 0;
		prev = cur;
	}
}

/**
 * Gulir ke elemen lalu tampilkan kursor + sorotan. Reduced motion: gulir
 * langsung (tanpa animasi) dan kursor tanpa transisi; sorotan tetap tampil.
 */
export async function pointAtElement(
	el: HTMLElement,
	reducedMotion: boolean,
): Promise<void> {
	el.scrollIntoView({
		block: "center",
		inline: "nearest",
		behavior: reducedMotion ? "auto" : "smooth",
	});
	if (!reducedMotion) await waitForScrollSettle(el);
	showPointer(el, { animate: !reducedMotion });
}
