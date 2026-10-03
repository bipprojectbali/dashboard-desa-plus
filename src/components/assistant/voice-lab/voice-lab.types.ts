import type { SendMode, VoiceLabPath } from "./voice-lab.constants";
import type { VerifyResult } from "./voice-lab.verify";

/** Bentuk respons `GET /api/admin/ai-assistant/voice-lab/config`. */
export interface VoiceLabConfig {
	slotReady: boolean;
	slotError: { code: string; error: string } | null;
	defaults: {
		transcribeModel: string;
		transcribeLanguage: string;
		transcribeDelay: string;
		ttsModel: string;
		ttsVoice: string;
		liveModel: string;
	};
	suggestions: {
		transcribeModels: string[];
		ttsModels: string[];
		ttsVoices: string[];
		liveModels: string[];
		transcribeDelays: string[];
	};
}

export type TranscribeMode = "token" | "relay";
export type EndMethod = "vad" | "manual";

/** Pengaturan yang bisa diubah di halaman uji. */
export interface VoiceLabSettings {
	transcribeModel: string;
	transcribeLanguage: string;
	transcribeDelay: string;
	transcribeMode: TranscribeMode;
	ttsModel: string;
	ttsVoice: string;
	liveModel: string;
	liveInstructions: string;
	sendMode: SendMode;
	endMethod: EndMethod;
	threshold: number;
	silenceMs: number;
	echoCancellation: boolean;
	noiseSuppression: boolean;
	deviceId: string;
}

/** Status yang ditampilkan ke pengguna. */
export type VoiceStatus =
	| "off"
	| "connecting"
	| "ready"
	| "listening"
	| "answering";

export type TurnState =
	| "listening"
	| "transcribing"
	| "thinking"
	| "answering"
	| "done"
	| "interrupted"
	| "error";

/** Satu giliran bicara untuk ditampilkan. `spokenText` = ucapan GPT-Live (hanya V1-B). */
export interface TurnView {
	id: number;
	path: VoiceLabPath;
	state: TurnState;
	userText: string;
	answerText: string;
	spokenText: string;
	/** V1-B: jumlah karakter awal `spokenText` yang diucapkan sebelum jawaban Claude dikirim (kalimat pengisi). */
	fillerChars?: number;
	/** V1-B: cara jawaban Claude dikirim pada giliran ini. */
	sendMode?: SendMode;
	/** V1-B: jumlah potongan (kalimat) yang dikirim ke GPT-Live. */
	sentencesSent?: number;
	/** V1-B: hasil pencocokan otomatis angka/nama (ada setelah giliran selesai). */
	verify?: VerifyResult;
	/** Jumlah aksi penunjuk dari jawaban (hanya ditampilkan sebagai "ada"). */
	actionCount: number;
	error?: string;
}

/** Jembatan controller → UI. Tidak membawa kunci maupun audio. */
export interface ControllerEvents {
	status(status: VoiceStatus): void;
	turn(turn: TurnView): void;
	/** Pengukuran satu giliran selesai (dicatat sekali per giliran). */
	metrics(metrics: import("./voice-lab.stats").TurnMetrics): void;
	activity(): void;
	/** Baris log tahap tanpa isi percakapan. */
	log(line: string): void;
	error(message: string): void;
	nextTurnId(): number;
}

export interface VoiceController {
	start(): Promise<void>;
	stop(): void;
	/** Tandai akhir ucapan secara manual. */
	commit(): void;
	onVad(event: import("./voice-lab.vad").VadEvent): void;
}
