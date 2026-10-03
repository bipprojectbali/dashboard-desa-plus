import type { SendMode } from "../voice/voice-answer-sender";
import type { TurnView, VoiceLabSettings } from "./voice-lab.types";

/** Satu giliran V1-B beserta pengukuran waktunya (semua `*Ms` relatif ke akhir ucapan). */
export interface V1bTurn {
	view: TurnView;
	startedAt: number;
	endAt: number | null;
	endMethod: "vad" | "manual";
	transcriptMs: number | null;
	firstTokenMs: number | null;
	firstSentenceSentMs: number | null;
	firstAudioMs: number | null;
	answerAudioMs: number | null;
	sendMode: SendMode;
	/** Pemformat angka lisan aktif untuk giliran ini (diambil saat giliran dimulai). */
	spokenNumbers: boolean;
	abort: AbortController;
	/** Ditutup normal setelah GPT-Live selesai bicara (bukan Off/barge-in) → boleh dinilai. */
	settled: boolean;
	recorded: boolean;
}

export function newV1bTurn(
	id: number,
	now: number,
	settings: Pick<VoiceLabSettings, "sendMode" | "spokenNumbers">,
): V1bTurn {
	return {
		view: {
			id,
			path: "v1b",
			state: "listening",
			userText: "",
			answerText: "",
			spokenText: "",
			actionCount: 0,
		},
		startedAt: now,
		endAt: null,
		endMethod: "vad",
		transcriptMs: null,
		firstTokenMs: null,
		firstSentenceSentMs: null,
		firstAudioMs: null,
		answerAudioMs: null,
		sendMode: settings.sendMode,
		spokenNumbers: settings.spokenNumbers,
		abort: new AbortController(),
		settled: false,
		recorded: false,
	};
}
