import type { SendMode } from "./voice-lab.constants";
import type { TurnView } from "./voice-lab.types";

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
	abort: AbortController;
	/** Ditutup normal setelah GPT-Live selesai bicara (bukan Off/barge-in) → boleh dinilai. */
	settled: boolean;
	recorded: boolean;
}

export function newV1bTurn(
	id: number,
	now: number,
	sendMode: SendMode,
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
		sendMode,
		abort: new AbortController(),
		settled: false,
		recorded: false,
	};
}
