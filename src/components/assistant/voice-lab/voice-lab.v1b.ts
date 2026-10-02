import { createLiveSession } from "./voice-lab.api";
import { askClaude, describeError, isAbort } from "./voice-lab.claude";
import { createLevelMeter, type LevelMeter } from "./voice-lab.devices";
import { openPeer, type Peer } from "./voice-lab.peer";
import { chunkText, wordOverlap } from "./voice-lab.text";
import type {
	ControllerEvents,
	TurnView,
	VoiceController,
	VoiceLabSettings,
} from "./voice-lab.types";
import type { VadEvent } from "./voice-lab.vad";

/**
 * Jalur V1-B: GPT-Live (WebRTC) berbicara; saat ia mendelegasikan, klien
 * meneruskan ucapan ke Claude lewat chat/stream lalu mengirim hasilnya sebagai
 * `session.commentary.append` dengan `delegation_id` yang sama. Teks asli
 * Claude ditampilkan berdampingan dengan transkrip ucapan GPT-Live.
 */

export interface V1bDeps {
	mic: MediaStream;
	getSettings(): VoiceLabSettings;
	events: ControllerEvents;
}

/** Batas aman satu `commentary.append` (dokumen: 500 token) dalam karakter. */
const COMMENTARY_MAX_CHARS = 1400;
/** Tunggu transkrip masuk setelah delegasi dibuat (event delegasi tak memuat ucapan). */
const TRANSCRIPT_WAIT_MS = 2000;
const TRANSCRIPT_POLL_MS = 100;
/** RMS audio GPT-Live yang dianggap "terdengar". */
const REMOTE_AUDIBLE_RMS = 0.01;
/** Tunggu `session.started` setelah data channel terbuka sebelum dianggap siap. */
const STARTED_FALLBACK_MS = 3000;
/** Setelah jawaban dikirim, tunggu audio pertama maksimal selama ini sebelum pengukuran ditutup. */
const AUDIO_WAIT_MS = 10_000;

interface Turn {
	view: TurnView;
	startedAt: number;
	endAt: number | null;
	endMethod: "vad" | "manual";
	transcriptMs: number | null;
	firstTokenMs: number | null;
	firstAudioMs: number | null;
	abort: AbortController;
	recorded: boolean;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function createV1bController(
	deps: V1bDeps,
): Promise<VoiceController> {
	const { events, getSettings } = deps;
	let conversationId: string | undefined;
	let current: Turn | null = null;
	let peer: Peer | null = null;
	let meter: LevelMeter | null = null;
	let closed = false;
	const remote = new Audio();
	const unknownTypes = new Set<string>();
	let started = false;

	const emit = (t: Turn) => events.turn({ ...t.view });

	const record = (t: Turn) => {
		if (t.recorded || t.transcriptMs === null) return;
		t.recorded = true;
		events.metrics({
			id: t.view.id,
			path: "v1b",
			endMethod: t.endMethod,
			transcriptMs: t.transcriptMs,
			firstTokenMs: t.firstTokenMs,
			firstAudioMs: t.firstAudioMs,
			overlap:
				t.view.answerText && t.view.spokenText
					? wordOverlap(t.view.answerText, t.view.spokenText)
					: null,
		});
	};

	const newTurn = (now: number): Turn => ({
		view: {
			id: events.nextTurnId(),
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
		abort: new AbortController(),
		recorded: false,
	});

	const closeTurn = (t: Turn | null) => {
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

	const beginTurn = (now: number): Turn => {
		closeTurn(current);
		const turn = newTurn(now);
		current = turn;
		emit(turn);
		events.status("listening");
		events.activity();
		return turn;
	};

	const waitForUserText = async (turn: Turn) => {
		const until = performance.now() + TRANSCRIPT_WAIT_MS;
		while (!turn.view.userText.trim() && performance.now() < until)
			await sleep(TRANSCRIPT_POLL_MS);
		return turn.view.userText.trim();
	};

	const sendCommentary = (delegationId: string, text: string) => {
		for (const content of chunkText(text, COMMENTARY_MAX_CHARS))
			peer?.send({
				type: "session.commentary.append",
				event_id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
				delegation_id: delegationId,
				content,
			});
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
			sendCommentary(delegationId, "Ucapan tidak terbaca. Mohon ulangi.");
			turn.view.state = "error";
			turn.view.error = "Transkrip kosong saat delegasi";
			emit(turn);
			return;
		}
		turn.view.state = "thinking";
		emit(turn);
		events.status("answering");
		try {
			const res = await askClaude(
				question,
				conversationId,
				{
					onStatus: () => undefined,
					onDelta: (text) => {
						if (turn.firstTokenMs === null) {
							turn.firstTokenMs = performance.now() - endAt;
							events.log("token Claude pertama");
						}
						turn.view.state = "answering";
						turn.view.answerText += text;
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
			sendCommentary(delegationId, res.text);
			events.log("jawaban Claude dikirim ke GPT-Live");
			setTimeout(() => {
				closeTurn(turn);
				if (!closed && current === turn) events.status("ready");
			}, AUDIO_WAIT_MS);
		} catch (err) {
			if (isAbort(err) || turn.abort.signal.aborted) return;
			const message = describeError(err);
			sendCommentary(delegationId, `Maaf, terjadi kendala: ${message}`);
			turn.view.state = "error";
			turn.view.error = message;
			emit(turn);
			record(turn);
			events.status("ready");
		}
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
				if (
					turn &&
					turn.endAt !== null &&
					turn.firstAudioMs === null &&
					rms > REMOTE_AUDIBLE_RMS
				) {
					turn.firstAudioMs = now - turn.endAt;
					events.log("audio pertama terdengar");
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
