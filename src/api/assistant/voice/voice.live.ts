import { LIVE_INSTRUCTIONS_MAX } from "@/config/assistant-identity";
import { VOICE_NAME_PATTERNS } from "@/types/ai-assistant-voice";
import {
	VOICE_SDP_MAX_CHARS,
	VOICE_SLOT_MESSAGES,
	VOICE_UPSTREAM_TIMEOUT_MS,
} from "./voice.constants";
import type { VoiceSlotCredentials } from "./voice.slot";
import { type FetchLike, postToOpenAi } from "./voice.upstream";

/**
 * Sesi GPT-Live (V1-B) dengan delegasi klien: SDP tawaran browser diteruskan
 * server ke `POST {baseUrl}/live/sessions` memakai kunci slot Suara. Dipakai
 * panel Jenna (instruksi dibangun server) dan halaman uji voice-lab.
 */

/** Hasil validasi: nilai bersih atau pesan error untuk respons 422. */
export type Validated<T> =
	| { ok: true; value: T }
	| { ok: false; error: string };

const invalidFieldText = (field: string): string =>
	`${VOICE_SLOT_MESSAGES.invalidInput}: ${field}`;

export const invalidField = (field: string): Validated<never> => ({
	ok: false,
	error: invalidFieldText(field),
});

/** SDP tawaran browser: diawali `v=0`, ≤ 64 KB, diakhiri CRLF seperti yang diminta OpenAI. */
export function parseOfferSdp(raw: string): Validated<string> {
	const sdp = raw.trim();
	if (sdp === "" || sdp.length > VOICE_SDP_MAX_CHARS || !sdp.startsWith("v=0"))
		return invalidField("sdp");
	return { ok: true, value: `${sdp}\r\n` };
}

/** Instruksi sesi GPT-Live: dipangkas, null bila kosong, ditolak bila > 500 karakter. */
export function parseLiveInstructions(
	raw: string | null | undefined,
): Validated<string | null> {
	const text = (raw ?? "").trim();
	if (text.length > LIVE_INSTRUCTIONS_MAX) return invalidField("instructions");
	return { ok: true, value: text || null };
}

export interface LiveSessionRequest {
	slot: VoiceSlotCredentials;
	safetyId: string;
	sdp: string;
	model: string;
	instructions: string | null;
	/** Nama suara GPT-Live; null = suara bawaan model (tidak dikirim). */
	voice?: string | null;
	fetchImpl?: FetchLike;
}

export type LiveSessionResult =
	| { ok: true; value: { sessionId: string; sdp: string } }
	| { ok: false; status: number; error: string };

/** Buka sesi GPT-Live dan kembalikan id sesi + SDP jawaban. */
export async function openLiveSession(
	req: LiveSessionRequest,
): Promise<LiveSessionResult> {
	if (!VOICE_NAME_PATTERNS.model.test(req.model))
		return { ok: false, status: 422, error: invalidFieldText("model") };
	const session: Record<string, unknown> = {
		model: req.model,
		delegation: { type: "client" },
	};
	if (req.instructions) session.instructions = req.instructions;
	if (req.voice) session.voice = req.voice;
	const upstream = await postToOpenAi({
		slot: req.slot,
		safetyId: req.safetyId,
		path: "/live/sessions",
		timeoutMs: VOICE_UPSTREAM_TIMEOUT_MS,
		fetchImpl: req.fetchImpl,
		body: { session, transport: { type: "webrtc", sdp: req.sdp } },
	});
	if (!upstream.ok) return upstream;
	const json = (await upstream.response.json().catch(() => null)) as {
		session?: { id?: unknown };
		transport?: { sdp?: unknown };
	} | null;
	const sessionId = json?.session?.id;
	const answer = json?.transport?.sdp;
	if (typeof sessionId !== "string" || typeof answer !== "string")
		return {
			ok: false,
			status: 502,
			error: VOICE_SLOT_MESSAGES.upstreamBadShape,
		};
	return { ok: true, value: { sessionId, sdp: answer } };
}
