/** Utilitas teks suara: pemotong kalimat, pembersih markdown, pemotong panjang. */

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
		const end = m.index + (m[1]?.length ?? 0);
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

/** Potong teks panjang menjadi potongan ≤ `max` karakter, diutamakan di batas kalimat/spasi. */
export function chunkText(text: string, max: number): string[] {
	const out: string[] = [];
	let rest = text.trim();
	while (rest.length > max) {
		const window = rest.slice(0, max);
		const sentenceCut = Math.max(
			window.lastIndexOf(". "),
			window.lastIndexOf("! "),
			window.lastIndexOf("? "),
		);
		const cut = sentenceCut > 0 ? sentenceCut + 1 : window.lastIndexOf(" ");
		const at = cut > 0 ? cut : max;
		out.push(rest.slice(0, at).trim());
		rest = rest.slice(at).trim();
	}
	if (rest) out.push(rest);
	return out;
}
