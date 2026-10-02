import { hidePointer, pointerStore } from "./pointer-store";

/** Satu rangkaian aksi penunjuk yang sedang berjalan; `cancelled` dibaca pelaksana di tiap titik tunggu. */
export interface PointerRun {
	cancelled: boolean;
}

// Di luar proxy valtio: murni koordinasi imperatif, bukan state tampilan.
const activeRuns = new Set<PointerRun>();
const cancelListeners = new Set<() => void>();
let pointerNavDepth = 0;

export function beginPointerRun(): PointerRun {
	const run: PointerRun = { cancelled: false };
	activeRuns.add(run);
	return run;
}

export function endPointerRun(run: PointerRun): void {
	activeRuns.delete(run);
}

export function isPointerRunActive(): boolean {
	return activeRuns.size > 0;
}

/** Pembatalan hanya berlaku bagi run yang sedang aktif saat dipanggil; run baru sesudahnya tidak terpengaruh. */
function stopRuns(): boolean {
	let stopped = false;
	for (const run of activeRuns) {
		run.cancelled = true;
		stopped = true;
	}
	activeRuns.clear();
	return stopped;
}

function notifyCancel(): void {
	for (const listener of cancelListeners) listener();
}

/**
 * Pemicu "kuat" (Esc, navigasi manual, panel ditutup): hentikan run aktif,
 * sembunyikan kursor/sorotan yang masih tampil, dan kabari pendengar (panduan
 * bertahap). Senyap: tidak ada pesan ke user. Benar bila ada yang dihentikan.
 */
export function cancelPointer(): boolean {
	const stopped = stopRuns();
	const visible = pointerStore.cursor !== null;
	if (stopped || visible) hidePointer();
	notifyCancel();
	return stopped || visible;
}

/**
 * Pemicu gulir/sentuh/keyboard oleh user: hanya menghentikan run yang masih
 * meluncur atau menunggu. Gulir setelah kursor tiba (run selesai) tidak
 * menyentuh apa pun, sehingga kursor tetap mengikuti target (refreshPointer).
 */
export function cancelPointerIfRunning(): boolean {
	if (!stopRuns()) return false;
	hidePointer();
	notifyCancel();
	return true;
}

/** Daftarkan pendengar pembatalan; mengembalikan fungsi untuk melepas. */
export function onPointerCancel(listener: () => void): () => void {
	cancelListeners.add(listener);
	return () => {
		cancelListeners.delete(listener);
	};
}

/** Jalankan navigasi milik penunjuk sendiri agar tidak dikira navigasi manual user. */
export async function withPointerNavigation<T>(
	navigate: () => T | Promise<T>,
): Promise<T> {
	pointerNavDepth++;
	try {
		return await navigate();
	} finally {
		pointerNavDepth--;
	}
}

export function isPointerNavigating(): boolean {
	return pointerNavDepth > 0;
}
