import type { PointerTarget } from "./types";

function keamanan(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `keamanan.${bagian}`,
		route: "/keamanan",
		label,
		deskripsi,
		requiredFeature: "view-keamanan",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman Keamanan. Semua hanya ditunjuk; "Coba lagi" memicu invalidasi cache server sehingga tidak boleh diklik asisten. */
export const KEAMANAN_TARGETS: readonly PointerTarget[] = [
	keamanan(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data keamanan; hanya muncul bila data gagal dimuat. Hanya ditunjuk, user menekannya sendiri.",
	),
	keamanan(
		"kpi-cctv-aktif",
		"Kartu CCTV aktif",
		"Kartu jumlah CCTV yang aktif.",
	),
	keamanan(
		"kpi-laporan",
		"Kartu laporan keamanan",
		"Kartu jumlah laporan keamanan minggu ini.",
	),
	keamanan("peta", "Peta CCTV", "Peta lokasi CCTV desa."),
	keamanan(
		"daftar-cctv",
		"Daftar CCTV",
		"Daftar CCTV beserta status dan lokasinya.",
	),
	keamanan(
		"laporan",
		"Laporan keamanan publik",
		"Kartu laporan keamanan terbaru dari warga.",
	),
];
