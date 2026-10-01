import type { PointerTarget } from "./types";

const KEUANGAN = "/keuangan-anggaran";

function keuangan(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `keuangan.${bagian}`,
		route: KEUANGAN,
		label,
		deskripsi,
		requiredFeature: "view-keuangan",
		kind: "view",
		...extra,
	};
}

/** Target percontohan halaman Keuangan (rancangan 05 P5). Beranda menyusul. */
export const KEUANGAN_TARGETS: readonly PointerTarget[] = [
	keuangan(
		"tahun",
		"Pemilih tahun anggaran",
		"Dropdown untuk memilih tahun APBDes yang ditampilkan (hanya ada bila data lebih dari satu tahun).",
		{ pilih: { kind: "tahun" } },
	),
	keuangan(
		"kpi-total",
		"Kartu Total APBDes",
		"Kartu ringkasan total anggaran APBDes tahun terpilih.",
	),
	keuangan(
		"kpi-realisasi",
		"Kartu Realisasi",
		"Kartu persentase realisasi anggaran (belanja terhadap total anggaran).",
	),
	keuangan(
		"kpi-pemasukan",
		"Kartu Pemasukan",
		"Kartu total realisasi pendapatan/pemasukan.",
	),
	keuangan(
		"kpi-pengeluaran",
		"Kartu Pengeluaran",
		"Kartu total realisasi belanja/pengeluaran.",
	),
	keuangan(
		"pendapatan-belanja",
		"Grafik pendapatan & belanja bulanan",
		"Grafik tren pendapatan dan belanja per bulan.",
	),
	keuangan(
		"alokasi",
		"Grafik alokasi anggaran",
		"Grafik pembagian anggaran per sektor/bidang.",
	),
	keuangan(
		"laporan",
		"Laporan APBDes",
		"Rincian pendapatan, belanja, dan saldo APBDes per kategori.",
	),
	keuangan(
		"dana-bantuan",
		"Dana bantuan",
		"Daftar dana bantuan (sumber, jumlah, status).",
	),
	keuangan(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data keuangan; hanya muncul saat data gagal dimuat.",
		{ clickable: true },
	),
];
