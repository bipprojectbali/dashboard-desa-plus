import type { PointerTarget } from "./types";

function jenna(
	bagian: string,
	label: string,
	deskripsi: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget {
	return {
		id: `jenna.${bagian}`,
		route: "/jenna-analytic",
		label,
		deskripsi,
		requiredFeature: "view-jenna-analytic",
		kind: "view",
		...extra,
	};
}

/** Bagian halaman Jenna Analytic. Semuanya elemen tampilan murni, tanpa tombol yang boleh diklik. */
export const JENNA_TARGETS: readonly PointerTarget[] = [
	jenna(
		"kpi-interaksi",
		"Kartu total interaksi",
		"Kartu total interaksi chatbot Jenna.",
	),
	jenna(
		"kpi-otomatis",
		"Kartu dijawab otomatis",
		"Kartu jumlah pertanyaan yang dijawab otomatis.",
	),
	jenna(
		"kpi-belum-ditindak",
		"Kartu belum ditindaklanjuti",
		"Kartu jumlah pertanyaan yang belum ditindaklanjuti.",
	),
	jenna(
		"kpi-waktu-respon",
		"Kartu waktu respon",
		"Kartu rata-rata waktu respon chatbot.",
	),
	jenna(
		"grafik-interaksi",
		"Grafik interaksi chatbot",
		"Grafik interaksi chatbot dari waktu ke waktu.",
	),
	jenna(
		"topik-pertanyaan",
		"Topik pertanyaan",
		"Daftar topik pertanyaan terbanyak.",
	),
	jenna(
		"jam-tersibuk",
		"Jam tersibuk",
		"Grafik jam tersibuk interaksi chatbot.",
	),
];
