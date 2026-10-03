/**
 * Ekstraksi & normalisasi angka (format id-ID) untuk pencocokan jawaban Claude
 * vs ucapan GPT-Live. Mengenali angka digit ("1.234.567", "2,5", "12%"),
 * pengali skala ("2,5 juta") dan angka yang diucapkan dengan kata
 * ("dua ribu dua puluh lima" → 2025, "dua koma lima juta" → 2.500.000).
 *
 * Batas: kata bilangan non-baku / salah dengar transkripsi tidak dikenali;
 * "satu" yang berdiri sendiri diabaikan (sering kata biasa: "satu-satunya");
 * deret digit terucap ("dua nol dua lima") dikenali hanya bila seluruhnya digit.
 */

export interface ExtractedNumber {
	/** Nilai ternormalisasi. */
	value: number;
	/** Tafsir alternatif bila separatornya ambigu (mis. "2.025": id=2025, en=2,025). */
	alt: number | null;
	/** Teks asal, untuk ditampilkan. */
	raw: string;
}

const SCALES: Record<string, number> = {
	ribu: 1e3,
	juta: 1e6,
	miliar: 1e9,
	milyar: 1e9,
	triliun: 1e12,
};

const DIGIT_WORDS: Record<string, number> = {
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
const SE_WORDS: Record<string, number> = {
	sepuluh: 10,
	sebelas: 11,
	seratus: 100,
	seribu: 1e3,
	sejuta: 1e6,
	semiliar: 1e9,
	setriliun: 1e12,
};

const STRUCTURE_WORDS = new Set(["puluh", "belas", "ratus", "koma"]);
const NUMBER_RE = /\d+(?:[.,]\d+)*/g;

/** Satu token angka digit → nilai (+ tafsir alternatif bila ambigu); null bila bukan angka wajar. */
export function parseDigitNumber(
	token: string,
): { value: number; alt: number | null } | null {
	if (!/^\d+(?:[.,]\d+)*$/.test(token)) return null;
	const parts = token.split(/[.,]/);
	if (parts.length === 1) return { value: Number(token), alt: null };
	const seps = token.match(/[.,]/g) ?? [];
	const allSame = seps.every((s) => s === seps[0]);
	const first = parts[0] ?? "";
	const last = parts[parts.length - 1] ?? "";
	const thousandsShape =
		first.length <= 3 &&
		first !== "0" &&
		parts.slice(1).every((p) => p.length === 3);
	if (allSame && thousandsShape) {
		// Satu separator + 3 digit ("2.025"): bisa pecahan gaya Inggris → simpan sebagai alt.
		const alt = parts.length === 2 ? Number(`${first}.${last}`) : null;
		return { value: Number(parts.join("")), alt };
	}
	if (allSame && seps.length > 1) return null;
	// Pecahan: separator terakhir = desimal, sisanya ribuan.
	return { value: Number(`${parts.slice(0, -1).join("")}.${last}`), alt: null };
}

const isNumberWord = (w: string) =>
	w in DIGIT_WORDS || w in SE_WORDS || w in SCALES || STRUCTURE_WORDS.has(w);

/** Urutan kata bilangan → nilai; null bila bukan angka yang utuh. */
export function parseNumberWords(tokens: string[]): number | null {
	if (tokens.length >= 2 && tokens.every((w) => w in DIGIT_WORDS))
		return Number(tokens.map((w) => DIGIT_WORDS[w]).join(""));
	let big = 0;
	let total = 0;
	let group = 0;
	let pending: number | null = null;
	let fraction: string | null = null;
	let fractionScale: number | null = null;
	for (const w of tokens) {
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

function wordsOf(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.filter(Boolean);
}

/** Angka yang diucapkan dengan kata di dalam `text`. */
export function extractWordNumbers(text: string): ExtractedNumber[] {
	const out: ExtractedNumber[] = [];
	let run: string[] = [];
	const flush = () => {
		const bare = run.length === 1 ? (run[0] ?? "") : null;
		const skip =
			bare !== null &&
			(bare === "satu" || !(bare in DIGIT_WORDS || bare in SE_WORDS));
		const value = run.length > 0 && !skip ? parseNumberWords(run) : null;
		if (value !== null) out.push({ value, alt: null, raw: run.join(" ") });
		run = [];
	};
	for (const w of wordsOf(text)) {
		if (isNumberWord(w)) run.push(w);
		else flush();
	}
	flush();
	return out;
}

/** Semua angka (digit + kata) di `text`, pengali skala ("2,5 juta") sudah diterapkan. */
export function extractNumbers(text: string): ExtractedNumber[] {
	const out: ExtractedNumber[] = [];
	for (const m of text.matchAll(NUMBER_RE)) {
		const parsed = parseDigitNumber(m[0]);
		if (!parsed) continue;
		const next = text
			.slice((m.index ?? 0) + m[0].length)
			.match(/^\s*(\p{L}+)/u)?.[1]
			?.toLowerCase();
		const scale = next ? SCALES[next] : undefined;
		out.push({
			value: parsed.value * (scale ?? 1),
			alt: parsed.alt === null ? null : parsed.alt * (scale ?? 1),
			raw: scale ? `${m[0]} ${next}` : m[0],
		});
	}
	// Kata bilangan dicari pada teks tanpa digit agar "2,5 juta" tidak terhitung dua kali.
	return [...out, ...extractWordNumbers(text.replace(NUMBER_RE, " . "))];
}
