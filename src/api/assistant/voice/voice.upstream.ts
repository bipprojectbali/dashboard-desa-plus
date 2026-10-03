import {
	SAFETY_IDENTIFIER_HEADER,
	VOICE_SLOT_MESSAGES,
} from "./voice.constants";
import type { VoiceSlotCredentials } from "./voice.slot";

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export interface UpstreamFailure {
	ok: false;
	status: number;
	error: string;
}

export interface UpstreamCall {
	slot: VoiceSlotCredentials;
	path: string;
	safetyId: string;
	/** Badan JSON; abaikan bila `form` diisi. */
	body?: unknown;
	/** Multipart (mis. `/realtime/calls`: sdp + session); Content-Type diatur fetch. */
	form?: FormData;
	timeoutMs: number;
	signal?: AbortSignal;
	fetchImpl?: FetchLike;
	accept?: string;
}

const MESSAGE_MAX_CHARS = 200;

/**
 * Pesan error OpenAI yang aman ditampilkan ke admin: kode HTTP + `error.message`
 * terpotong. Hanya dibaca dari respons error, tidak pernah dicatat ke log.
 */
async function describeRejection(res: Response): Promise<string> {
	const base = `${VOICE_SLOT_MESSAGES.upstreamRejected} (HTTP ${res.status})`;
	try {
		const json = (await res.json()) as { error?: { message?: unknown } };
		const message = json.error?.message;
		return typeof message === "string"
			? `${base}: ${message.slice(0, MESSAGE_MAX_CHARS)}`
			: base;
	} catch {
		return base;
	}
}

/**
 * POST JSON ke `{baseUrl}{path}` dengan kunci slot Suara + Safety-Identifier.
 * Redirect tidak diikuti. Mengembalikan Response sukses atau kegagalan 502.
 */
export async function postToOpenAi(
	call: UpstreamCall,
): Promise<{ ok: true; response: Response } | UpstreamFailure> {
	const signals = [AbortSignal.timeout(call.timeoutMs)];
	if (call.signal) signals.push(call.signal);
	const headers: Record<string, string> = {
		Authorization: `Bearer ${call.slot.apiKey}`,
		Accept: call.accept ?? "application/json",
		[SAFETY_IDENTIFIER_HEADER]: call.safetyId,
	};
	if (!call.form) headers["Content-Type"] = "application/json";
	let res: Response;
	try {
		res = await (call.fetchImpl ?? fetch)(`${call.slot.baseUrl}${call.path}`, {
			method: "POST",
			redirect: "manual",
			headers,
			body: call.form ?? JSON.stringify(call.body),
			signal: AbortSignal.any(signals),
		});
	} catch (err) {
		const reason = err instanceof Error ? err.name : "Error";
		return {
			ok: false,
			status: 502,
			error: `${VOICE_SLOT_MESSAGES.upstreamUnreachable} [${reason}]`,
		};
	}
	if (!res.ok)
		return { ok: false, status: 502, error: await describeRejection(res) };
	return { ok: true, response: res };
}
