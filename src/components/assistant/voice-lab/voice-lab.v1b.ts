import { createAnswerAudioTracker } from "./voice-lab.answer-audio";
import { createLiveSession } from "./voice-lab.api";
import { LIVE_INSTRUCTIONS_MAX } from "./voice-lab.constants";
import { createLevelMeter, type LevelMeter } from "./voice-lab.devices";
import { validateLiveInstructions } from "./voice-lab.instructions";
import { openPeer, type Peer } from "./voice-lab.peer";
import { wordOverlap } from "./voice-lab.text";
import type {
	ControllerEvents,
	VoiceController,
	VoiceLabSettings,
} from "./voice-lab.types";
import { type AnswerContext, answerQuestion } from "./voice-lab.v1b-answer";
import { createSettleWatcher } from "./voice-lab.v1b-settle";
import { newV1bTurn, type V1bTurn } from "./voice-lab.v1b-turn";
import type { VadEvent } from "./voice-lab.vad";
import { verifyAnswer } from "./voice-lab.verify";

/**
 * Jalur V1-B: GPT-Live (WebRTC) berbicara; saat ia mendelegasikan, klien
 * meneruskan ucapan ke Claude lewat chat/stream lalu mengirim hasilnya sebagai
 * `session.commentary.append` dengan `delegation_id` yang sama — utuh atau per
 * kalimat (lihat `voice-lab.v1b-answer.ts`). Teks asli Claude ditampilkan
 * berdampingan dengan transkrip ucapan GPT-Live + hasil pencocokan angka/nama.
 */

