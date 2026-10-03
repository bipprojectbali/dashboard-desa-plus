/**
 * Pemformat angka lisan (deterministik): angka id-ID ≥ 1.000.000 di teks yang
 * akan DIUCAPKAN GPT-Live diringkas ke juta/miliar/triliun ("Rp 940.248.688" →
 * "sekitar 940,2 juta rupiah"). Teks Claude di panel tidak diubah.
 *
 * Yang diringkas: angka bertitik ribuan ("1.250.000.000", boleh ",desimal")
 * atau digit polos yang diawali "Rp". Tidak disentuh: angka < 1.000.000,
 * persen, tahun, tanggal, nomor/ID polos, dan angka yang sudah diikuti kata
 * skala. "sekitar" hanya ditambahkan bila pembulatan mengubah nilai.
 */

/** Ambang terkecil yang diringkas. */
export const SPOKEN_MIN_VALUE = 1_000_000;

/** Skala dari besar ke kecil + jumlah desimal yang diucapkan. */
export const SPOKEN_SCALES = [
	{ word: "triliun", value: 1e12, decimals: 2 },
	{ word: "miliar", value: 1e9, decimals: 2 },
	{ word: "juta", value: 1e6, decimals: 1 },
] as const;

export const APPROX_WORD = "sekitar";
const CURRENCY_WORD = "rupiah";
/** Kata pendekatan yang sudah ada tepat sebelum angka → "sekitar" tidak ditambah lagi. */
const APPROX_BEFORE_RE =
	/(?:sekitar|kurang lebih|kira-kira|hampir|lebih dari|kurang dari|±|~)\s*$/i;
/** Sesudah angka: persen / kata skala → bukan nominal yang perlu diringkas. */
const SKIP_AFTER_RE = /^\s*(?:%|persen\b|ribu\b|juta\b|mil[iy]ar\b|triliun\b)/i;

const AMOUNT_RE =
	/(?<![\p{L}\d.,])(?:(Rp\.?\s?)(\d{7,}|\d{1,3}(?:\.\d{3}){2,})|(\d{1,3}(?:\.\d{3}){2,}))(?:,(\d+))?(?![\d]|[.,]\d)(\s+rupiah\b)?/giu;

export interface NumberConversion {
	/** Teks asli di jawaban Claude, mis. "Rp 940.248.688". */
	original: string;
	originalValue: number;
	/** Bentuk ringkas yang diucapkan (tanpa "sekitar"/"rupiah"), mis. "940,2 juta". */
	spoken: string;
	spokenValue: number;
	/** Selisih maksimal yang masih dianggap sama (setengah langkah pembulatan). */
	tolerance: number;
}

export interface SpokenNumbersResult {
	text: string;
	conversions: NumberConversion[];
}

const groupThousands = (digits: string) =>
	digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Nilai → bentuk ringkas; skala naik bila pembulatan mencapai 1.000 (999,96 juta → 1 miliar). */
export function shortForm(
	value: number,
): Omit<NumberConversion, "original" | "originalValue"> {
	let i = SPOKEN_SCALES.findIndex((s) => value >= s.value);
	if (i < 0) i = SPOKEN_SCALES.length - 1;
	let scale = SPOKEN_SCALES[i] ?? SPOKEN_SCALES[0];
	let fixed = (value / scale.value).toFixed(scale.decimals);
	if (Number(fixed) >= 1000 && i > 0) {
		scale = SPOKEN_SCALES[i - 1] ?? scale;
		fixed = (value / scale.value).toFixed(scale.decimals);
	}
	const [int = "0", frac = ""] = fixed.split(".");
	const trimmed = frac.replace(/0+$/, "");
	const num = `${groupThousands(int)}${trimmed ? `,${trimmed}` : ""}`;
	return {
		spoken: `${num} ${scale.word}`,
		spokenValue: Number(fixed) * scale.value,
		tolerance: (0.5 * scale.value) / 10 ** scale.decimals,
	};
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ringkas angka besar di `text` untuk diucapkan; kembalikan teks baru + daftar konversinya. */
export function formatSpokenNumbers(text: string): SpokenNumbersResult {
	const conversions: NumberConversion[] = [];
	const out = text.replace(
		AMOUNT_RE,
		(match, rp, rpDigits, plain, decimals, rupiah, offset: number) => {
			const after = text.slice(offset + match.length);
			if (SKIP_AFTER_RE.test(after)) return match;
			const digits = String(rpDigits ?? plain).replace(/\./g, "");
			const originalValue = Number(
				`${digits}${decimals ? `.${decimals}` : ""}`,
			);
			if (!(originalValue >= SPOKEN_MIN_VALUE)) return match;
			const short = shortForm(originalValue);
			const before = text.slice(0, offset);
			const approx =
				Math.abs(short.spokenValue - originalValue) > 0 &&
				!APPROX_BEFORE_RE.test(before);
			const currency = Boolean(rp || rupiah);
			conversions.push({ original: match.trim(), originalValue, ...short });
			const spoken = [
				approx ? APPROX_WORD : "",
				short.spoken,
				currency ? CURRENCY_WORD : "",
			]
				.filter(Boolean)
				.join(" ");
			const sentenceStart = /(?:^|[.!?]\s+)$/.test(before);
			return sentenceStart ? capitalize(spoken) : spoken;
		},
	);
	return { text: out, conversions };
}
