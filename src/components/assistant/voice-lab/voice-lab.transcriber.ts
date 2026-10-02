import {
	relayTranscribeSdp,
	requestTranscribeToken,
	type TranscribeParams,
} from "./voice-lab.api";
import { openPeer, type Peer } from "./voice-lab.peer";
import type { TranscribeMode } from "./voice-lab.types";

/**
 * Sesi transkripsi: mikrofon → OpenAI lewat WebRTC (token sementara atau relay
 * server), akhir ucapan ditandai klien dengan `input_audio_buffer.commit`.
 * Nama event transkrip dibaca longgar (delta/completed) karena skema gpt-live-transcribe
 * belum terkonfirmasi; tipe event yang tak dikenali dilaporkan lewat `onUnknown`.
 */

export interface TranscriberHandlers {
	onDelta(text: string): void;
	onCompleted(text: string): void;
	onUnknown(type: string): void;
	onError(message: string): void;
	onClose(reason: string): void;
}

export interface Transcriber {
	commit(): boolean;
	close(): void;
}

const SDP_HEADERS = { "Content-Type": "application/sdp" } as const;

async function exchangeWithToken(
	offer: string,
	params: TranscribeParams,
): Promise<string> {
	const token = await requestTranscribeToken(params);
	const res = await fetch(token.callsUrl, {
		method: "POST",
		headers: { ...SDP_HEADERS, Authorization: `Bearer ${token.value}` },
		body: offer,
	});
	if (!res.ok)
		throw new Error(
			`OpenAI menolak token sementara untuk transkripsi (HTTP ${res.status})`,
		);
	return res.text();
}

function textOf(event: Record<string, unknown>, keys: string[]): string {
	for (const k of keys) {
		const v = event[k];
		if (typeof v === "string") return v;
	}
	return "";
}

function classify(type: string): "delta" | "completed" | "ignore" {
	const isTranscript = /transcri/.test(type);
	if (isTranscript && type.endsWith(".delta")) return "delta";
	if (isTranscript && type.endsWith(".completed")) return "completed";
	return "ignore";
}

const KNOWN_QUIET = /^(session\.|input_audio_buffer\.|transcription_session\.)/;

export async function createTranscriber(
	mic: MediaStream,
	mode: TranscribeMode,
	params: TranscribeParams,
	handlers: TranscriberHandlers,
): Promise<Transcriber> {
	let peer: Peer | null = null;
	peer = await openPeer({
		mic,
		exchange: (offer) =>
			mode === "token"
				? exchangeWithToken(offer, params)
				: relayTranscribeSdp(offer, params),
		onClose: handlers.onClose,
		onEvent: (event) => {
			const type = String(event.type ?? "");
			if (type === "error") {
				const err = event.error as { message?: string } | undefined;
				handlers.onError(err?.message ?? "Error dari sesi transkripsi");
				return;
			}
			const kind = classify(type);
			if (kind === "delta")
				handlers.onDelta(textOf(event, ["delta", "text", "transcript"]));
			else if (kind === "completed")
				handlers.onCompleted(textOf(event, ["transcript", "text"]));
			else if (!KNOWN_QUIET.test(type)) handlers.onUnknown(type);
		},
	});
	return {
		commit: () => peer?.send({ type: "input_audio_buffer.commit" }) ?? false,
		close: () => peer?.close(),
	};
}
