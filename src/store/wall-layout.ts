import { arrayMove } from "@dnd-kit/sortable";
import { proxy } from "valtio";
import {
	fetchWallLayout,
	saveWallLayout,
} from "@/components/wall/fetch-wall-layout";
import {
	DEFAULT_LAYOUT,
	resolveLayout,
	validateLayout,
	type WidgetId,
} from "@/components/wall/wall-layout-utils";

type LayoutStatus = "idle" | "loading" | "saving" | "error";

interface WallLayoutState {
	/** Susunan aktif yang sedang di-edit (buffer). */
	order: WidgetId[];
	/** Susunan terakhir yang tersimpan di server — pembanding `dirty`. */
	saved: WidgetId[];
	status: LayoutStatus;
	/** Pesan error terakhir (load/save), null saat sukses. */
	error: string | null;
}

/**
 * Store buffer edit layout wall untuk halaman admin (`/pengaturan/wall`).
 * Read path `/wall` TIDAK pakai store ini — dia stateless via useQuery.
 * Store cuma menampung perubahan sebelum di-`saveLayout`.
 */
export const wallLayoutStore = proxy<WallLayoutState>({
	order: [...DEFAULT_LAYOUT],
	saved: [...DEFAULT_LAYOUT],
	status: "idle",
	error: null,
});

/** True bila buffer beda dari yang tersimpan (untuk enable tombol Simpan). */
export function isDirty(): boolean {
	const { order, saved } = wallLayoutStore;
	if (order.length !== saved.length) return true;
	return order.some((id, i) => id !== saved[i]);
}

export function setOrder(order: WidgetId[]) {
	wallLayoutStore.order = order;
}

/** Tambah widget ke slot berikutnya bila masih ada ruang & belum terpasang. */
export function addWidget(id: WidgetId) {
	if (wallLayoutStore.order.includes(id)) return;
	wallLayoutStore.order = [...wallLayoutStore.order, id];
}

export function removeWidget(id: WidgetId) {
	wallLayoutStore.order = wallLayoutStore.order.filter((w) => w !== id);
}

/** Pindah widget dari index `from` ke `to` (dipakai dnd-kit onDragEnd). */
export function moveWidget(from: number, to: number) {
	wallLayoutStore.order = arrayMove(wallLayoutStore.order, from, to);
}

export function resetToDefault() {
	wallLayoutStore.order = [...DEFAULT_LAYOUT];
}

/** Muat layout dari server → resolve → isi buffer + baseline `saved`. */
export async function loadLayout(): Promise<void> {
	wallLayoutStore.status = "loading";
	wallLayoutStore.error = null;
	try {
		const raw = await fetchWallLayout();
		const resolved = resolveLayout(raw);
		wallLayoutStore.order = resolved;
		wallLayoutStore.saved = [...resolved];
		wallLayoutStore.status = "idle";
	} catch (err) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error =
			err instanceof Error ? err.message : "Gagal memuat layout";
	}
}

/** Validasi lokal → simpan ke server → set baseline `saved` = buffer. */
export async function saveLayout(): Promise<void> {
	const check = validateLayout(wallLayoutStore.order);
	if (!check.ok) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error = check.errors.join("; ");
		throw new Error(wallLayoutStore.error);
	}

	wallLayoutStore.status = "saving";
	wallLayoutStore.error = null;
	try {
		await saveWallLayout(wallLayoutStore.order);
		wallLayoutStore.saved = [...wallLayoutStore.order];
		wallLayoutStore.status = "idle";
	} catch (err) {
		wallLayoutStore.status = "error";
		wallLayoutStore.error =
			err instanceof Error ? err.message : "Gagal menyimpan layout";
		throw err;
	}
}
