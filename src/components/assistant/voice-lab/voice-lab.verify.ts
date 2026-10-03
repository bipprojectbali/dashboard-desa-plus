import { type ExtractedNumber, extractNumbers } from "./voice-lab.numbers";
import { stripMarkdown } from "./voice-lab.text";

/**
 * Pencocokan otomatis jawaban Claude vs transkrip ucapan GPT-Live: angka
 * (dinormalisasi), satuan, dan nama dari daftar istilah (banjar/modul dari data
 * yang sudah ada). Hanya memeriksa — tidak mengubah teks.
 */

/** Satuan yang harus tetap disebut bila ada di jawaban Claude (dibandingkan jumlah kemunculan). */
export const UNIT_TERMS = [
	"rupiah",
	"persen",
	"jiwa",
	"kk",
	"hektar",
	"km",
	"kg",
	"meter",
	"ton",
] as const;

/** Nama yang lebih pendek dari ini diabaikan (terlalu mudah cocok/meleset). */
const TERM_MIN_CHARS = 3;
const EPSILON = 1e-9;

export interface VerifyResult {
	/** Jumlah angka di jawaban Claude. */
	numbersTotal: number;
	/** Angka Claude yang ditemukan juga di ucapan. */
	numbersMatched: number;
	/** matched/total; null bila Claude tidak memuat angka. */
	score: number | null;
	/** Angka di Claude yang tidak terdengar (hilang/berubah). */
	missingNumbers: string[];
	/** Angka di ucapan yang tidak ada di Claude (tambahan/berubah). */
	extraNumbers: string[];
	/** Satuan/nama di Claude yang tidak disebut di ucapan. */
	missingTerms: string[];
	/** Ada angka yang hilang atau bertambah/berubah → tampilkan ⚠️. */
	numbersChanged: boolean;
}

/** Teks dinormalisasi untuk pencocokan istilah: huruf kecil, tanpa aksen/tanda baca, "%"/"Rp"/"kepala keluarga" disamakan. */
export function normalizeForTerms(text: string): string {
	const norm = text
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.replace(/%/g, " persen ")
		.replace(/\brp\.?(?=\s|\d|$)/g, " rupiah ")
		.replace(/\bkepala keluarga\b/g, " kk ")
		.replace(/\bkilometer\b/g, " km ")
		.replace(/\bkilogram\b/g, " kg ")
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.replace(/\s+/g, " ")
		.trim();
	return ` ${norm} `;
}

function countOccurrences(haystack: string, needle: string): number {
	let count = 0;
	for (
		let at = haystack.indexOf(needle);
		at >= 0;
		at = haystack.indexOf(needle, at + 1)
	)
		count++;
	return count;
}

const sameValue = (a: number, b: number) =>
	Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));

function numbersEqual(a: ExtractedNumber, b: ExtractedNumber): boolean {
	const av = [a.value, ...(a.alt === null ? [] : [a.alt])];
	const bv = [b.value, ...(b.alt === null ? [] : [b.alt])];
	return av.some((x) => bv.some((y) => sameValue(x, y)));
}

function matchNumbers(claude: ExtractedNumber[], spoken: ExtractedNumber[]) {
	const pool = [...spoken];
	const missing: string[] = [];
	let matched = 0;
	for (const c of claude) {
		const at = pool.findIndex((s) => numbersEqual(c, s));
		if (at < 0) {
			missing.push(c.raw);
			continue;
		}
		pool.splice(at, 1);
		matched++;
	}
	return { matched, missing, extra: pool.map((p) => p.raw) };
}

function missingTerms(
	claudeNorm: string,
	spokenNorm: string,
	names: readonly string[],
): string[] {
	const out: string[] = [];
	for (const unit of UNIT_TERMS) {
		const needle = ` ${unit} `;
		if (
			countOccurrences(claudeNorm, needle) >
			countOccurrences(spokenNorm, needle)
		)
			out.push(unit);
	}
	const seen = new Set<string>();
	for (const name of names) {
		const key = normalizeForTerms(name).trim();
		if (key.length < TERM_MIN_CHARS || seen.has(key)) continue;
		seen.add(key);
		const needle = ` ${key} `;
		if (claudeNorm.includes(needle) && !spokenNorm.includes(needle))
			out.push(name);
	}
	return out;
}

export function verifyAnswer(
	claudeText: string,
	spokenText: string,
	names: readonly string[] = [],
): VerifyResult {
	const claude = stripMarkdown(claudeText);
	const claudeNumbers = extractNumbers(claude);
	const { matched, missing, extra } = matchNumbers(
		claudeNumbers,
		extractNumbers(spokenText),
	);
	return {
		numbersTotal: claudeNumbers.length,
		numbersMatched: matched,
		score: claudeNumbers.length > 0 ? matched / claudeNumbers.length : null,
		missingNumbers: missing,
		extraNumbers: extra,
		missingTerms: missingTerms(
			normalizeForTerms(claude),
			normalizeForTerms(spokenText),
			names,
		),
		numbersChanged: missing.length > 0 || extra.length > 0,
	};
}
