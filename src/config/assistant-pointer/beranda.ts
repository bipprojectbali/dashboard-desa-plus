import type { PointerTarget } from "./types";

function beranda(
	bagian: string,
	label: string,
	deskripsi: string,
): PointerTarget {
	return {
		id: `beranda.${bagian}`,
		route: "/",
		label,
		deskripsi,
		requiredFeature: "view-dashboard",
		kind: "view",
	};
}

/** Kartu halaman Beranda; semuanya hanya tampilan, jadi hanya ditunjuk (tanpa klik/pilih). */
export const BERANDA_TARGETS: readonly PointerTarget[] = [
	beranda(
		"surat-minggu-ini",
		"Kartu surat minggu ini",
		"Kartu angka jumlah surat/layanan yang diajukan warga dalam minggu ini.",
	),
	beranda(
		"pengaduan-aktif",
		"Kartu pengaduan aktif",
		"Kartu angka pengaduan warga yang masih baru, beserta jumlah yang ditolak.",
	),
	beranda(
		"layanan-selesai",
		"Kartu layanan selesai",
		"Kartu angka total pengaduan/layanan yang sudah diselesaikan.",
	),
	beranda(
		"total-penduduk",
		"Kartu total penduduk",
		"Kartu angka jumlah penduduk desa beserta jumlah kepala keluarga.",
	),
	beranda(
		"grafik-surat",
		"Grafik layanan surat",
		'Grafik "Statistik Surat": tren jumlah surat per bulan.',
	),
	beranda(
		"kepuasan",
		"Grafik kepuasan layanan",
		'Grafik "Tingkat Kepuasan" warga terhadap layanan desa.',
	),
	beranda(
		"progres-divisi",
		"Progres divisi",
		"Ringkasan progres kegiatan tiap divisi di Beranda (versi singkat; peringkat divisi teraktif ada di halaman Kinerja Divisi).",
	),
	beranda(
		"kalender-kegiatan",
		"Kalender kegiatan",
		"Daftar agenda/kegiatan desa yang akan datang.",
	),
	beranda(
		"apbdes",
		"Grafik realisasi APBDes",
		"Ringkasan realisasi APBDes (pendapatan, belanja, pembiayaan) tahun terbaru.",
	),
	beranda(
		"sdgs",
		"Skor SDGs desa",
		"Empat kartu tujuan SDGs dengan skor tertinggi.",
	),
];
