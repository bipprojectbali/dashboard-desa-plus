import type { AssistantLang } from "@/types/ai-assistant-chat";

/**
 * Saran pertanyaan per rute (rancangan 04 §5), hanya untuk modul yang
 * diizinkan. Rute tanpa daftar sendiri memakai saran Beranda.
 */

interface SuggestionSet {
	feature: string;
	id: string[];
	en: string[];
}

const SUGGESTIONS: Record<string, SuggestionSet[]> = {
	"/": [
		{
			feature: "view-dashboard",
			id: ["Ringkas kondisi desa hari ini"],
			en: ["Summarize the village condition today"],
		},
		{
			feature: "view-pengaduan",
			id: ["Ada berapa pengaduan aktif?"],
			en: ["How many complaints are active?"],
		},
	],
	"/keuangan-anggaran": [
		{
			feature: "view-keuangan",
			id: [
				"Berapa persen realisasi APBDes tahun ini?",
				"Sektor dengan alokasi terbesar?",
			],
			en: [
				"What percentage of the village budget is realized this year?",
				"Which sector has the largest allocation?",
			],
		},
	],
	"/pengaduan-layanan-publik": [
		{
			feature: "view-pengaduan",
			id: [
				"Jenis surat apa yang paling banyak diajukan?",
				"Tren pengaduan 7 bulan terakhir",
			],
			en: [
				"Which letter type is requested most?",
				"Complaint trend over the last 7 months",
			],
		},
	],
	"/demografi-pekerjaan": [
		{
			feature: "view-demografi",
			id: ["Banjar dengan penduduk terbanyak?", "Pekerjaan paling umum warga?"],
			en: [
				"Which banjar has the most residents?",
				"What is the most common occupation?",
			],
		},
	],
	"/kinerja-divisi": [
		{
			feature: "view-kinerja-divisi",
			id: ["Divisi mana yang paling aktif?"],
			en: ["Which division is the most active?"],
		},
	],
	"/bantuan": [
		{
			feature: "use-ai-assistant",
			id: ["Bagaimana cara mengekspor data?"],
			en: ["How do I export data?"],
		},
	],
};

/** Saran untuk rute aktif yang modulnya diizinkan untuk user. */
export function suggestionsFor(
	pathname: string,
	allowed: readonly string[],
	lang: AssistantLang,
): string[] {
	const sets = SUGGESTIONS[pathname] ?? SUGGESTIONS["/"] ?? [];
	return sets
		.filter((s) => allowed.includes(s.feature))
		.flatMap((s) => s[lang]);
}
