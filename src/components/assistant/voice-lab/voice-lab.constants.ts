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

/** V1-B: jawaban Claude dikirim ke GPT-Live sekaligus ("whole") atau per kalimat selagi Claude masih menulis ("sentence"). */
export const SEND_MODES = ["whole", "sentence"] as const;
export type SendMode = (typeof SEND_MODES)[number];
export const DEFAULT_SEND_MODE: SendMode = "sentence";

/** Sama dengan `VOICE_LAB_LIMITS.instructionsMax` di server (dijaga test). */
export const LIVE_INSTRUCTIONS_MAX = 500;

/**
 * Instruksi sesi GPT-Live agar membacakan teks delegasi apa adanya. Tidak ada mode
 * "baca persis" resmi (commentary dilatih untuk parafrase), jadi ini upaya terbaik;
 * hasilnya diperiksa pencocokan otomatis per giliran.
 */
export const READ_EXACT_INSTRUCTION =
	"Saat membacakan teks dari delegasi (jawaban asisten), bacakan APA ADANYA, kata per kata. " +
	"Jangan meringkas, menambah, atau mengubah urutan. Angka, satuan (Rp, %, jiwa, KK), " +
	"nama tempat/banjar, dan tahun harus diucapkan persis seperti tertulis. " +
	"Jangan menambahkan komentar sendiri tentang isi jawaban.";
