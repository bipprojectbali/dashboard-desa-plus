/** Konstanta sisi browser halaman uji suara S0 (nilai awal bisa diubah di halaman). */

export const VAD_DEFAULTS = {
	/** RMS (0..1) di atas ini dianggap suara. */
	threshold: 0.02,
	/** Hening berturut-turut sebelum ucapan dianggap selesai. */
	silenceMs: 900,
	/** Suara minimal sebelum dianggap mulai bicara (menyaring klik/batuk singkat). */
	minSpeechMs: 250,
} as const;

/** Batas slider di UI. */
export const VAD_LIMITS = {
	threshold: { min: 0.005, max: 0.2, step: 0.005 },
	silenceMs: { min: 300, max: 3000, step: 100 },
} as const;

export const SESSION_LIMITS = {
	/** Tanpa aktivitas sebesar ini → sesi uji mati otomatis. */
	idleMs: 2 * 60 * 1000,
	/** Batas total satu sesi uji. */
	maxMs: 10 * 60 * 1000,
} as const;

/** Ambang kemiripan kata (0..1) yang menandai jawaban GPT-Live "mirip" teks Claude. */
export const PARAPHRASE_SIMILAR_MIN = 0.7;

export const VOICE_LAB_PATHS = ["v2", "v1b"] as const;
export type VoiceLabPath = (typeof VOICE_LAB_PATHS)[number];
