/**
 * Pendeteksi awal suara JAWABAN di V1-B. GPT-Live sering mengucap kalimat
 * pengisi sebelum jawaban Claude tiba, jadi "audio pertama" belum tentu
 * jawabannya. Setelah jawaban dikirim (`sent`), jawaban dianggap mulai pada
 * audio terdengar pertama yang didahului jeda hening ≥ `gapMs` (pengisi sudah
 * selesai). Bila pengisi langsung menyambung ke jawaban tanpa jeda, hasilnya
 * null (tidak terukur) — lebih baik kosong daripada angka yang menyesatkan.
 */
export interface AnswerAudioTracker {
	/** Jawaban Claude baru saja dikirim ke GPT-Live. */
	sent(now: number): void;
	/** Sampel level audio GPT-Live; mengembalikan waktu mulai jawaban (sekali ditemukan, tetap). */
	sample(rms: number, now: number): number | null;
}

export function createAnswerAudioTracker(
	threshold: number,
	gapMs: number,
): AnswerAudioTracker {
	let lastAudibleAt = Number.NEGATIVE_INFINITY;
	let sentAt: number | null = null;
	let found: number | null = null;

	return {
		sent(now) {
			sentAt = now;
			found = null;
		},
		sample(rms, now) {
			if (rms <= threshold) return found;
			if (sentAt !== null && found === null && now - lastAudibleAt >= gapMs)
				found = now;
			lastAudibleAt = now;
			return found;
		},
	};
}
