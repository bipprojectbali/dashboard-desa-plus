import {
	ALL_WIDGET_IDS,
	type WallCategory,
} from "@/components/wall/wall-layout-utils";
import { type WidgetMeta, widgetMeta } from "@/components/wall/widget-meta";
import type { FeatureKey } from "@/utils/permission";
import type { PointerTarget } from "./types";

/** Rute kiosk NOC. Sengaja TIDAK masuk POINTER_ROUTES: AI tidak boleh membuka/meninggalkannya lewat navigasi. */
export const WALL_ROUTE = "/wall";
export const WALL_TARGET_PREFIX = "wall.";

/** True bila rute klien adalah layar NOC (`/wall`, `/wall/`, `/wall?key=…`). Hanya pembatas aksi UI, bukan otorisasi data. */
export function isWallRoute(route: unknown): boolean {
	if (typeof route !== "string") return false;
	const path = route.split(/[?#]/, 1)[0] ?? "";
	return path === WALL_ROUTE || path === `${WALL_ROUTE}/`;
}

export function isWallTargetId(value: unknown): boolean {
	return typeof value === "string" && value.startsWith(WALL_TARGET_PREFIX);
}

/**
 * Izin per kategori widget — sama dengan izin modul sumbernya. `ops` (Status
 * Sistem) memakai `view-dashboard`: user memutuskan akun kiosk NOC boleh
 * ditunjukkan widget ini. Pointer hanya menunjuk (read-only); tidak ada aksi
 * sinkronisasi yang dipicu, jadi `sync-noc` tidak diperlukan.
 */
export const WALL_CATEGORY_FEATURE: Record<WallCategory, FeatureKey> = {
	beranda: "view-dashboard",
	keuangan: "view-keuangan",
	pengaduan: "view-pengaduan",
	demografi: "view-demografi",
	divisi: "view-kinerja-divisi",
	keamanan: "view-keamanan",
	sosial: "view-sosial",
	bumdes: "view-bumdes",
	jenna: "view-jenna-analytic",
	ops: "view-dashboard",
};

const CATEGORY_LABEL: Record<WallCategory, string> = {
	beranda: "Beranda",
	keuangan: "Keuangan",
	pengaduan: "Pengaduan & Layanan",
	demografi: "Demografi",
	divisi: "Kinerja Divisi",
	keamanan: "Keamanan",
	sosial: "Sosial",
	bumdes: "BUMDes",
	jenna: "Jenna Analytic",
	ops: "Status Sistem",
};

/** Turunkan target penunjuk dari daftar widget wall (id/judul/kategori) — tidak diketik ulang per widget. */
export function deriveWallTargets(
	widgets: readonly WidgetMeta[],
): PointerTarget[] {
	return widgets.map((w) => ({
		id: `${WALL_TARGET_PREFIX}${w.id}`,
		route: WALL_ROUTE,
		label: w.title,
		deskripsi: `Widget "${w.title}" (${CATEGORY_LABEL[w.category]}) di layar NOC.`,
		requiredFeature: WALL_CATEGORY_FEATURE[w.category],
		kind: "view",
	}));
}

/** Target widget layar NOC; hanya dipakai saat rute klien `/wall`. */
export const WALL_TARGETS: readonly PointerTarget[] = deriveWallTargets(
	ALL_WIDGET_IDS.map(widgetMeta),
);
