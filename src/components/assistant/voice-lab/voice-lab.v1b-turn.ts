import type { TurnView } from "./voice-lab.types";

/** Satu giliran V1-B beserta pengukuran waktunya (semua `*Ms` relatif ke akhir ucapan). */
export interface V1bTurn {
	view: TurnView;
	startedAt: number;
	endAt: number | null;
	endMethod: "vad" | "manual";
	transcriptMs: number | null;
	firstTokenMs: number | null;
	firstAudioMs: number | null;
	answerAudioMs: number | null;
	abort: AbortController;
	recorded: boolean;
}

export function newV1bTurn(id: number, now: number): V1bTurn {
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
		firstAudioMs: null,
		answerAudioMs: null,
		abort: new AbortController(),
		recorded: false,
	};
}
