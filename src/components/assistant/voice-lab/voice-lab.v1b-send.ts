import type { SendMode } from "./voice-lab.constants";
import { createSentenceStream, splitSentences } from "./voice-lab.sentences";
import { chunkText } from "./voice-lab.text";

/**
 * Pengirim jawaban Claude ke GPT-Live untuk satu delegasi. Mode "whole" mengirim
 * teks final sekaligus; mode "sentence" mengirim tiap kalimat begitu lengkap
 * selagi Claude masih menulis (urutan = urutan kalimat). Setelah `cancel()` /
 * `isCancelled()` bernilai true, sisa kalimat tidak dikirim.
 */

/** Batas aman satu `commentary.append` (dokumen: 500 token) dalam karakter. */
export const COMMENTARY_MAX_CHARS = 1400;

export interface AnswerSenderOptions {
	mode: SendMode;
	/** Kirim satu potongan teks (`session.commentary.append`). */
	send(content: string): void;
	isCancelled(): boolean;
	/** Ubah tiap potongan sebelum dikirim (mis. pemformat angka lisan). */
	transform?(piece: string): string;
	/** Dipanggil sekali tepat sebelum potongan pertama dikirim. */
	onFirstSend?(): void;
}

export interface AnswerSender {
	/** Potongan teks streaming dari Claude. */
	delta(text: string): void;
	/** Claude memanggil tool: teks yang mengalir sebelumnya bukan jawaban final. */
	toolStarted(): void;
	/** Jawaban final; kirim sisanya. Mengembalikan jumlah potongan yang terkirim total. */
	finish(finalText: string): number;
	cancel(): void;
	readonly sentCount: number;
}

export function createAnswerSender(opts: AnswerSenderOptions): AnswerSender {
	const stream = createSentenceStream();
	let cancelled = false;
	let sent = 0;

	const dispatch = (pieces: string[]) => {
		for (const piece of pieces) {
			if (cancelled || opts.isCancelled()) {
				cancelled = true;
				return;
			}
			const text = opts.transform ? opts.transform(piece) : piece;
			for (const content of chunkText(text, COMMENTARY_MAX_CHARS)) {
				if (cancelled || opts.isCancelled()) {
					cancelled = true;
					return;
				}
				if (sent === 0) opts.onFirstSend?.();
				opts.send(content);
				sent++;
			}
		}
	};

	return {
		delta(text) {
			if (opts.mode === "sentence") dispatch(stream.push(text));
		},
		toolStarted() {
			stream.reset();
		},
		finish(finalText) {
			if (opts.mode === "whole") {
				dispatch([finalText]);
			} else if (sent === 0) {
				// Tidak ada kalimat terkirim selama streaming (mis. semua teks datang sebelum tool).
				stream.reset();
				dispatch(splitSentences(finalText));
			} else {
				dispatch(stream.flush());
			}
			return sent;
		},
		cancel() {
			cancelled = true;
		},
		get sentCount() {
			return sent;
		},
	};
}
