import type { VoiceLabConfig } from "./voice-lab.types";

const BASE = "/api/admin/ai-assistant/voice-lab";

export class VoiceLabApiError extends Error {
	readonly status: number;
	readonly code?: string;
	constructor(status: number, message: string, code?: string) {
		super(message);
		this.name = "VoiceLabApiError";
		this.status = status;
		this.code = code;
	}
}

async function post(
	path: string,
	body: unknown,
	signal?: AbortSignal,
): Promise<Response> {
	let res: Response;
	try {
		res = await fetch(`${BASE}${path}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal,
		});
	} catch (err) {
		if (signal?.aborted) throw err;
		throw new VoiceLabApiError(
			0,
			`Gagal menghubungi server: ${(err as Error).message}`,
		);
	}
	if (res.ok) return res;
	const data = (await res.json().catch(() => ({}))) as {
		error?: string;
		code?: string;
	};
	throw new VoiceLabApiError(
		res.status,
		data.error ?? `Permintaan gagal (${res.status})`,
		data.code,
	);
}

export async function fetchVoiceLabConfig(
	signal?: AbortSignal,
): Promise<VoiceLabConfig> {
	const res = await fetch(`${BASE}/config`, {
		credentials: "include",
		signal,
	});
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as { error?: string };
		throw new VoiceLabApiError(
			res.status,
			data.error ?? `Gagal memuat (${res.status})`,
		);
	}
	return (await res.json()) as VoiceLabConfig;
}

export interface TranscribeParams {
	model: string;
	language: string;
	delay: string;
}

export async function requestTranscribeToken(
	params: TranscribeParams,
): Promise<{ value: string; callsUrl: string; expiresAt: number | null }> {
	return (await (await post("/transcribe-token", params)).json()) as {
		value: string;
		callsUrl: string;
		expiresAt: number | null;
	};
}

export async function relayTranscribeSdp(
	sdp: string,
	params: TranscribeParams,
): Promise<string> {
	const data = (await (
		await post("/transcribe-call", { sdp, ...params })
	).json()) as { sdp: string };
	return data.sdp;
}

export async function createLiveSession(input: {
	sdp: string;
	model: string;
	instructions: string;
}): Promise<{ sessionId: string; sdp: string }> {
	return (await (await post("/live-session", input)).json()) as {
		sessionId: string;
		sdp: string;
	};
}

/** Audio mp3 satu potong teks. */
export async function fetchTtsAudio(
	input: { text: string; model: string; voice: string },
	signal?: AbortSignal,
): Promise<Blob> {
	return (await post("/tts", input, signal)).blob();
}
