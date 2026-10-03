/**
 * Pemecah kalimat untuk mode "per kalimat" (V1-B). Aman untuk format id-ID:
 * "1.234.567", "2,5 juta", "Rp. 500.000", singkatan ("Dr.", "dll.") dan
 * penanda daftar ("1. Item") tidak dianggap akhir kalimat.
 */

/** Kalimat lebih pendek dari ini digabung ke kalimat berikutnya (hindari "Baik." sendirian). */
export const SENTENCE_MIN_CHARS = 12;

const TERMINATORS = new Set([".", "!", "?", "…"]);
const CLOSERS = new Set(['"', "'", ")", "]", "”", "’"]);

/** Singkatan yang tidak pernah mengakhiri kalimat (gelar, alamat, mata uang, penomoran). */
const NEVER_END = new Set([
	"dr",
	"drs",
	"dra",
	"prof",
	"ir",
	"hj",
	"h",
	"bpk",
	"sdr",
	"sdri",
	"tn",
	"ny",
	"no",
	"nomor",
	"rp",
	"jl",
	"jln",
	"kec",
	"kab",
	"kel",
	"ds",
	"st",
	"pt",
	"cv",
	"ud",
	"hlm",
	"mr",
	"a.n",
	"s.d",
	"u.p",
	"d.a",
]);

/** Singkatan yang bisa mengakhiri kalimat: akhir kalimat hanya bila kata berikutnya berawal huruf besar/angka. */
const MAYBE_END = new Set(["dll", "dsb", "dst", "dkk", "tsb", "dsbnya"]);

const isSpace = (c: string | undefined) => c !== undefined && /\s/.test(c);

function wordBefore(text: string, at: number): string {
	return /[\p{L}\p{N}.]*$/u.exec(text.slice(0, at))?.[0] ?? "";
}

function atLineStart(text: string, wordStart: number): boolean {
	const before = text.slice(0, wordStart);
	return before.trim() === "" || /\n\s*$/.test(before);
}

/** Karakter non-spasi berikutnya setelah `from`; undefined bila belum ada. */
function nextVisible(text: string, from: number): string | undefined {
	for (let i = from; i < text.length; i++) {
		const c = text[i];
		if (c !== undefined && !isSpace(c)) return c;
	}
	return undefined;
}

/**
 * Cari akhir kalimat pertama (indeks eksklusif) di `text`. -1 = belum ada atau
 * belum bisa dipastikan (butuh karakter berikutnya) — kecuali `final`.
 */
export function findSentenceEnd(text: string, final: boolean): number {
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (c === "\n") return i + 1;
		if (c === undefined || !TERMINATORS.has(c)) continue;
		let end = i;
		while (end + 1 < text.length && TERMINATORS.has(text[end + 1] ?? "")) end++;
		const run = text.slice(i, end + 1);
		let close = end;
		while (close + 1 < text.length && CLOSERS.has(text[close + 1] ?? ""))
			close++;
		const after = text[close + 1];
		if (after === undefined) return final ? close + 1 : -1;
		if (!isSpace(after)) {
			i = close;
			continue;
		}
		if (run === "." && close === end) {
			const token = wordBefore(text, i);
			const lower = token.toLowerCase();
			const tokenStart = i - token.length;
			if (NEVER_END.has(lower) || (/^\p{Lu}$/u.test(token) && token !== "")) {
				i = close;
				continue;
			}
			if (/^\d{1,2}$/.test(token) && atLineStart(text, tokenStart)) {
				i = close;
				continue;
			}
			if (MAYBE_END.has(lower)) {
				const next = nextVisible(text, close + 1);
				if (next === undefined) {
					if (!final) return -1;
				} else if (!/[\p{Lu}\p{N}]/u.test(next)) {
					i = close;
					continue;
				}
			}
		}
		return close + 1;
	}
	return -1;
}

export interface SentenceStream {
	/** Tambah potongan teks; kembalikan kalimat yang baru lengkap (urut). */
	push(delta: string): string[];
	/** Akhir teks: kembalikan sisa sebagai kalimat terakhir (boleh tanpa tanda baca). */
	flush(): string[];
	/** Buang sisa buffer (mis. teks pembuka sebelum pemanggilan tool). */
	reset(): void;
}

const joinPiece = (carry: string, text: string) =>
	[carry, text.trim()].filter(Boolean).join(" ");

export function createSentenceStream(
	minChars: number = SENTENCE_MIN_CHARS,
): SentenceStream {
	let buffer = "";
	let carry = "";

	const drain = (final: boolean): string[] => {
		const out: string[] = [];
		for (;;) {
			const end = findSentenceEnd(buffer, final);
			if (end < 0) break;
			const piece = joinPiece(carry, buffer.slice(0, end));
			buffer = buffer.slice(end);
			if (piece === "") continue;
			if (piece.length < minChars && !final) {
				carry = piece;
				continue;
			}
			carry = "";
			out.push(piece);
		}
		return out;
	};

	return {
		push(delta) {
			buffer += delta;
			return drain(false);
		},
		flush() {
			const out = drain(true);
			const tail = joinPiece(carry, buffer);
			buffer = "";
			carry = "";
			if (tail) out.push(tail);
			return out;
		},
		reset() {
			buffer = "";
			carry = "";
		},
	};
}

/** Pecah teks utuh menjadi kalimat (pakai aturan yang sama dengan mode stream). */
export function splitSentences(
	text: string,
	minChars: number = SENTENCE_MIN_CHARS,
): string[] {
	const stream = createSentenceStream(minChars);
	return [...stream.push(text), ...stream.flush()];
}
