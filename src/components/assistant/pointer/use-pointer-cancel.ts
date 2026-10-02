import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	cancelPointer,
	cancelPointerIfRunning,
	isPointerNavigating,
} from "./pointer-cancel";

/** Penanda panel asisten: gulir/ketik di dalamnya bukan gulir halaman, jadi tidak membatalkan penunjuk. */
export const ASSISTANT_PANEL_ATTR = "data-assistant-panel";

/** Tombol yang menggulir halaman bila fokus tidak di kolom isian. */
export const SCROLL_KEYS: ReadonlySet<string> = new Set([
	"PageUp",
	"PageDown",
	" ",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End",
]);

const EDITABLE_SELECTOR =
	"input, textarea, select, [contenteditable]:not([contenteditable='false'])";

const asElement = (target: EventTarget | null): Element | null =>
	target instanceof Element ? target : null;

/** Kolom isian memakai tombol panah/spasi untuk mengedit, bukan menggulir. */
export function isEditableTarget(target: EventTarget | null): boolean {
	return asElement(target)?.closest(EDITABLE_SELECTOR) != null;
}

export function isInsidePanel(target: EventTarget | null): boolean {
	return asElement(target)?.closest(`[${ASSISTANT_PANEL_ATTR}]`) != null;
}

/** Tombol keyboard yang berarti user menggulir halaman (tanpa modifier, di luar isian & panel). */
export function isPageScrollKey(event: KeyboardEvent): boolean {
	return (
		SCROLL_KEYS.has(event.key) &&
		!event.ctrlKey &&
		!event.metaKey &&
		!event.altKey &&
		!isEditableTarget(event.target) &&
		!isInsidePanel(event.target)
	);
}

/** Bagian router yang dipakai pengendali: cukup `subscribe` (memudahkan test). */
export interface NavigationSource {
	subscribe: (
		event: "onBeforeNavigate",
		listener: (event: { pathChanged: boolean }) => void,
	) => () => void;
}

/**
 * Pasang pemicu pembatalan: gulir/sentuh/keyboard oleh user (hanya membatalkan
 * run yang masih berjalan), Esc, dan navigasi manual (bukan navigasi milik
 * penunjuk). Mengembalikan fungsi pelepas.
 */
export function attachPointerCancel(
	win: Window,
	router: NavigationSource,
): () => void {
	const onScrollIntent = (event: Event) => {
		if (!isInsidePanel(event.target)) cancelPointerIfRunning();
	};
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") cancelPointer();
		else if (isPageScrollKey(event)) cancelPointerIfRunning();
	};
	win.addEventListener("wheel", onScrollIntent, { passive: true });
	win.addEventListener("touchmove", onScrollIntent, { passive: true });
	win.addEventListener("keydown", onKeyDown);
	const unsubscribe = router.subscribe("onBeforeNavigate", (event) => {
		if (event.pathChanged && !isPointerNavigating()) cancelPointer();
	});
	return () => {
		win.removeEventListener("wheel", onScrollIntent);
		win.removeEventListener("touchmove", onScrollIntent);
		win.removeEventListener("keydown", onKeyDown);
		unsubscribe();
	};
}

/** Satu pengendali pembatalan untuk penunjuk (dan panduan). Penutupan panel dipanggil dari tombol tutupnya. */
export function usePointerCancel(): void {
	const router = useRouter();
	useEffect(() => attachPointerCancel(window, router), [router]);
}
