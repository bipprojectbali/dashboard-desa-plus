import type { VoiceStatus } from "@/store/assistant-voice";
import type { VoiceSessionStartResponse } from "@/types/ai-assistant-voice";
import type { StreamHandlers } from "../assistant-stream.api";
import { startVoiceSession } from "./voice.api";
import { createAnswerSender } from "./voice-answer-sender";
import {
	createLevelMeter,
	type LevelMeter,
	openMic,
	stopStream,
} from "./voice-devices";
import { openPeer, type Peer } from "./voice-peer";
import { createSettleWatcher } from "./voice-settle";
import { formatSpokenNumbers } from "./voice-spoken-numbers";
import { stripMarkdown } from "./voice-text";

/**
 * Satu sesi mode suara di panel: mikrofon → GPT-Live (WebRTC, SDP lewat
 * server). GPT-Live mendelegasikan tiap pertanyaan; klien menanyakannya ke
 * Claude lewat jalur chat yang sama lalu mengirim jawabannya per kalimat
 * (`session.commentary.append`) setelah pemformat angka lisan. Ucapan baru
 * saat menjawab = barge-in: chat/stream dibatalkan, sisa kalimat tidak dikirim.
 */

export interface VoiceControllerEvents {
	status(status: VoiceStatus): void;
	/** Sesi server dibuat (SDP answer diterima) — sebelum data channel terbuka. */
	session(start: VoiceSessionStartResponse): void;
	/** Transkrip ucapan user yang sedang berjalan ("" = kosong lagi). */
	transcript(text: string): void;
	/** Ada percakapan (ucapan/jawaban) — untuk timer mati-otomatis saat hening. */
	activity(): void;
	/** Koneksi GPT-Live putus di luar kendali user. */
	lost(): void;
	/** Tanyakan ke Claude; mengembalikan teks jawaban final. Ditolak saat dibatalkan. */
	ask(
		question: string,
		handlers: StreamHandlers,
		signal: AbortSignal,
	): Promise<string>;
}

export interface VoiceControllerOptions {
	events: VoiceControllerEvents;
	/** Dikirim ke GPT-Live bila Claude gagal menjawab / ucapan tak terbaca. */
	failureCommentary: string;
	emptyCommentary: string;
}

export interface VoiceController {
	setAnswerMuted(muted: boolean): void;
	setMicMuted(muted: boolean): void;
	stop(): void;
}

