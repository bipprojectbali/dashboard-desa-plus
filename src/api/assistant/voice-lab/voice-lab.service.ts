import { buildLiveSessionInstruction } from "@/config/assistant-identity";
import {
	type AssistantSettingsValues,
	getAssistantSettings,
} from "../config/settings.repo";
import {
	type AccessDenied,
	type AccessUser,
	checkAdminUser,
} from "../http/access";
import {
	VOICE_SLOT_MESSAGES,
	VOICE_UPSTREAM_TIMEOUT_MS,
} from "../voice/voice.constants";
import { openLiveSession } from "../voice/voice.live";
import {
	hashSafetyIdentifier,
	resolveVoiceSlot,
	type VoiceSlotCredentials,
	type VoiceSlotDeps,
} from "../voice/voice.slot";
import { type FetchLike, postToOpenAi } from "../voice/voice.upstream";
import {
	VOICE_LAB_DEFAULTS,
	VOICE_LAB_SUGGESTIONS,
	VOICE_LAB_TOKEN_TTL_SECONDS,
	VOICE_LAB_TTS_TIMEOUT_MS,
} from "./voice-lab.constants";
import {
	type LiveSessionInput,
	parseLiveSessionInput,
	parseTranscribeTokenInput,
	parseTtsInput,
	type TranscribeTokenInput,
	type TtsInput,
	type Validated,
} from "./voice-lab.validation";

/**
 * Operasi halaman uji suara S0. Setiap operasi: guard admin → kredensial dari
 * slot `voice` (tanpa fallback ke Chat) → panggilan ke OpenAI dengan
 * Safety-Identifier ter-hash. Kunci OpenAI tidak pernah ada di nilai
 * kembalian; tidak ada isi transkrip/teks/audio yang dicatat.
 */

export interface VoiceLabDeps extends VoiceSlotDeps {
	checkAdmin?: (
		user: AccessUser | null | undefined,
	) => Promise<AccessDenied | null>;
	fetchImpl?: FetchLike;
	loadSettings?: () => Promise<AssistantSettingsValues>;
}

export interface VoiceLabFailure {
	ok: false;
	status: number;
	error: string;
	code?: string;
}
export type VoiceLabResult<T> = { ok: true; value: T } | VoiceLabFailure;

interface Prepared {
	slot: VoiceSlotCredentials;
	safetyId: string;
}

async function authorize(
	user: AccessUser | null | undefined,
	deps: VoiceLabDeps,
): Promise<VoiceLabFailure | null> {
	const denied = await (deps.checkAdmin ?? checkAdminUser)(user);
	return denied ? { ok: false, ...denied } : null;
}

async function prepare(
	user: AccessUser | null | undefined,
	deps: VoiceLabDeps,
): Promise<VoiceLabResult<Prepared>> {
	const denied = await authorize(user, deps);
	if (denied || !user)
		return denied ?? { ok: false, status: 401, error: "Unauthorized" };
	const resolved = await resolveVoiceSlot(deps);
	if (!resolved.ok) return resolved;
	return {
		ok: true,
		value: { slot: resolved.slot, safetyId: hashSafetyIdentifier(user.id) },
	};
}

const invalid = (error: string): VoiceLabFailure => ({
	ok: false,
	status: 422,
	error,
});
const badShape = (): VoiceLabFailure => ({
	ok: false,
	status: 502,
	error: VOICE_SLOT_MESSAGES.upstreamBadShape,
});

export interface VoiceLabConfigDto {
	slotReady: boolean;
	slotError: { code: string; error: string } | null;
	defaults: typeof VOICE_LAB_DEFAULTS;
	/** Instruksi GPT-Live bawaan = persona nama asisten + bacakan-persis bawaan (sama dengan produksi). */
	liveInstructions: string;
	suggestions: typeof VOICE_LAB_SUGGESTIONS;
}

/** Setelan awal halaman uji + status slot Suara (tanpa baseUrl/kunci). */
export async function getVoiceLabConfig(
	user: AccessUser | null | undefined,
	deps: VoiceLabDeps = {},
): Promise<VoiceLabResult<VoiceLabConfigDto>> {
	const denied = await authorize(user, deps);
	if (denied) return denied;
	const [slot, settings] = await Promise.all([
		resolveVoiceSlot(deps),
		(deps.loadSettings ?? getAssistantSettings)(),
	]);
	return {
		ok: true,
		value: {
			slotReady: slot.ok,
			slotError: slot.ok ? null : { code: slot.code, error: slot.error },
			defaults: VOICE_LAB_DEFAULTS,
			liveInstructions: buildLiveSessionInstruction(
				settings.assistantName,
				null,
			),
			suggestions: VOICE_LAB_SUGGESTIONS,
		},
	};
}

function transcriptionSession(input: TranscribeTokenInput) {
	return {
		type: "transcription",
		audio: {
			input: {
				transcription: {
					model: input.model,
					languages: [input.language],
					delay: input.delay,
				},
				turn_detection: null,
			},
		},
	};
}

export interface TranscribeTokenDto {
	value: string;
	expiresAt: number | null;
	callsUrl: string;
	model: string;
}

