import type { PointerTarget } from "./types";

function sosial(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `sosial.${bagian}`,
		route: "/sosial",
		label,
		deskripsi,
		requiredFeature: "view-sosial",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman Sosial & Kesejahteraan. Hanya tab riwayat kesehatan yang boleh diklik (murni mengganti tampilan); "Coba lagi" hanya ditunjuk karena memicu invalidasi cache server. */
export const SOSIAL_TARGETS: readonly PointerTarget[] = [
	sosial(
		"coba-lagi",
		"Tombol Coba lagi",
		"Tombol memuat ulang data sosial; hanya muncul bila data gagal dimuat. Hanya ditunjuk, user menekannya sendiri.",
	),
	sosial(
		"kpi-ibu-hamil",
		"Kartu ibu hamil aktif",
		"Kartu jumlah ibu hamil aktif.",
	),
	sosial(
		"kpi-balita",
		"Kartu balita terdaftar",
		"Kartu jumlah balita terdaftar.",
	),
	sosial(
		"kpi-stunting",
		"Kartu alert stunting",
		"Kartu jumlah balita dengan risiko stunting.",
	),
	sosial(
		"kpi-posyandu",
		"Kartu posyandu aktif",
		"Kartu jumlah posyandu aktif.",
	),
	sosial(
		"statistik-kesehatan",
		"Statistik kesehatan",
		"Kartu statistik kesehatan warga.",
	),
	sosial("posyandu", "Jadwal posyandu", "Jadwal kegiatan posyandu."),
	sosial("pendidikan", "Pendidikan", "Kartu data pendidikan warga."),
	sosial("beasiswa", "Beasiswa", "Kartu data penerima beasiswa."),
	sosial("kesejahteraan", "Kesejahteraan", "Kartu data kesejahteraan warga."),
	sosial(
		"kalender-event",
		"Kalender event",
		"Kalender event dan kegiatan desa.",
	),
	sosial(
		"riwayat-kesehatan",
		"Riwayat kesehatan",
		"Kartu riwayat kesehatan dengan tab ibu hamil, balita, dan penyakit.",
	),
	sosial(
		"tab-ibu-hamil",
		"Tab Ibu Hamil",
		"Tab menampilkan riwayat kesehatan ibu hamil.",
		{ clickable: true },
	),
	sosial(
		"tab-balita",
		"Tab Balita",
		"Tab menampilkan riwayat kesehatan balita.",
		{ clickable: true },
	),
	sosial(
		"tab-penyakit",
		"Tab Penyakit",
		"Tab menampilkan riwayat penyakit warga.",
		{ clickable: true },
	),
];
