/** Artikel bantuan (panduan / dokumentasi): judul, ringkasan, isi lengkap. */
export interface HelpArticle {
	title: string;
	description: string;
	content: string;
}

/** Video tutorial dengan URL embed. */
export interface HelpVideo {
	title: string;
	duration: string;
	url: string;
}

/** Angka ringkas di atas halaman Bantuan. */
export interface HelpStat {
	value: string;
	label: string;
}

/** FAQ dari `GET /api/bantuan/faq`. */
export interface FaqItem {
	id: string;
	question: string;
	answer: string;
	category: string;
	order: number;
}