/** Token sementara (`/realtime/client_secrets`) untuk sesi transkripsi yang disambung browser langsung. */
export async function createTranscribeToken(
	user: AccessUser | null | undefined,
	raw: { model?: string; language?: string; delay?: string },
	deps: VoiceLabDeps = {},
): Promise<VoiceLabResult<TranscribeTokenDto>> {
	const input = parseTranscribeTokenInput(raw);
	if (!input.ok) return invalid(input.error);
	const prepared = await prepare(user, deps);
	if (!prepared.ok) return prepared;
	const { slot, safetyId } = prepared.value;
	const upstream = await postToOpenAi({
		slot,
		safetyId,
		path: "/realtime/client_secrets",
		timeoutMs: VOICE_UPSTREAM_TIMEOUT_MS,
		fetchImpl: deps.fetchImpl,
		body: {
			expires_after: {
				anchor: "created_at",
				seconds: VOICE_LAB_TOKEN_TTL_SECONDS,
			},
			session: transcriptionSession(input.value),
		},
	});
	if (!upstream.ok) return upstream;
	const json = (await upstream.response.json().catch(() => null)) as {
		value?: unknown;
		expires_at?: unknown;
	} | null;
	if (typeof json?.value !== "string" || json.value === "") return badShape();
	return {
		ok: true,
		value: {
			value: json.value,
			expiresAt: typeof json.expires_at === "number" ? json.expires_at : null,
			callsUrl: `${slot.baseUrl}/realtime/calls`,
			model: input.value.model,
		},
	};
}

/** Jalur alternatif transkripsi: SDP browser diteruskan server ke `/realtime/calls` memakai kunci slot (tanpa token sementara). */
export async function relayTranscribeCall(
	user: AccessUser | null | undefined,
	raw: { sdp: string; model?: string; language?: string; delay?: string },
	deps: VoiceLabDeps = {},
): Promise<VoiceLabResult<{ sdp: string }>> {
	const input = parseTranscribeTokenInput(raw);
	if (!input.ok) return invalid(input.error);
	const sdp = parseLiveSessionInput({ sdp: raw.sdp });
	if (!sdp.ok) return invalid(sdp.error);
	const prepared = await prepare(user, deps);
	if (!prepared.ok) return prepared;
	const form = new FormData();
	form.set("sdp", sdp.value.sdp);
	form.set("session", JSON.stringify(transcriptionSession(input.value)));
	const upstream = await postToOpenAi({
		slot: prepared.value.slot,
		safetyId: prepared.value.safetyId,
		path: "/realtime/calls",
		timeoutMs: VOICE_UPSTREAM_TIMEOUT_MS,
		fetchImpl: deps.fetchImpl,
		accept: "application/sdp",
		form,
	});
	if (!upstream.ok) return upstream;
	const answer = await upstream.response.text();
	return answer.startsWith("v=0")
		? { ok: true, value: { sdp: answer } }
		: badShape();
}

/** Sesi GPT-Live (V1-B) dengan delegasi klien: SDP browser diteruskan ke `/live/sessions`. */
export async function createLiveSession(
	user: AccessUser | null | undefined,
	raw: { sdp: string; model?: string; instructions?: string },
	deps: VoiceLabDeps = {},
): Promise<VoiceLabResult<{ sessionId: string; sdp: string }>> {
	const input: Validated<LiveSessionInput> = parseLiveSessionInput(raw);
	if (!input.ok) return invalid(input.error);
	const prepared = await prepare(user, deps);
	if (!prepared.ok) return prepared;
	return openLiveSession({
		slot: prepared.value.slot,
		safetyId: prepared.value.safetyId,
		sdp: input.value.sdp,
		model: input.value.model,
		instructions: input.value.instructions,
		fetchImpl: deps.fetchImpl,
	});
}

/** TTS: badan audio dari OpenAI diteruskan apa adanya (stream) ke browser. */
export async function openTtsStream(
	user: AccessUser | null | undefined,
	raw: { text: string; model?: string; voice?: string; instructions?: string },
	signal: AbortSignal | undefined,
	deps: VoiceLabDeps = {},
): Promise<VoiceLabResult<Response>> {
	const input: Validated<TtsInput> = parseTtsInput(raw);
	if (!input.ok) return invalid(input.error);
	const prepared = await prepare(user, deps);
	if (!prepared.ok) return prepared;
	const body: Record<string, unknown> = {
		model: input.value.model,
		voice: input.value.voice,
		input: input.value.text,
		response_format: "mp3",
	};
	if (input.value.instructions) body.instructions = input.value.instructions;
	const upstream = await postToOpenAi({
		slot: prepared.value.slot,
		safetyId: prepared.value.safetyId,
		path: "/audio/speech",
		timeoutMs: VOICE_LAB_TTS_TIMEOUT_MS,
		fetchImpl: deps.fetchImpl,
		accept: "audio/mpeg",
		signal,
		body,
	});
	if (!upstream.ok) return upstream;
	return upstream.response.body
		? { ok: true, value: upstream.response }
		: badShape();
}
