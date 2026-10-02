import type { PointerTarget } from "./types";

function divisi(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `divisi.${bagian}`,
		route: "/kinerja-divisi",
		label,
		deskripsi,
		requiredFeature: "view-kinerja-divisi",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman Kinerja Divisi. Hanya "Coba lagi" yang boleh diklik (memuat ulang, tidak mengubah data). */
export const DIVISI_TARGETS: readonly PointerTarget[] = [
	divisi(
		"export-pdf",
		"Tombol Export PDF",
		"Tombol untuk mengunduh laporan kegiatan divisi sebagai PDF; user menekannya sendiri.",
	),
	divisi(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data kinerja divisi; hanya muncul bila data gagal dimuat.",
		{ clickable: true },
	),
	divisi(
		"kegiatan",
		"Program kegiatan",
		"Empat kartu kegiatan terbaru beserta tanggal, status, dan persen progresnya.",
	),
	divisi(
		"teraktif",
		"Divisi teraktif",
		'Kartu "Divisi Teraktif": peringkat divisi dengan kegiatan terbanyak beserta jumlahnya — rujukan utama untuk pertanyaan soal divisi teraktif.',
	),
	divisi(
		"dokumen",
		"Grafik dokumen",
		'Grafik "Jumlah Dokumen" divisi per jenis.',
	),
	divisi(
		"progres",
		"Grafik progres kegiatan",
		'Grafik "Progres Kegiatan" per status (selesai, berjalan, tertunda).',
	),
	divisi("diskusi", "Panel diskusi", "Diskusi terbaru antar divisi."),
	divisi(
		"acara",
		"Acara hari ini",
		"Daftar acara/agenda divisi pada hari ini.",
	),
];
