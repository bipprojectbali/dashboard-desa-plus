import Elysia, { t } from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import { VOICE_CLIENT_END_REASONS } from "@/types/ai-assistant-voice";
import logger from "@/utils/logger";
import { ACCESS_MESSAGES, authorizeVoiceUser } from "../http/access";
import { VOICE_SDP_MAX_CHARS } from "../voice/voice.constants";
import type { VoiceResult, VoiceServiceDeps } from "../voice/voice.context";
import {
	closeVoiceSession,
	extendVoiceSession,
	heartbeatVoiceSession,
} from "../voice/voice.lifecycle";
import { acceptVoiceConsent, startVoiceSession } from "../voice/voice.service";

/**
 * `/api/assistant/voice/*` — mode suara panel Jenna. Setiap request: sesi
 * browser + izin `use-ai-assistant` + `use-ai-voice` (role dari DB). Kunci
 * OpenAI hanya dari slot Suara, tidak pernah dikirim ke browser; audio dan
 * isi transkrip tidak disimpan maupun dicatat.
 */

export interface VoiceApiDeps extends VoiceServiceDeps {
	authorize?: typeof authorizeVoiceUser;
}

const sessionParams = t.Object({ id: t.String({ maxLength: 64 }) });
const startBody = t.Object({
	sdp: t.String({ maxLength: VOICE_SDP_MAX_CHARS * 2 }),
});
const consentBody = t.Object({ accepted: t.Literal(true) });
const closeBody = t.Object({
	reason: t.Union(VOICE_CLIENT_END_REASONS.map((r) => t.Literal(r))),
});

export function createVoiceApi(deps: VoiceApiDeps = {}) {
	const authorize = deps.authorize ?? authorizeVoiceUser;
	const reply = <T>(
		set: { status?: number | string; headers: Record<string, string | number> },
		result: VoiceResult<T>,
	) => {
		if (result.ok) return result.value;
		set.status = result.status;
		if (result.retryAfterSec)
			set.headers["retry-after"] = String(result.retryAfterSec);
		const { ok: _ok, status: _status, ...body } = result;
		return body;
	};

	return new Elysia({ prefix: "/assistant/voice" })
		.use(apiMiddleware)
		.onError(({ error, code, set, request }) => {
			if (code === "VALIDATION" || code === "NOT_FOUND") return;
			logger.error(
				{
					err: error,
					method: request.method,
					path: new URL(request.url).pathname,
				},
				"[VOICE] Request failed",
			);
			set.status = 500;
			return { error: "Terjadi kesalahan server" };
		})
		.resolve(async ({ user }) => ({ access: await authorize(user) }))
		.onBeforeHandle(({ access, set }) => {
			if ("denied" in access) {
				set.status = access.denied.status;
				const { error } = access.denied;
				return error === ACCESS_MESSAGES.noVoicePermission
					? { error, code: "voice_forbidden" }
					: { error };
			}
		})
		.post(
			"/consent",
			async ({ access, set }) =>
				"principal" in access
					? reply(set, await acceptVoiceConsent(access.principal, deps))
					: undefined,
			{
				body: consentBody,
				detail: { summary: "Accept the microphone consent" },
			},
		)
		.post(
			"/sessions",
			async ({ access, body, set }) =>
				"principal" in access
					? reply(set, await startVoiceSession(access.principal, body, deps))
					: undefined,
			{
				body: startBody,
				detail: { summary: "Start a voice session (SDP relay)" },
			},
		)
		.post(
			"/sessions/:id/heartbeat",
			async ({ access, params, set }) =>
				"principal" in access
					? reply(
							set,
							await heartbeatVoiceSession(access.principal, params.id, deps),
						)
					: undefined,
			{ params: sessionParams, detail: { summary: "Voice session heartbeat" } },
		)
		.post(
			"/sessions/:id/extend",
			async ({ access, params, set }) =>
				"principal" in access
					? reply(
							set,
							await extendVoiceSession(access.principal, params.id, deps),
						)
					: undefined,
			{
				params: sessionParams,
				detail: { summary: "Extend the voice session limit" },
			},
		)
		.post(
			"/sessions/:id/close",
			async ({ access, params, body, set }) =>
				"principal" in access
					? reply(
							set,
							await closeVoiceSession(
								access.principal,
								params.id,
								body.reason,
								deps,
							),
						)
					: undefined,
			{
				params: sessionParams,
				body: closeBody,
				detail: { summary: "Close the voice session and bill real minutes" },
			},
		);
}

export const assistantVoiceApi = createVoiceApi();
