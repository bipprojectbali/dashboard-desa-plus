import { proxy } from "valtio";

export interface PointerRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Lama sorotan tampil sebelum hilang sendiri. */
export const POINTER_HOLD_MS = 4000;

/** State kursor virtual + ring sorotan (dirender `AssistantCursor`). `rect` null = disembunyikan. */
export const pointerStore = proxy<{
	rect: PointerRect | null;
	/** false (reduced motion) = kursor langsung muncul di tujuan, tanpa transisi. */
	animate: boolean;
}>({ rect: null, animate: true });

// Elemen & timer disimpan di luar proxy: node DOM tidak boleh dibungkus valtio.
let activeEl: Element | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function rectOf(el: Element): PointerRect {
	const r = el.getBoundingClientRect();
	return { x: r.x, y: r.y, width: r.width, height: r.height };
}

/** Titik kursor: tengah elemen, dibatasi dekat tepi atas agar kartu besar tidak tertutup. */
export function cursorPosition(rect: PointerRect): { x: number; y: number } {
	return {
		x: rect.x + rect.width / 2,
		y: rect.y + Math.min(rect.height / 2, 28),
	};
}

export function hidePointer(): void {
	if (hideTimer) clearTimeout(hideTimer);
	hideTimer = null;
	activeEl = null;
	pointerStore.rect = null;
}

export function showPointer(
	el: Element,
	opts: { animate: boolean; holdMs?: number },
): void {
	if (hideTimer) clearTimeout(hideTimer);
	activeEl = el;
	pointerStore.animate = opts.animate;
	pointerStore.rect = rectOf(el);
	hideTimer = setTimeout(hidePointer, opts.holdMs ?? POINTER_HOLD_MS);
}

/** Hitung ulang posisi (gulir/resize); elemen yang sudah lepas dari DOM → sembunyikan. */
export function refreshPointer(): void {
	if (!activeEl) return;
	if (!activeEl.isConnected) {
		hidePointer();
		return;
	}
	pointerStore.rect = rectOf(activeEl);
}
