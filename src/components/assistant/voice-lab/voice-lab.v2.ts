import { askClaude, describeError, isAbort } from "./voice-lab.claude";
import { stripMarkdown, takeSentences } from "./voice-lab.text";
import { createTranscriber } from "./voice-lab.transcriber";
import { createTtsPlayer } from "./voice-lab.tts";
import type {
	ControllerEvents,
	TurnView,
	VoiceController,
	VoiceLabSettings,
} from "./voice-lab.types";
import type { VadEvent } from "./voice-lab.vad";

/**
 * Jalur V2: mikrofon → transkripsi (telinga) → Claude lewat chat/stream →
 * TTS bertahap per kalimat (mulut). Claude satu-satunya otak; OpenAI hanya
 * mendengar dan berbicara.
 */

export interface V2Deps {
	mic: MediaStream;
	getSettings(): VoiceLabSettings;
	events: ControllerEvents;
}

/** Kalimat TTS lebih pendek dari ini digabung ke kalimat berikutnya. */
const MIN_TTS_CHARS = 40;

interface Turn {
	view: TurnView;
	endAt: number;
	endMethod: "vad" | "manual";
	transcriptMs: number | null;
	firstTokenMs: number | null;
	firstAudioMs: number | null;
	abort: AbortController;
	recorded: boolean;
}

export async function createV2Controller(
	deps: V2Deps,
): Promise<VoiceController> {
	const { events, getSettings } = deps;
	let conversationId: string | undefined;
	let current: Turn | null = null;
	let answering: Turn | null = null;
	const awaiting: Turn[] = [];
	let closed = false;

	const emit = (t: Turn) => events.turn({ ...t.view });
	const setState = (t: Turn, state: TurnView["state"], error?: string) => {
		t.view.state = state;
		if (error) t.view.error = error;
		emit(t);
	};

	const record = (t: Turn) => {
		if (t.recorded || t.transcriptMs === null) return;
		t.recorded = true;
		events.metrics({
			id: t.view.id,
			path: "v2",
			endMethod: t.endMethod,
			transcriptMs: t.transcriptMs,
			firstTokenMs: t.firstTokenMs,
			firstSentenceSentMs: null,
			firstAudioMs: t.firstAudioMs,
			answerAudioMs: t.firstAudioMs,
			overlap: null,
			sendMode: null,
			matchScore: null,
			numbersChanged: null,
		});
	};

	const tts = createTtsPlayer({
		params: () => {
			const s = getSettings();
			return { model: s.ttsModel, voice: s.ttsVoice };
		},
		onFirstAudio: () => {
			if (answering && answering.firstAudioMs === null) {
				answering.firstAudioMs = performance.now() - answering.endAt;
				events.log("audio pertama terdengar");
			}
			events.activity();
		},
		onError: (message) => events.error(message),
		onDrained: () => {
			const turn = answering;
			answering = null;
			if (turn && ["thinking", "answering"].includes(turn.view.state)) {
				setState(turn, "done");
				record(turn);
			}
			if (!closed) events.status("ready");
		},
	});

	const interruptAnswer = () => {
		const turn = answering;
		if (!turn) return;
		answering = null;
		turn.abort.abort();
		tts.stop();
		setState(turn, "interrupted");
		record(turn);
		events.log("barge-in: jawaban dipotong");
	};

	const newTurn = (endAt: number, method: "vad" | "manual"): Turn => ({
		view: {
			id: events.nextTurnId(),
			path: "v2",
			state: "listening",
			userText: "",
			answerText: "",
			spokenText: "",
			actionCount: 0,
		},
		endAt,
		endMethod: method,
		transcriptMs: null,
		firstTokenMs: null,
		firstAudioMs: null,
		abort: new AbortController(),
		recorded: false,
	});

	const beginTurn = (now: number): Turn => {
		interruptAnswer();
		const turn = newTurn(now, "vad");
		current = turn;
		emit(turn);
		events.status("listening");
		events.activity();
		return turn;
	};

	const runAnswer = async (turn: Turn) => {
		answering = turn;
		tts.begin();
		events.status("answering");
		setState(turn, "thinking");
		let buffer = "";
		try {
			const res = await askClaude(
				turn.view.userText,
				conversationId,
				{
					onStatus: () => {
						// Teks sebelum tool hanyalah pembuka; jawaban akhir menyusul.
						buffer = "";
						turn.view.answerText = "";
						tts.clearPending();
					},
					onDelta: (text) => {
						if (turn.firstTokenMs === null) {
							turn.firstTokenMs = performance.now() - turn.endAt;
							events.log("token Claude pertama");
						}
						turn.view.state = "answering";
						turn.view.answerText += text;
						buffer += text;
						const { sentences, rest } = takeSentences(buffer, MIN_TTS_CHARS);
						buffer = rest;
						for (const s of sentences) tts.enqueue(stripMarkdown(s));
						emit(turn);
						events.activity();
					},
				},
				turn.abort.signal,
			);
			conversationId = res.conversationId;
			turn.view.answerText = res.text;
			turn.view.actionCount = res.actionCount;
			emit(turn);
			tts.enqueue(
				stripMarkdown(turn.firstTokenMs === null ? res.text : buffer),
			);
			tts.end();
		} catch (err) {
			if (isAbort(err) || turn.abort.signal.aborted) return;
			answering = null;
			tts.stop();
			setState(turn, "error", describeError(err));
			record(turn);
			events.status("ready");
		}
	};

	const transcriber = await createTranscriber(
		deps.mic,
		getSettings().transcribeMode,
		{
			model: getSettings().transcribeModel,
			language: getSettings().transcribeLanguage,
			delay: getSettings().transcribeDelay,
		},
		{
			onDelta: (text) => {
				const turn = awaiting[0];
				if (!turn) return;
				turn.view.userText += text;
				emit(turn);
			},
			onCompleted: (text) => {
				const turn = awaiting.shift();
				if (!turn) return;
				turn.transcriptMs = performance.now() - turn.endAt;
				events.log("transkrip final diterima");
				turn.view.userText = text.trim();
				if (!turn.view.userText) {
					setState(turn, "error", "Tidak ada ucapan yang terbaca");
					if (!answering && !closed) events.status("ready");
					return;
				}
				void runAnswer(turn);
			},
			onUnknown: (type) => events.log(`event transkripsi tak dikenal: ${type}`),
			onError: (message) => events.error(message),
			onClose: (reason) => {
				if (!closed) events.error(`Sesi transkripsi berakhir: ${reason}`);
			},
		},
	);

	const endTurn = (endAt: number, method: "vad" | "manual") => {
		const turn = current ?? beginTurn(endAt);
		current = null;
		turn.endAt = endAt;
		turn.endMethod = method;
		if (!transcriber.commit()) {
			setState(turn, "error", "Sesi transkripsi belum tersambung");
			return;
		}
		awaiting.push(turn);
		setState(turn, "transcribing");
		events.log(`akhir ucapan (${method}) → commit`);
	};

	return {
		async start() {
			events.status("ready");
		},
		stop() {
			closed = true;
			for (const t of [current, answering, ...awaiting]) t?.abort.abort();
			tts.stop();
			transcriber.close();
			for (const t of [answering, ...awaiting]) if (t) record(t);
		},
		commit() {
			endTurn(performance.now(), "manual");
		},
		onVad(event: VadEvent) {
			if (event.type === "speech-start") {
				if (!current) beginTurn(event.at);
			} else if (getSettings().endMethod === "vad") {
				endTurn(event.at, "vad");
			}
		},
	};
}
