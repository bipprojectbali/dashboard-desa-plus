/** Ukuran kemiripan kata antara jawaban Claude dan ucapan GPT-Live (khusus lab). */

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