/** Tunggu transkrip setelah delegasi dibuat (event delegasi tak memuat ucapan). */
const TRANSCRIPT_WAIT_MS = 2000;
const TRANSCRIPT_POLL_MS = 100;
/** Tunggu `session.started` setelah data channel terbuka sebelum dianggap siap. */
const STARTED_FALLBACK_MS = 3000;
/** RMS audio GPT-Live yang dianggap terdengar. */
const REMOTE_AUDIBLE_RMS = 0.01;
/** Kembali "Siap bicara" setelah jawaban terkirim dan audio GPT-Live hening. */
const PANEL_SETTLE = {
	minWaitMs: 1500,
	quietMs: 1200,
	maxWaitMs: 60_000,
	pollMs: 250,
};
const MIC_OPTIONS = {
	deviceId: "",
	echoCancellation: true,
	noiseSuppression: true,
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const isAbort = (err: unknown) =>
	err instanceof DOMException && err.name === "AbortError";

/** Bentuk teks yang dibacakan: tanpa markdown, angka dalam kata. */
export function toSpokenPiece(piece: string): string {
	return formatSpokenNumbers(stripMarkdown(piece)).text;
}

export async function createVoiceController(
	opts: VoiceControllerOptions,
): Promise<VoiceController> {
	const { events } = opts;
	const mic = await openMic(MIC_OPTIONS);
	const remote = new Audio();
	const settle = createSettleWatcher(() => performance.now(), PANEL_SETTLE);
	let peer: Peer | null = null;
	let meter: LevelMeter | null = null;
	let closed = false;
	let started = false;
	let utterance = "";
	let answering: AbortController | null = null;

	const setStatus = (s: VoiceStatus) => {
		if (!closed) events.status(s);
	};

	const commentary = (delegationId: string, content: string) =>
		peer?.send({
			type: "session.commentary.append",
			event_id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			delegation_id: delegationId,
			content,
		});

	const bargeIn = () => {
		if (!answering) return;
		answering.abort();
		answering = null;
		settle.stopAll();
	};

	const takeUtterance = async () => {
		const until = performance.now() + TRANSCRIPT_WAIT_MS;
		while (!utterance.trim() && performance.now() < until && !closed)
			await sleep(TRANSCRIPT_POLL_MS);
		const text = utterance.trim();
		utterance = "";
		events.transcript("");
		return text;
	};

	const delegate = async (delegationId: string) => {
		const question = await takeUtterance();
		if (closed) return;
		if (!question) {
			commentary(delegationId, opts.emptyCommentary);
			setStatus("ready");
			return;
		}
		bargeIn();
		const turn = new AbortController();
		answering = turn;
		setStatus("answering");
		const sender = createAnswerSender({
			mode: "sentence",
			send: (content) => commentary(delegationId, content),
			isCancelled: () => turn.signal.aborted || closed,
			transform: toSpokenPiece,
		});
		try {
			const answer = await events.ask(
				question,
				{
					onStatus: () => sender.toolStarted(),
					onDelta: (text) => {
						sender.delta(text);
						events.activity();
					},
				},
				turn.signal,
			);
			sender.finish(answer);
			settle.wait(performance.now(), () => {
				if (answering !== turn) return;
				answering = null;
				setStatus("ready");
			});
		} catch (err) {
			sender.cancel();
			// Barge-in sudah mengganti giliran (status "Mendengarkan"); selain itu kembali siap.
			if (answering !== turn || closed) return;
			answering = null;
			if (!isAbort(err)) commentary(delegationId, opts.failureCommentary);
			setStatus("ready");
		}
	};

	const onEvent = (event: Record<string, unknown>) => {
		const type = String(event.type ?? "");
		if (type === "session.started") {
			started = true;
			setStatus("ready");
		} else if (type === "session.input_transcript.delta") {
			bargeIn();
			utterance += String(event.delta ?? "");
			events.transcript(utterance);
			events.activity();
			setStatus("listening");
		} else if (type === "session.output_transcript.delta") {
			events.activity();
		} else if (type === "session.delegation.created") {
			const id = (event.delegation as { id?: unknown } | undefined)?.id;
			if (typeof id === "string") void delegate(id);
		} else if (type === "session.closed") {
			if (!closed) events.lost();
		}
	};

	const stop = () => {
		if (closed) return;
		closed = true;
		answering?.abort();
		answering = null;
		settle.stopAll();
		meter?.stop();
		remote.srcObject = null;
		peer?.close();
		stopStream(mic);
	};

	try {
		peer = await openPeer({
			mic,
			exchange: async (offer) => {
				const start = await startVoiceSession(offer);
				events.session(start);
				return start.sdp;
			},
			onEvent,
			onClose: () => {
				if (!closed) events.lost();
			},
			onRemoteStream: (stream) => {
				remote.srcObject = stream;
				// Autoplay diblokir jarang terjadi (diawali klik user); jawaban tetap tampil sebagai teks.
				remote.play().catch((err: unknown) => {
					console.warn("Voice answer audio blocked:", (err as Error).name);
				});
				meter = createLevelMeter(stream, (rms, now) => {
					if (rms > REMOTE_AUDIBLE_RMS) settle.heard(now);
				});
			},
		});
	} catch (err) {
		stop();
		throw err;
	}

	setTimeout(() => {
		if (!started) setStatus("ready");
	}, STARTED_FALLBACK_MS);

	return {
		setAnswerMuted(muted) {
			remote.muted = muted;
		},
		setMicMuted(muted) {
			for (const track of mic.getAudioTracks()) track.enabled = !muted;
		},
		stop,
	};
}
