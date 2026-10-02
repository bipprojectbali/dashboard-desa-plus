/** Utilitas teks: pemotong kalimat untuk TTS bertahap & ukuran kemiripan kata. */

const SENTENCE_END = /([.!?…]+["')\]]*)(\s+|$)/;

/**
 * Ambil kalimat lengkap dari buffer teks yang sedang mengalir. `rest` = sisa yang
 * belum berakhir tanda baca. Kalimat < `minChars` digabung ke berikutnya agar
 * potongan TTS tidak terlalu pendek.
 */
export function takeSentences(
	buffer: string,
	minChars: number,
): { sentences: string[]; rest: string } {
	const sentences: string[] = [];
	let rest = buffer;
	let carry = "";
	for (;;) {
		const m = SENTENCE_END.exec(rest);
		if (!m || m.index === undefined) break;
		const end = m.index + m[1].length;
		const sentence = `${carry}${rest.slice(0, end)}`.trim();
		rest = rest.slice(end).replace(/^\s+/, "");
		if (sentence.length < minChars) {
			carry = `${sentence} `;
			continue;
		}
		carry = "";
		sentences.push(sentence);
	}
	return { sentences, rest: `${carry}${rest}` };
}

/** Pembersih markdown ringan agar TTS tidak membacakan simbol. */
export function stripMarkdown(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]*)`/g, "$1")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}(#{1,6}|[-*+]|\d+\.)\s+/gm, "")
		.replace(/[*_~>]+/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function words(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[^\p{L}\p{N}\s]/gu, " ")
			.split(/\s+/)
			.filter(Boolean),
	);
}

/** Kemiripan kata (Jaccard, 0..1) — 1 = kata sama persis, 0 = tidak ada yang sama. */
export function wordOverlap(a: string, b: string): number {
	const wa = words(a);
	const wb = words(b);
	if (wa.size === 0 || wb.size === 0) return 0;
	let shared = 0;
	for (const w of wa) if (wb.has(w)) shared++;
	return shared / (wa.size + wb.size - shared);
}
