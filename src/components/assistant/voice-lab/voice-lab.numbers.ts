import {
	isNumberWord,
	type NumberToken,
	parseNumberWords,
	SCALES,
	wordRunValue,
} from "./voice-lab.number-words";

/**
 * Ekstraksi & normalisasi angka (format id-ID) untuk pencocokan jawaban Claude
 * vs ucapan GPT-Live. Mengenali angka digit ("1.234.567", "2,5", "12%"),
 * pengali skala ("2,5 juta"), campuran digit+skala ("940 juta 248 ribu 688")
 * dan angka yang diucapkan dengan kata (lihat `voice-lab.number-words`).
 * Tanda akhir kalimat (". ", "? ", …) memutus deret angka.
 */

export interface ExtractedNumber {
	/** Nilai ternormalisasi. */
	value: number;
	/** Tafsir alternatif bila separatornya ambigu (mis. "2.025": id=2025, en=2,025). */
	alt: number | null;
	/** Teks asal, untuk ditampilkan. */
	raw: string;
}

const DIGIT_TOKEN_RE = /^\d+(?:[.,]\d+)*$/;
const TOKEN_RE = /\d+(?:[.,]\d+)*|\p{L}+|[.!?;:](?=\s|$)/gu;

/** Satu token angka digit → nilai (+ tafsir alternatif bila ambigu); null bila bukan angka wajar. */
export function parseDigitNumber(
	token: string,
): { value: number; alt: number | null } | null {
	if (!DIGIT_TOKEN_RE.test(token)) return null;
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

interface DigitToken {
	raw: string;
	value: number;
	alt: number | null;
}
type RunToken = string | DigitToken;

const rawOf = (t: RunToken) => (typeof t === "string" ? t : t.raw);
const rawJoin = (run: readonly RunToken[]) => run.map(rawOf).join(" ");

/** Pecah teks jadi deret angka (kata bilangan + token digit) yang dipisah kata lain / akhir kalimat. */
function numberRuns(text: string): RunToken[][] {
	const runs: RunToken[][] = [];
	let run: RunToken[] = [];
	const flush = () => {
		if (run.length > 0) runs.push(run);
		run = [];
	};
	for (const m of text.matchAll(TOKEN_RE)) {
		const tok = m[0];
		const digit = /^\d/.test(tok) ? parseDigitNumber(tok) : null;
		const word = tok.toLowerCase();
		if (digit) run.push({ raw: tok, ...digit });
		else if (isNumberWord(word)) run.push(word);
		else flush();
	}
	flush();
	return runs;
}

/** Cadangan bila deret campuran tak utuh: tiap digit (× skala sesudahnya) dan tiap sub-deret kata dinilai sendiri. */
function splitRun(run: readonly RunToken[]): ExtractedNumber[] {
	const out: ExtractedNumber[] = [];
	let words: string[] = [];
	const flushWords = () => {
		const value = wordRunValue(words);
		if (value !== null) out.push({ value, alt: null, raw: words.join(" ") });
		words = [];
	};
	for (let i = 0; i < run.length; i++) {
		const t = run[i];
		if (t === undefined) continue;
		if (typeof t === "string") {
			words.push(t);
			continue;
		}
		flushWords();
		const next = run[i + 1];
		const scale = typeof next === "string" ? SCALES[next] : undefined;
		if (scale) i++;
		out.push({
			value: t.value * (scale ?? 1),
			alt: t.alt === null ? null : t.alt * (scale ?? 1),
			raw: scale ? `${t.raw} ${next}` : t.raw,
		});
	}
	flushWords();
	return out;
}

function runNumbers(run: readonly RunToken[]): ExtractedNumber[] {
	const digits = run.filter((t): t is DigitToken => typeof t !== "string");
	if (digits.length === 0) {
		const value = wordRunValue(run as string[]);
		return value === null ? [] : [{ value, alt: null, raw: rawJoin(run) }];
	}
	if (run.length <= 2 && typeof run[0] !== "string") return splitRun(run);
	const tokens: NumberToken[] = run.map((t) =>
		typeof t === "string" ? t : t.value,
	);
	const value = parseNumberWords(tokens);
	return value === null
		? splitRun(run)
		: [{ value, alt: null, raw: rawJoin(run) }];
}

/** Angka yang diucapkan dengan kata di dalam `text` (token digit diabaikan). */
export function extractWordNumbers(text: string): ExtractedNumber[] {
	return extractNumbers(text.replace(/\d+(?:[.,]\d+)*/g, " . "));
}

/** Semua angka (digit + kata) di `text`, pengali skala ("2,5 juta") sudah diterapkan. */
export function extractNumbers(text: string): ExtractedNumber[] {
	return numberRuns(text).flatMap(runNumbers);
}
