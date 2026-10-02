import { proxy } from "valtio";
import {
	GLIDE_MS,
	glide,
	LEAVE_FADE_MS,
	type MotionTiming,
	nextFrame,
	POINTER_HOLD_MS,
	type PointerPoint,
	SPAWN_DWELL_MS,
	viewportCenter,
} from "./pointer-motion";

export interface PointerRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Fase kursor: `spawning` = baru muncul di tengah (belum terlihat, menunggu frame
 * agar transisi fade-in berjalan), `gliding` = terlihat/meluncur, `arrived` = di
 * target (mengikuti gulir tanpa transisi), `leaving` = memudar keluar.
 */
export type PointerPhase =
	| "idle"
	| "spawning"
	| "gliding"
	| "arrived"
	| "leaving";

/** State kursor virtual + ring sorotan (dirender `AssistantCursor`). `cursor` null = tak ada kursor. */
export const pointerStore = proxy<{
	/** Rect elemen yang disorot; null = tak ada target (ring tidak digambar). */
	rect: PointerRect | null;
	cursor: PointerPoint | null;
	phase: PointerPhase;
	/** Ring tampil hanya setelah kursor tiba. */
	ringVisible: boolean;
	/** false (reduced motion) = tanpa spawn, luncur, maupun transisi. */
	animate: boolean;
}>({
	rect: null,
	cursor: null,
	phase: "idle",
	ringVisible: false,
	animate: true,
});

// Elemen, timer, dan penghitung disimpan di luar proxy: node DOM tidak boleh dibungkus valtio.
let activeEl: Element | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;
/** Naik tiap aksi baru/reset; aksi lama yang masih berjalan berhenti bila token berubah. */
let runToken = 0;
let sequenceDepth = 0;
let holdMs = POINTER_HOLD_MS;

export function rectOf(el: Element): PointerRect {
	const r = el.getBoundingClientRect();
	return { x: r.x, y: r.y, width: r.width, height: r.height };
}

/** Titik kursor: tengah elemen, dibatasi dekat tepi atas agar kartu besar tidak tertutup. */
export function cursorPosition(rect: PointerRect): PointerPoint {
	return {
		x: rect.x + rect.width / 2,
		y: rect.y + Math.min(rect.height / 2, 28),
	};
}

function clearTimers(): void {
	if (hideTimer) clearTimeout(hideTimer);
	if (leaveTimer) clearTimeout(leaveTimer);
	hideTimer = null;
	leaveTimer = null;
}

/** Sembunyikan segera tanpa animasi (juga membatalkan luncuran yang sedang berjalan). */
export function hidePointer(): void {
	runToken++;
	clearTimers();
	activeEl = null;
	pointerStore.rect = null;
	pointerStore.cursor = null;
	pointerStore.phase = "idle";
	pointerStore.ringVisible = false;
}

/** Pudarkan ring + kursor, lalu bersihkan state setelah fade selesai. */
function leavePointer(): void {
	if (!pointerStore.cursor) return;
	const token = runToken;
	pointerStore.ringVisible = false;
	if (!pointerStore.animate) {
		hidePointer();
		return;
	}
	pointerStore.phase = "leaving";
	leaveTimer = setTimeout(() => {
		if (token === runToken) hidePointer();
	}, LEAVE_FADE_MS);
}

function scheduleHide(): void {
	if (hideTimer) clearTimeout(hideTimer);
	hideTimer = null;
	if (sequenceDepth > 0) return;
	hideTimer = setTimeout(leavePointer, holdMs);
}

/** Mulai rangkaian aksi: kursor tidak memudar di antara aksi (termasuk saat pindah halaman). */
export function beginPointerSequence(): void {
	sequenceDepth++;
	if (hideTimer) clearTimeout(hideTimer);
	hideTimer = null;
}

/** Akhiri rangkaian aksi; hitung mundur pudar dimulai bila kursor masih tampil. */
export function endPointerSequence(): void {
	sequenceDepth = Math.max(0, sequenceDepth - 1);
	if (sequenceDepth === 0 && pointerStore.cursor) scheduleHide();
}

/** Lepas target (mis. halaman pindah): ring hilang, kursor tetap di posisi terakhir. */
export function releasePointerTarget(): void {
	activeEl = null;
	pointerStore.rect = null;
	pointerStore.ringVisible = false;
}

/**
 * Tampilkan kursor + sorotan pada `el`. Animasi: kursor muncul di tengah layar
 * (atau berangkat dari posisi terakhir bila masih tampil), meluncur, lalu ring
 * muncul setelah tiba. Promise selesai saat kursor tiba (ring sudah tampil).
 */
export async function showPointer(
	el: Element,
	opts: { animate: boolean } & MotionTiming,
): Promise<void> {
	const token = ++runToken;
	clearTimers();
	activeEl = el;
	holdMs = opts.holdMs ?? POINTER_HOLD_MS;
	pointerStore.animate = opts.animate;
	pointerStore.rect = rectOf(el);
	const target = () => cursorPosition(rectOf(el));

	if (!opts.animate) {
		pointerStore.cursor = target();
		pointerStore.phase = "arrived";
		pointerStore.ringVisible = true;
		scheduleHide();
		return;
	}

	pointerStore.ringVisible = false;
	const fresh = !pointerStore.cursor || pointerStore.phase === "leaving";
	if (fresh) {
		pointerStore.cursor = viewportCenter();
		pointerStore.phase = "spawning";
		await nextFrame();
		if (token !== runToken) return;
		pointerStore.phase = "gliding";
		await new Promise((r) =>
			setTimeout(r, opts.spawnDwellMs ?? SPAWN_DWELL_MS),
		);
		if (token !== runToken) return;
	}
	pointerStore.phase = "gliding";
	const from = pointerStore.cursor ?? viewportCenter();
	await glide({
		from,
		to: target,
		durationMs: opts.glideMs ?? GLIDE_MS,
		onFrame: (p) => {
			pointerStore.cursor = p;
		},
		cancelled: () => token !== runToken,
	});
	if (token !== runToken) return;
	pointerStore.rect = rectOf(el);
	pointerStore.cursor = target();
	pointerStore.phase = "arrived";
	pointerStore.ringVisible = true;
	scheduleHide();
}

/** Ikuti target saat gulir/resize tanpa transisi; hanya setelah kursor tiba. */
export function refreshPointer(): void {
	if (!activeEl || pointerStore.phase !== "arrived") return;
	if (!activeEl.isConnected) {
		releasePointerTarget();
		return;
	}
	const rect = rectOf(activeEl);
	pointerStore.rect = rect;
	pointerStore.cursor = cursorPosition(rect);
}
