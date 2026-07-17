import { arrayMove } from "@dnd-kit/sortable";
import { proxy } from "valtio";
import {
	fetchWallLayout,
	saveWallLayout,
} from "@/components/wall/fetch-wall-layout";
import { clampGeom, type WidgetGeom } from "@/components/wall/wall-bento";
import {
	DEFAULT_LAYOUT,
	resolveLayout,
	validateLayout,
	validateSizes,
	type WallSizeMap,
	type WidgetId,
} from "@/components/wall/wall-layout-utils";

type LayoutStatus = "idle" | "loading" | "saving" | "error";

interface WallLayoutState {
	/** Susunan aktif yang sedang di-edit (buffer). */
	order: WidgetId[];
	/** Override ukuran per widget yang sedang di-edit (buffer). */
	sizes: WallSizeMap;
	/** Susunan terakhir yang tersimpan di server — pembanding `dirty`. */
	saved: WidgetId[];
	/** Ukuran terakhir tersimpan — pembanding `dirty`. */
	savedSizes: WallSizeMap;
	status: LayoutStatus;
	/** Pesan error terakhir (load/save), null saat sukses. */
	error: string | null;
}

/**
 * Store buffer edit layout wall — dipakai mode edit inline di `/wall` (admin)
 * dan section "Video Wall" di `/admin/settings`. Read path `/wall` (display)
 * TIDAK pakai store ini — dia stateless via useQuery. Store cuma menampung
 * perubahan (urutan + ukuran) sebelum di-`saveLayout`.
 */
export const wallLayoutStore = proxy<WallLayoutState>({
	order: [...DEFAULT_LAYOUT],
	sizes: {},
	saved: [...DEFAULT_LAYOUT],
	savedSizes: {},
	status: "idle",
	error: null,
});

/** Bandingkan dua peta sizes (hanya key di `order` yang relevan). */
function sizesEqual(a: WallSizeMap, b: WallSizeMap): boolean {
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	for (const k of keys) {
		const ga = a[k];
		const gb = b[k];
		if (!ga || !gb) return false;
		if (ga.w !== gb.w || ga.h !== gb.h) return false;
	}
	return true;
}

/** True bila buffer beda dari yang tersimpan (untuk enable tombol Simpan). */
export function isDirty(): boolean {
	const { order, saved, sizes, savedSizes } = wallLayoutStore;
	if (order.length !== saved.length) return true;
	if (order.some((id, i) => id !== saved[i])) return true;
	return !sizesEqual(sizes, savedSizes);
}

export function setOrder(order: WidgetId[]) {
	wallLayoutStore.order = order;
}

/**
 * Seed buffer dari order + sizes yang SEDANG tampil (mode edit inline `/wall`) —
 * tanpa fetch server, tanpa flicker. Baseline `saved`/`savedSizes` = nilai awal
 * supaya `isDirty()` false sampai admin benar-benar mengubah sesuatu.
 */
export function initBufferFrom(
	order: readonly WidgetId[],
	sizes?: WallSizeMap | null,
) {
	const s = sizes ? { ...sizes } : {};
	wallLayoutStore.order = [...order];
	wallLayoutStore.sizes = s;
	wallLayoutStore.saved = [...order];
	wallLayoutStore.savedSizes = { ...s };
	wallLayoutStore.status = "idle";
	wallLayoutStore.error = null;
}

/** Tambah widget ke slot berikutnya bila belum terpasang. */
export function addWidget(id: WidgetId) {
	if (wallLayoutStore.order.includes(id)) return;
	wallLayoutStore.order = [...wallLayoutStore.order, id];
}

export function removeWidget(id: WidgetId) {
	wallLayoutStore.order = wallLayoutStore.order.filter((w) => w !== id);
	// Buang override ukurannya juga — tak perlu simpan geometri widget yang hilang.
	if (wallLayoutStore.sizes[id]) {
		const next = { ...wallLayoutStore.sizes };
		delete next[id];
		wallLayoutStore.sizes = next;
	}
}

/** Pindah widget dari index `from` ke `to` (dipakai dnd-kit onDragEnd). */
export function moveWidget(from: number, to: number) {
	wallLayoutStore.order = arrayMove(wallLayoutStore.order, from, to);
}

/**
 * Set ukuran override sebuah widget (dari drag-resize). Di-clamp ke batas
 * sebelum simpan supaya buffer selalu valid — handle UI tak perlu menjaga batas.
 */
export function resizeWidget(id: WidgetId, geom: WidgetGeom) {
	wallLayoutStore.sizes = {
		...wallLayoutStore.sizes,
		[id]: clampGeom(geom),
	};
}

export function resetToDefault() {
	wallLayoutStore.order = [...DEFAULT_LAYOUT];
	// Reset ukuran juga → semua kembali ke preset default registry.
	wallLayoutStore.sizes = {};
}

/** Muat layout dari server → resolve → isi buffer + baseline `saved`. */
export async function loadLayout(): Promise<void> {
	wallLayoutStore.status = "loading";
	wallLayoutStore.error = null;
	try {
		const { order, sizes } = await fetchWallLayout();
		const resolved = resolveLayout(order);
		const s = sizes ?? {};
		wallLayoutStore.order = resolved;
		wallLayoutStore.sizes = { ...s };
		wallLayoutStore.saved = [...resolved];
		wallLayoutStore.savedSizes = { ...s };
		wallLayoutStore.status = "idle";
	} catch (err) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error =
			err instanceof Error ? err.message : "Gagal memuat layout";
	}
}

/**
 * Buang override ukuran untuk widget yang tak lagi ada di `order` — jangan
 * kirim geometri yatim ke server. Balikin null bila kosong (kolom DB NULL).
 */
function prunedSizes(): WallSizeMap | null {
	const inOrder = new Set(wallLayoutStore.order);
	const out: WallSizeMap = {};
	for (const [id, geom] of Object.entries(wallLayoutStore.sizes)) {
		if (inOrder.has(id as WidgetId)) out[id] = geom;
	}
	return Object.keys(out).length > 0 ? out : null;
}

/** Validasi lokal → simpan ke server → set baseline `saved` = buffer. */
export async function saveLayout(): Promise<void> {
	const sizes = prunedSizes();
	const check = validateLayout(wallLayoutStore.order);
	const sizeCheck = validateSizes(sizes);
	if (!check.ok || !sizeCheck.ok) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error = [...check.errors, ...sizeCheck.errors].join("; ");
		throw new Error(wallLayoutStore.error);
	}

	wallLayoutStore.status = "saving";
	wallLayoutStore.error = null;
	try {
		await saveWallLayout(wallLayoutStore.order, sizes);
		wallLayoutStore.saved = [...wallLayoutStore.order];
		wallLayoutStore.savedSizes = sizes ? { ...sizes } : {};
		wallLayoutStore.status = "idle";
	} catch (err) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error =
			err instanceof Error ? err.message : "Gagal menyimpan layout";
		throw err;
	}
}
