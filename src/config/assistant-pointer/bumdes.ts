import type { PointerTarget } from "./types";

function bumdes(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `bumdes.${bagian}`,
		route: "/bumdes",
		label,
		deskripsi,
		requiredFeature: "view-bumdes",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman BUMDes & UMKM. Hanya tombol rentang waktu yang boleh diklik (murni mengganti tampilan, tidak mengubah data). */
export const BUMDES_TARGETS: readonly PointerTarget[] = [
	bumdes(
		"tampilan",
		"Pilihan rentang waktu",
		"Kartu pengaturan tampilan dengan tombol rentang Minggu Ini dan Bulan Ini.",
	),
	bumdes(
		"rentang-minggu",
		"Tombol Minggu Ini",
		"Tombol mengganti rentang tampilan penjualan UMKM ke minggu ini.",
		{ clickable: true },
	),
	bumdes(
		"rentang-bulan",
		"Tombol Bulan Ini",
		"Tombol mengganti rentang tampilan penjualan UMKM ke bulan ini.",
		{ clickable: true },
	),
	bumdes("kpi-umkm-aktif", "Kartu UMKM aktif", "Kartu jumlah UMKM yang aktif."),
	bumdes(
		"kpi-umkm-terdaftar",
		"Kartu UMKM terdaftar",
		"Kartu jumlah seluruh UMKM yang terdaftar.",
	),
	bumdes(
		"kpi-omzet",
		"Kartu omzet",
		"Kartu total omzet penjualan UMKM pada rentang terpilih.",
	),
	bumdes(
		"kpi-kategori-terbanyak",
		"Kartu kategori UMKM terbanyak",
		"Kartu kategori UMKM dengan jumlah terbanyak.",
	),
	bumdes("produk-unggulan", "Produk unggulan", "Daftar produk unggulan UMKM."),
	bumdes(
		"top-produk",
		"Produk terlaris",
		"Peringkat produk dengan penjualan tertinggi.",
	),
	bumdes(
		"detail-penjualan",
		"Tabel detail penjualan",
		"Tabel rincian penjualan per UMKM beserta tombol Detail per baris.",
	),
	bumdes(
		"filter",
		"Filter tabel penjualan",
		"Pilihan kategori dan UMKM untuk menyaring tabel penjualan; user memilihnya sendiri.",
	),
];
