import { buildLiveSessionInstruction } from "@/config/assistant-identity";
import type { VoiceSessionStartResponse } from "@/types/ai-assistant-voice";
import type { AssistantPrincipal } from "../http/access";
import { secondsUntilResetWita } from "../limits/usage";
import { VOICE_SESSION_MESSAGES } from "./voice.constants";
import {
	type Ctx,
	context,
	fail,
	remainingToday,
	type VoiceResult,
	type VoiceServiceDeps,
} from "./voice.context";
import { openLiveSession, parseOfferSdp } from "./voice.live";
import {
	isStaleSession,
	sessionMaxSeconds,
	settleStaleSession,
	type VoiceSessionRow,
} from "./voice.quota";
import * as defaultRepo from "./voice.session.repo";
import { hashSafetyIdentifier, resolveVoiceSlot } from "./voice.slot";

/**
 * Mulai sesi suara panel Jenna: persetujuan mikrofon → izin, slot, kunci
 * satu-sesi, kuota menit → relay SDP ke GPT-Live. Start yang gagal tidak
 * ditagih. Heartbeat/perpanjang/tutup ada di `voice.lifecycle.ts`.
 */

/** Lepas sesi basi user (tab ditutup/jaringan putus); kembalikan sesi yang masih hidup. */
async function releaseStale(
	ctx: Ctx,
	userId: string,
): Promise<VoiceSessionRow[]> {
	const open = await ctx.repo.findOpenSessions(userId);
	const live: VoiceSessionRow[] = [];
	for (const row of open) {
		if (isStaleSession(row, ctx.now))
			await ctx.repo.closeSession(
				row.id,
				settleStaleSession(row, ctx.settings),
			);
		else live.push(row);
	}
	return live;
}

/** `POST /voice/consent` — simpan persetujuan mikrofon (sekali per user). */
export async function acceptVoiceConsent(
	principal: AssistantPrincipal,
	deps: VoiceServiceDeps = {},
): Promise<VoiceResult<{ accepted: true }>> {
	await (deps.repo ?? defaultRepo).acceptConsent(principal.user.id);
	return { ok: true, value: { accepted: true } };
}

/** `POST /voice/sessions` — buka sesi GPT-Live lewat relay SDP server. */
export async function startVoiceSession(
	principal: AssistantPrincipal,
	body: { sdp: string },
	deps: VoiceServiceDeps = {},
): Promise<VoiceResult<VoiceSessionStartResponse>> {
	const ctx = await context(deps);
	const userId = principal.user.id;
	if (!ctx.settings.enabled)
		return fail(409, VOICE_SESSION_MESSAGES.disabled, "voice_disabled");
	if (!(await ctx.repo.hasConsent(userId)))
		return fail(
			403,
			VOICE_SESSION_MESSAGES.consentRequired,
			"voice_consent_required",
		);
	const sdp = parseOfferSdp(body.sdp);
	if (!sdp.ok) return fail(422, sdp.error, "invalid_input");
	const slot = await resolveVoiceSlot(deps.slot);
	if (!slot.ok) return fail(slot.status, slot.error, slot.code);

	if ((await releaseStale(ctx, userId)).length > 0)
		return fail(
			409,
			VOICE_SESSION_MESSAGES.sessionActive,
			"voice_session_active",
		);
	const remaining = await remainingToday(ctx, userId);
	if (remaining !== null && remaining <= 0)
		return fail(
			429,
			VOICE_SESSION_MESSAGES.quotaExhausted,
			"voice_quota_exhausted",
			secondsUntilResetWita(ctx.now),
		);

	const row = await ctx.repo.createSession(userId, ctx.now);
	// Dua tab menekan "On" bersamaan: keduanya lolos cek di atas, jadi setelah
	// insert yang tertua menang dan sisanya dibatalkan (tanpa tagihan).
	const [winner] = await ctx.repo.findOpenSessions(userId);
	if (winner && winner.id !== row.id) {
		await ctx.repo.closeSession(row.id, {
			endedAt: ctx.now,
			billedSeconds: 0,
			endReason: "duplicate",
			status: "failed",
		});
		return fail(
			409,
			VOICE_SESSION_MESSAGES.sessionActive,
			"voice_session_active",
		);
	}

	const live = await openLiveSession({
		slot: slot.slot,
		safetyId: hashSafetyIdentifier(userId),
		sdp: sdp.value,
		model: ctx.settings.voiceLiveModel,
		instructions: buildLiveSessionInstruction(
			ctx.settings.assistantName,
			ctx.settings.voiceReadExactInstruction,
		),
		voice: ctx.settings.voiceName,
		fetchImpl: deps.fetchImpl,
	});
	if (!live.ok) {
		await ctx.repo.closeSession(row.id, {
			endedAt: ctx.now,
			billedSeconds: 0,
			endReason: "start_failed",
			status: "failed",
		});
		return fail(
			live.status,
			live.error,
			live.status === 422 ? "invalid_input" : "upstream_failed",
		);
	}
	const startedAt = deps.now?.() ?? new Date();
	await ctx.repo.activateSession(row.id, startedAt);
	return {
		ok: true,
		value: {
			sessionId: row.id,
			sdp: live.value.sdp,
			maxSeconds: sessionMaxSeconds(ctx.settings, 0),
			idleOffSeconds: ctx.settings.voiceIdleOffSeconds,
			remainingTodaySeconds: remaining,
		},
	};
}
