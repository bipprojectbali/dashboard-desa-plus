import {
	invalidField as bad,
	parseLiveInstructions,
	parseOfferSdp,
	type Validated,
} from "../voice/voice.live";
import {
	VOICE_LAB_DEFAULTS,
	VOICE_LAB_LIMITS,
	VOICE_LAB_PATTERNS,
	VOICE_LAB_SUGGESTIONS,
} from "./voice-lab.constants";

export type { Validated };

function pick(
	raw: string | undefined,
	fallback: string,
	pattern: RegExp,
): string | null {
	const value = (raw ?? "").trim() || fallback;
	return pattern.test(value) ? value : null;
}

export interface TranscribeTokenInput {
	model: string;
	language: string;
	delay: string;
}

export function parseTranscribeTokenInput(raw: {
	model?: string;
	language?: string;
	delay?: string;
}): Validated<TranscribeTokenInput> {
	const model = pick(
		raw.model,
		VOICE_LAB_DEFAULTS.transcribeModel,
		VOICE_LAB_PATTERNS.model,
	);
	if (!model) return bad("model");
	const language = pick(
		raw.language,
		VOICE_LAB_DEFAULTS.transcribeLanguage,
		VOICE_LAB_PATTERNS.language,
	);
	if (!language) return bad("language");
	const delay = (raw.delay ?? "").trim() || VOICE_LAB_DEFAULTS.transcribeDelay;
	if (
		!(VOICE_LAB_SUGGESTIONS.transcribeDelays as readonly string[]).includes(
			delay,
		)
	)
		return bad("delay");
	return { ok: true, value: { model, language, delay } };
}

export interface TtsInput {
	text: string;
	model: string;
	voice: string;
	instructions: string | null;
}

export function parseTtsInput(raw: {
	text: string;
	model?: string;
	voice?: string;
	instructions?: string;
}): Validated<TtsInput> {
	const text = raw.text.trim();
	if (text === "" || text.length > VOICE_LAB_LIMITS.ttsTextMax)
		return bad("text");
	const model = pick(
		raw.model,
		VOICE_LAB_DEFAULTS.ttsModel,
		VOICE_LAB_PATTERNS.model,
	);
	if (!model) return bad("model");
	const voice = pick(
		raw.voice,
		VOICE_LAB_DEFAULTS.ttsVoice,
		VOICE_LAB_PATTERNS.voice,
	);
	if (!voice) return bad("voice");
	const instructions = (raw.instructions ?? "").trim();
	if (instructions.length > VOICE_LAB_LIMITS.instructionsMax)
		return bad("instructions");
	return {
		ok: true,
		value: { text, model, voice, instructions: instructions || null },
	};
}

export interface LiveSessionInput {
	sdp: string;
	model: string;
	instructions: string | null;
}

export function parseLiveSessionInput(raw: {
	sdp: string;
	model?: string;
	instructions?: string;
}): Validated<LiveSessionInput> {
	const sdp = parseOfferSdp(raw.sdp);
	if (!sdp.ok) return sdp;
	const model = pick(
		raw.model,
		VOICE_LAB_DEFAULTS.liveModel,
		VOICE_LAB_PATTERNS.model,
	);
	if (!model) return bad("model");
	const instructions = parseLiveInstructions(raw.instructions);
	if (!instructions.ok) return instructions;
	return {
		ok: true,
		value: { sdp: sdp.value, model, instructions: instructions.value },
	};
}