export interface V1bDeps {
	mic: MediaStream;
	getSettings(): VoiceLabSettings;
	events: ControllerEvents;
	/** Nama (banjar/modul) yang dicocokkan antara teks Claude dan ucapan. */
	getTerms(): readonly string[];
}
/** Tunggu transkrip masuk setelah delegasi dibuat (event delegasi tak memuat ucapan). */
const TRANSCRIPT_WAIT_MS = 2000;
const TRANSCRIPT_POLL_MS = 100;
/** RMS audio GPT-Live yang dianggap "terdengar". */
const REMOTE_AUDIBLE_RMS = 0.01;
/** Jeda hening yang memisahkan kalimat pengisi GPT-Live dari jawaban Claude. */
const ANSWER_GAP_MS = 400;
/** Tunggu `session.started` setelah data channel terbuka sebelum dianggap siap. */
const STARTED_FALLBACK_MS = 3000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function createV1bController(
	deps: V1bDeps,
): Promise<VoiceController> {
	const { events, getSettings } = deps;
	let conversationId: string | undefined;
	let current: V1bTurn | null = null;
	let peer: Peer | null = null;
	let meter: LevelMeter | null = null;
	let closed = false;
	const remote = new Audio();
	const unknownTypes = new Set<string>();
	let started = false;
	const answerAudio = createAnswerAudioTracker(
		REMOTE_AUDIBLE_RMS,
		ANSWER_GAP_MS,
	);
	const settle = createSettleWatcher();

	const emit = (t: V1bTurn) => events.turn({ ...t.view });

	const record = (t: V1bTurn) => {
		if (t.recorded || t.transcriptMs === null) return;
		t.recorded = true;
		const { answerText, spokenText, fillerChars } = t.view;
		const verify =
			t.settled && answerText && fillerChars !== undefined
				? verifyAnswer(
						answerText,
						spokenText.slice(fillerChars),
						deps.getTerms(),
					)
				: undefined;
		if (verify) {
			t.view.verify = verify;
			emit(t);
		}
		events.metrics({
			id: t.view.id,
			path: "v1b",
			endMethod: t.endMethod,
			transcriptMs: t.transcriptMs,
			firstTokenMs: t.firstTokenMs,
			firstSentenceSentMs: t.firstSentenceSentMs,
			firstAudioMs: t.firstAudioMs,
			answerAudioMs: t.answerAudioMs,
			overlap:
				t.view.answerText && t.view.spokenText
					? wordOverlap(t.view.answerText, t.view.spokenText)
					: null,
			sendMode: t.sendMode,
			matchScore: verify?.score ?? null,
			numbersChanged: verify ? verify.numbersChanged : null,
		});
	};

	const closeTurn = (t: V1bTurn | null) => {
		if (!t) return;
		if (
			["listening", "transcribing", "thinking", "answering"].includes(
				t.view.state,
			)
		) {
			t.view.state =
				t.view.answerText || t.view.spokenText ? "done" : "interrupted";
			emit(t);
		}
		record(t);
	};

	const beginTurn = (now: number): V1bTurn => {
		if (current && ["thinking", "answering"].includes(current.view.state)) {
			current.abort.abort();
			events.log("barge-in: sisa jawaban dibatalkan");
		}
		closeTurn(current);
		const turn = newV1bTurn(events.nextTurnId(), now, getSettings().sendMode);
		current = turn;
		emit(turn);
		events.status("listening");
		events.activity();
		return turn;
	};

	const waitForUserText = async (turn: V1bTurn) => {
		const until = performance.now() + TRANSCRIPT_WAIT_MS;
		while (!turn.view.userText.trim() && performance.now() < until)
			await sleep(TRANSCRIPT_POLL_MS);
		return turn.view.userText.trim();
	};

	const commentary = (delegationId: string, content: string) =>
		peer?.send({
			type: "session.commentary.append",
			event_id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			delegation_id: delegationId,
			content,
		});

	const answerCtx: AnswerContext = {
		events,
		commentary,
		emit,
		getConversationId: () => conversationId,
		setConversationId: (id) => {
			conversationId = id;
		},
		answerStarted: (now) => answerAudio.sent(now),
		answerSent: (turn) =>
			settle.wait(performance.now(), () => {
				turn.settled = true;
				closeTurn(turn);
				if (!closed && current === turn) events.status("ready");
			}),
		failed: (turn) => {
			record(turn);
			events.status("ready");
		},
	};

	const delegate = async (delegationId: string) => {
		const turn = current ?? beginTurn(performance.now());
		const endAt = turn.endAt ?? performance.now();
		turn.endAt = endAt;
		turn.view.state = "transcribing";
		emit(turn);
		const question = await waitForUserText(turn);
		turn.transcriptMs = performance.now() - endAt;
		events.log("delegasi diterima, ucapan siap");
		if (!question) {
			commentary(delegationId, "Ucapan tidak terbaca. Mohon ulangi.");
			turn.view.state = "error";
			turn.view.error = "Transkrip kosong saat delegasi";
			emit(turn);
			return;
		}
		turn.view.state = "thinking";
		emit(turn);
		events.status("answering");
		await answerQuestion(answerCtx, turn, delegationId, question, endAt);
	};

	const onEvent = (event: Record<string, unknown>) => {
		const type = String(event.type ?? "");
		if (type === "session.started") {
			started = true;
			events.status("ready");
			events.log("sesi GPT-Live dimulai");
		} else if (type === "session.input_transcript.delta") {
			const turn = current ?? beginTurn(performance.now());
			turn.view.userText += String(event.delta ?? "");
			emit(turn);
		} else if (type === "session.output_transcript.delta") {
			const turn = current ?? beginTurn(performance.now());
			turn.view.spokenText += String(event.delta ?? "");
			emit(turn);
			events.activity();
		} else if (type === "session.delegation.created") {
			const id = (event.delegation as { id?: unknown } | undefined)?.id;
			if (typeof id === "string") void delegate(id);
		} else if (type === "error") {
			const err = event.error as { message?: string } | undefined;
			events.error(err?.message ?? "Error dari sesi GPT-Live");
		} else if (type === "session.closed") {
			if (!closed) events.error("Sesi GPT-Live ditutup oleh server");
		} else if (
			!/\.(appended|delta|done|started)$|^session\.(thinking|input_audio)/.test(
				type,
			)
		) {
			if (!unknownTypes.has(type)) {
				unknownTypes.add(type);
				events.log(`event GPT-Live: ${type}`);
			}
		}
	};

	peer = await openPeer({
		mic: deps.mic,
		exchange: async (offer) => {
			const s = getSettings();
			if (validateLiveInstructions(s.liveInstructions))
				throw new Error(
					`Instruksi GPT-Live melebihi ${LIVE_INSTRUCTIONS_MAX} karakter`,
				);
			const session = await createLiveSession({
				sdp: offer,
				model: s.liveModel,
				instructions: s.liveInstructions,
			});
			return session.sdp;
		},
		onEvent,
		onClose: (reason) => {
			if (!closed) events.error(`Koneksi GPT-Live berakhir: ${reason}`);
		},
		onRemoteStream: (stream) => {
			remote.srcObject = stream;
			void remote.play().catch((err: Error) => {
				events.error(`Audio diblokir browser: ${err.message}`);
			});
			meter = createLevelMeter(stream, (rms, now) => {
				const turn = current;
				const answerAt = answerAudio.sample(rms, now);
				if (rms > REMOTE_AUDIBLE_RMS) settle.heard(now);
				if (!turn || turn.endAt === null) return;
				if (turn.firstAudioMs === null && rms > REMOTE_AUDIBLE_RMS) {
					turn.firstAudioMs = now - turn.endAt;
					events.log("audio pertama terdengar");
				}
				if (turn.answerAudioMs === null && answerAt !== null) {
					turn.answerAudioMs = answerAt - turn.endAt;
					events.log("audio jawaban terdengar");
				}
			});
		},
	});

	return {
		async start() {
			// Bila `session.started` terlewat, anggap siap setelah data channel terbuka.
			setTimeout(() => {
				if (!started && !closed) {
					events.log("session.started tidak terlihat; dianggap siap");
					events.status("ready");
				}
			}, STARTED_FALLBACK_MS);
		},
		stop() {
			closed = true;
			current?.abort.abort();
			settle.stopAll();
			closeTurn(current);
			meter?.stop();
			remote.srcObject = null;
			peer?.close();
		},
		commit() {
			events.log("tombol manual tidak berlaku di V1-B");
		},
		onVad(event: VadEvent) {
			if (event.type === "speech-start") {
				if (!current || current.endAt !== null) beginTurn(event.at);
			} else if (current && current.endAt === null) {
				current.endAt = event.at;
				current.view.state = "transcribing";
				emit(current);
			}
		},
	};
}
