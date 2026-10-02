import type { PointerTarget } from "./types";

function demografi(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `demografi.${bagian}`,
		route: "/demografi-pekerjaan",
		label,
		deskripsi,
		requiredFeature: "view-demografi",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman Demografi & Kependudukan. Semua hanya ditunjuk: tidak ada klik/pilih oleh AI (`pilih` tahun memvalidasi terhadap tahun APBDes, bukan tahun data agama, jadi tidak cocok). */
export const DEMOGRAFI_TARGETS: readonly PointerTarget[] = [
	demografi(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data demografi; hanya muncul bila data gagal dimuat. Hanya ditunjuk, user menekannya sendiri.",
	),
	demografi(
		"kpi-penduduk",
		"Kartu total penduduk",
		"Kartu jumlah penduduk aktif terdaftar.",
	),
	demografi(
		"kpi-kk",
		"Kartu kepala keluarga",
		"Kartu jumlah kepala keluarga (KK).",
	),
	demografi(
		"kpi-kelahiran",
		"Kartu kelahiran",
		"Kartu jumlah kelahiran tahun ini.",
	),
	demografi(
		"kpi-kemiskinan",
		"Kartu kemiskinan",
		"Kartu jumlah keluarga prasejahtera.",
	),
	demografi(
		"umur",
		"Pengelompokan umur",
		"Grafik batang jumlah penduduk per kelompok umur.",
	),
	demografi(
		"pekerjaan",
		"Demografi pekerjaan",
		"Grafik batang jumlah penduduk per jenis pekerjaan.",
	),
	demografi(
		"dinamika",
		"Dinamika penduduk",
		"Kartu kelahiran, kematian, pindah masuk, dan pindah keluar.",
	),
	demografi(
		"agama",
		"Distribusi agama",
		"Grafik donat dan daftar jumlah penduduk per agama.",
	),
	demografi(
		"tahun-agama",
		"Pemilih tahun distribusi agama",
		"Dropdown untuk memilih tahun data distribusi agama (hanya ada bila data lebih dari satu tahun). Hanya ditunjuk, user memilih tahunnya sendiri.",
	),
	demografi(
		"banjar",
		"Data per banjar",
		"Tabel penduduk, KK, dan jumlah miskin per banjar.",
	),
	demografi(
		"sektor",
		"Sektor unggulan",
		"Grafik batang statistik sektor unggulan desa.",
	),
];
