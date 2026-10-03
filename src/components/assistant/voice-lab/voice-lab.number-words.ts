/**
 * Kata bilangan bahasa Indonesia → nilai ("dua ribu dua puluh lima" → 2025,
 * "dua koma lima juta" → 2.500.000). Token angka digit boleh muncul di tengah
 * deret sebagai nilai grup ("940 juta 248 ribu 688" → 940.248.688).
 *
 * Batas: kata bilangan non-baku / salah dengar transkripsi tidak dikenali;
 * deret digit terucap ("dua nol dua lima") dikenali hanya bila seluruhnya digit.
 */

export const SCALES: Record<string, number> = {
	ribu: 1e3,
	juta: 1e6,
	miliar: 1e9,
	milyar: 1e9,
	triliun: 1e12,
};

export const DIGIT_WORDS: Record<string, number> = {
	nol: 0,
	satu: 1,
	dua: 2,
	tiga: 3,
	empat: 4,
	lima: 5,
	enam: 6,
	tujuh: 7,
	delapan: 8,
	sembilan: 9,
};

/** Bentuk "se-" (satu puluh/belas/ratus/ribu/…); nilai kecil masuk grup ratusan, besar masuk skala. */
export const SE_WORDS: Record<string, number> = {
	sepuluh: 10,
	sebelas: 11,
	seratus: 100,
	seribu: 1e3,
	sejuta: 1e6,
	semiliar: 1e9,
	setriliun: 1e12,
};

const STRUCTURE_WORDS = new Set(["puluh", "belas", "ratus", "koma"]);

export const isNumberWord = (w: string) =>
	w in DIGIT_WORDS || w in SE_WORDS || w in SCALES || STRUCTURE_WORDS.has(w);

/** Token deret bilangan: kata (huruf kecil) atau nilai angka digit yang sudah diurai. */
export type NumberToken = string | number;

/** Deret kata bilangan (boleh berisi nilai digit) → nilai; null bila bukan angka yang utuh. */
export function parseNumberWords(
	tokens: readonly NumberToken[],
): number | null {
	if (
		tokens.length >= 2 &&
		tokens.every((w) => typeof w === "string" && w in DIGIT_WORDS)
	)
		return Number(tokens.map((w) => DIGIT_WORDS[w as string]).join(""));
	let big = 0;
	let total = 0;
	let group = 0;
	let pending: number | null = null;
	let fraction: string | null = null;
	let fractionScale: number | null = null;
	for (const w of tokens) {
		if (typeof w === "number") {
			// Nilai digit hanya sah sebagai grup baru (sesudah skala atau di awal).
			if (fraction !== null || group !== 0 || pending !== null) return null;
			group = w;
			continue;
		}
		const digit = DIGIT_WORDS[w];
		if (fractionScale !== null) {
			return null;
		} else if (fraction !== null) {
			if (w in SCALES && fraction !== "") fractionScale = SCALES[w] ?? 1;
			else if (digit === undefined) return null;
			else fraction += String(digit);
		} else if (w === "koma") {
			fraction = "";
		} else if (digit !== undefined) {
			if (pending !== null) return null;
			pending = digit;
		} else if (w in SE_WORDS) {
			const v = SE_WORDS[w] ?? 0;
			if (v >= 1e6) big += v;
			else if (v >= 1e3) total += v;
			else group += v;
		} else if (w === "puluh") {
			group += (pending ?? 1) * 10;
			pending = null;
		} else if (w === "belas") {
			group += (pending ?? 0) + 10;
			pending = null;
		} else if (w === "ratus") {
			group += (pending ?? 1) * 100;
			pending = null;
		} else if (w in SCALES) {
			const unit = SCALES[w] ?? 1;
			const base = group + (pending ?? 0);
			if (unit >= 1e6) {
				big += (total + base || 1) * unit;
				total = 0;
			} else {
				total += (base || 1) * unit;
			}
			group = 0;
			pending = null;
		} else {
			return null;
		}
	}
	const low = total + group + (pending ?? 0);
	if (!fraction) return big + low;
	// "dua koma lima juta": pecahan berlaku pada skala sesudahnya.
	return big + Number(`${low}.${fraction}`) * (fractionScale ?? 1);
}

/**
 * Nilai satu deret kata saja (tanpa digit), atau null bila deret itu tidak
 * layak dihitung: "satu" tunggal (sering kata biasa: "satu-satunya"), kata
 * struktur/skala tunggal, atau deret yang hanya berisi kata skala ("juta ribu").
 */
export function wordRunValue(run: readonly string[]): number | null {
	if (run.length === 0) return null;
	if (run.every((w) => w in SCALES || STRUCTURE_WORDS.has(w))) return null;
	const bare = run.length === 1 ? (run[0] ?? "") : null;
	if (
		bare !== null &&
		(bare === "satu" || !(bare in DIGIT_WORDS || bare in SE_WORDS))
	)
		return null;
	return parseNumberWords(run);
}
