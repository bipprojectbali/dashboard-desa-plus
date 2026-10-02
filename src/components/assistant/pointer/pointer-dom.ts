import { anchorSelector } from "@/config/assistant-pointer";
import {
	type MotionTiming,
	SCROLL_POLL_MS,
	SCROLL_SETTLE_MAX_MS,
	SCROLL_START_GRACE_MS,
} from "./pointer-motion";
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

const supportsScrollEnd = (doc: Document): boolean =>
	"onscrollend" in (doc.defaultView ?? window);

/**
 * Tunggu gulir halus selesai: `scrollend` bila didukung, bila tidak posisi
 * elemen stabil dua kali berturut-turut. Tanpa gulir sama sekali (elemen sudah
 * terlihat) selesai setelah jeda singkat; selalu dibatasi `scrollMaxMs`.
 */
export function waitForScrollEnd(
	el: Element,
	t: MotionTiming = {},
): Promise<void> {
	const doc = el.ownerDocument;
	const maxMs = t.scrollMaxMs ?? SCROLL_SETTLE_MAX_MS;
	const graceMs = t.scrollGraceMs ?? SCROLL_START_GRACE_MS;
	const pollMs = t.scrollPollMs ?? SCROLL_POLL_MS;
	const native = supportsScrollEnd(doc);
	return new Promise((resolve) => {
		let started = false;
		let prev = rectOf(el);
		let stable = 0;
		const timers: ReturnType<typeof setTimeout>[] = [];
		const onScroll = () => {
			started = true;
		};
		const finish = () => {
			for (const id of timers) clearTimeout(id);
			clearInterval(poll);
			doc.removeEventListener("scroll", onScroll, true);
			doc.removeEventListener("scrollend", finish, true);
			resolve();
		};
		doc.addEventListener("scroll", onScroll, true);
		if (native) doc.addEventListener("scrollend", finish, true);
		const poll = setInterval(() => {
			const cur = rectOf(el);
			const moved = cur.x !== prev.x || cur.y !== prev.y;
			if (moved) started = true;
			stable = moved ? 0 : stable + 1;
			prev = cur;
			if (!native && started && stable >= 2) finish();
		}, pollMs);
		timers.push(setTimeout(() => !started && finish(), graceMs));
		timers.push(setTimeout(finish, maxMs));
	});
}

/**
 * Gulir ke elemen, tunggu gulir selesai, lalu tampilkan kursor + sorotan.
 * Reduced motion: gulir langsung, tanpa spawn/luncur; sorotan tetap tampil.
 */
export async function pointAtElement(
	el: HTMLElement,
	reducedMotion: boolean,
	timing: MotionTiming = {},
): Promise<void> {
	el.scrollIntoView({
		block: "center",
		inline: "nearest",
		behavior: reducedMotion ? "auto" : "smooth",
	});
	if (!reducedMotion) await waitForScrollEnd(el, timing);
	await showPointer(el, { animate: !reducedMotion, ...timing });
}
