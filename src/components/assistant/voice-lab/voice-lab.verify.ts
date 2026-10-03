import { type ExtractedNumber, extractNumbers } from "./voice-lab.numbers";
import type { NumberConversion } from "./voice-lab.spoken-numbers";
import { stripMarkdown } from "./voice-lab.text";

/**
 * Pencocokan otomatis jawaban Claude vs transkrip ucapan GPT-Live: angka
 * (dinormalisasi), satuan, dan nama dari daftar istilah (banjar/modul dari data
 * yang sudah ada). Hanya memeriksa — tidak mengubah teks. Angka yang diringkas
 * pemformat angka lisan dicocokkan dengan toleransi pembulatannya, sehingga
 * "940,2 juta" maupun "940.248.688" yang terucap sama-sama dianggap cocok.
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

/** Satu angka ringkas dan apakah terdengar benar di ucapan GPT-Live. */
export interface ConversionCheck {
	spoken: string;
	original: string;
	heard: boolean;
}

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
	/** Angka yang diringkas pemformat beserta status terdengarnya. */
	conversions: ConversionCheck[];
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

const valuesOf = (n: ExtractedNumber) => [
	n.value,
	...(n.alt === null ? [] : [n.alt]),
];

function numbersEqual(
	a: ExtractedNumber,
	b: ExtractedNumber,
	conv: NumberConversion | undefined,
): boolean {
	if (conv)
		return valuesOf(b).some(
			(y) =>
				Math.abs(y - conv.spokenValue) <= conv.tolerance ||
				sameValue(y, conv.spokenValue),
		);
	return valuesOf(a).some((x) => valuesOf(b).some((y) => sameValue(x, y)));
}

/** Pasangkan angka Claude dengan konversi pemformat (berdasarkan nilai ringkasnya, urut kemunculan). */
function linkConversions(
	claude: ExtractedNumber[],
	conversions: readonly NumberConversion[],
): (NumberConversion | undefined)[] {
	const pool = [...conversions];
	return claude.map((c) => {
		const at = pool.findIndex((k) => sameValue(c.value, k.spokenValue));
		return at < 0 ? undefined : pool.splice(at, 1)[0];
	});
}

function matchNumbers(
	claude: ExtractedNumber[],
	spoken: ExtractedNumber[],
	links: (NumberConversion | undefined)[],
) {
	const pool = [...spoken];
	const missing: string[] = [];
	const checks: ConversionCheck[] = [];
	let matched = 0;
	claude.forEach((c, i) => {
		const conv = links[i];
		const at = pool.findIndex((s) => numbersEqual(c, s, conv));
		if (conv)
			checks.push({
				spoken: conv.spoken,
				original: conv.original,
				heard: at >= 0,
			});
		if (at < 0) {
			missing.push(c.raw);
			return;
		}
		pool.splice(at, 1);
		matched++;
	});
	return { matched, missing, extra: pool.map((p) => p.raw), checks };
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

/** Cocokkan teks yang dikirim ke GPT-Live (`claudeText`) dengan transkrip ucapannya. */
export function verifyAnswer(
	claudeText: string,
	spokenText: string,
	names: readonly string[] = [],
	conversions: readonly NumberConversion[] = [],
): VerifyResult {
	const claude = stripMarkdown(claudeText);
	const claudeNumbers = extractNumbers(claude);
	const { matched, missing, extra, checks } = matchNumbers(
		claudeNumbers,
		extractNumbers(spokenText),
		linkConversions(claudeNumbers, conversions),
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
		conversions: checks,
	};
}
