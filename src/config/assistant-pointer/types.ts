// Hanya tipe (terhapus saat build) — modul permission menyentuh DB, tidak boleh masuk bundle browser.
import type { FeatureKey } from "@/utils/permission";

/** Nama atribut penanda target di DOM: `data-ai-target="keuangan.laporan"`. */
export const AI_TARGET_ATTR = "data-ai-target";
/** Penanda tambahan elemen tampilan yang boleh diklik AI (daftar izin, bukan daftar larangan). */
export const AI_CLICKABLE_ATTR = "data-ai-clickable";

export type PointerTargetKind = "view" | "write";

/** Nilai yang boleh dipilih pada kontrol: daftar tetap, atau tahun dari data. */
export type PilihSpec =
	| { kind: "tahun" }
	| { kind: "enum"; values: readonly string[] };

export interface PointerTarget {
	/** `modul.bagian`, sama dengan nilai `data-ai-target` di komponen. */
	id: string;
	route: string;
	label: string;
	/** Dibaca LLM untuk memilih target. */
	deskripsi: string;
	requiredFeature: FeatureKey;
	/** `write` = mengubah data: hanya boleh ditunjuk, tidak pernah diklik/dipilih AI. */
	kind: PointerTargetKind;
	/** Boleh diklik AI (hanya bermakna untuk `view`). */
	clickable?: boolean;
	/** Kontrol pilihan (mis. Mantine Select) yang boleh diisi lewat `pilih`. */
	pilih?: PilihSpec;
}

export interface PointerRoute {
	route: string;
	label: string;
	requiredFeature: FeatureKey;
}
