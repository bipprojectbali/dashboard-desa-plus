import Elysia, { t } from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import logger from "@/utils/logger";
import { VOICE_LAB_LIMITS } from "../voice-lab/voice-lab.constants";
import {
	createLiveSession,
	createTranscribeToken,
	getVoiceLabConfig,
	openTtsStream,
	relayTranscribeCall,
	type VoiceLabDeps,
	type VoiceLabResult,
} from "../voice-lab/voice-lab.service";

/**
 * `/api/admin/ai-assistant/voice-lab/*` — halaman uji suara S0 (sekali pakai,
 * admin saja). Guard admin dijalankan di service (satu kali per request);
 * tanpa sesi → 401 dari apiMiddleware. Kunci OpenAI hanya dari slot Suara dan
 * tidak pernah ada di respons; isi transkrip/teks/audio tidak dicatat.
 */

const shortName = t.Optional(t.String({ maxLength: 64 }));
const instructions = t.Optional(
	t.String({ maxLength: VOICE_LAB_LIMITS.instructionsMax * 2 }),
);
const sdp = t.String({ maxLength: VOICE_LAB_LIMITS.sdpMax * 2 });

const tokenBody = t.Object({
	model: shortName,
	language: shortName,
	delay: shortName,
});
const callBody = t.Object({
	sdp,
	model: shortName,
	language: shortName,
	delay: shortName,
});
const liveBody = t.Object({ sdp, model: shortName, instructions });
const ttsBody = t.Object({
	text: t.String({ maxLength: VOICE_LAB_LIMITS.ttsTextMax * 2 }),
	model: shortName,
	voice: shortName,
	instructions,
});

export function createVoiceLabApi(deps: VoiceLabDeps = {}) {
	const reply = <T>(
		set: { status?: number | string },
		result: VoiceLabResult<T>,
	) => {
		if (result.ok) return result.value;
		set.status = result.status;
		return {
			error: result.error,
			...(result.code ? { code: result.code } : {}),
		};
	};

	return new Elysia({ prefix: "/admin/ai-assistant/voice-lab" })
		.use(apiMiddleware)
		.onError(({ error, code, set, request }) => {
			if (code === "VALIDATION" || code === "NOT_FOUND") return;
			logger.error(
				{
					err: error,
					method: request.method,
					path: new URL(request.url).pathname,
				},
				"[VOICE_LAB] Request failed",
			);
			set.status = 500;
			return { error: "Terjadi kesalahan server" };
		})
		.get(
			"/config",
			async ({ user, set }) => reply(set, await getVoiceLabConfig(user, deps)),
			{
				detail: { summary: "Voice lab defaults + voice slot status (admin)" },
			},
		)
		.post(
			"/transcribe-token",
			async ({ user, body, set }) =>
				reply(set, await createTranscribeToken(user, body, deps)),
			{
				body: tokenBody,
				detail: { summary: "Ephemeral token for a transcription session" },
			},
		)
		.post(
			"/transcribe-call",
			async ({ user, body, set }) =>
				reply(set, await relayTranscribeCall(user, body, deps)),
			{
				body: callBody,
				detail: { summary: "Relay SDP for a transcription session via server" },
			},
		)
		.post(
			"/live-session",
			async ({ user, body, set }) =>
				reply(set, await createLiveSession(user, body, deps)),
			{
				body: liveBody,
				detail: { summary: "Create a GPT-Live session (client delegation)" },
			},
		)
		.post(
			"/tts",
			async ({ user, body, set, request }) => {
				const result = await openTtsStream(user, body, request.signal, deps);
				if (!result.ok) return reply(set, result);
				return new Response(result.value.body, {
					headers: {
						"Content-Type": "audio/mpeg",
						"Cache-Control": "no-store",
					},
				});
			},
			{
				body: ttsBody,
				detail: { summary: "Text-to-speech, audio streamed (mp3)" },
			},
		);
}

export const assistantVoiceLabApi = createVoiceLabApi();
