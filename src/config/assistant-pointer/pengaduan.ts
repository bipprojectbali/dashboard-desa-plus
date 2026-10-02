import type { PointerTarget } from "./types";

function pengaduan(
	bagian: string,
	label: string,
	deskripsi: string,
): PointerTarget {
	return {
		id: `pengaduan.${bagian}`,
		route: "/pengaduan-layanan-publik",
		label,
		deskripsi,
		requiredFeature: "view-pengaduan",
		kind: "view",
	};
}

/** Bagian halaman Pengaduan & Layanan Publik. Semuanya hanya ditunjuk: halaman tidak punya tab/filter lokal, dan "Coba lagi" memicu fetch ke server. */
export const PENGADUAN_TARGETS: readonly PointerTarget[] = [
	pengaduan(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data pengaduan; hanya muncul bila data gagal dimuat. Hanya ditunjuk, user menekannya sendiri.",
	),
	pengaduan(
		"kpi-total",
		"Kartu total pengaduan",
		"Kartu jumlah seluruh pengaduan bulan ini.",
	),
	pengaduan(
		"kpi-baru",
		"Kartu pengaduan baru",
		"Kartu jumlah pengaduan baru yang belum diproses.",
	),
	pengaduan(
		"kpi-diproses",
		"Kartu pengaduan diproses",
		"Kartu jumlah pengaduan yang sedang ditangani.",
	),
	pengaduan(
		"kpi-selesai",
		"Kartu pengaduan selesai",
		"Kartu jumlah pengaduan yang sudah terselesaikan.",
	),
	pengaduan(
		"kpi-ditolak",
		"Kartu pengaduan ditolak",
		"Kartu jumlah pengaduan yang tidak ditindaklanjuti.",
	),
	pengaduan(
		"tren",
		"Grafik tren pengaduan",
		"Grafik garis jumlah pengaduan per bulan.",
	),
	pengaduan(
		"surat-terbanyak",
		"Surat terbanyak",
		"Grafik jenis surat/layanan yang paling banyak diajukan warga.",
	),
	pengaduan(
		"pengajuan-terbaru",
		"Pengajuan terbaru",
		"Daftar pengajuan layanan terbaru beserta statusnya.",
	),
	pengaduan(
		"ide-inovatif",
		"Ajuan ide inovatif (Musrenbang)",
		"Kartu daftar ide inovatif / usulan Musrenbang terbaru dari warga.",
	),
];
