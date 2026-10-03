import {
	VOICE_EXTEND_SECONDS,
	type VoiceClientEndReason,
	type VoiceExtendResponse,
	type VoiceHeartbeatResponse,
} from "@/types/ai-assistant-voice";
import type { AssistantPrincipal } from "../http/access";
import { VOICE_SESSION_MESSAGES } from "./voice.constants";
import {
	context,
	fail,
	notFound,
	ownedSession,
	remainingToday,
	type VoiceResult,
	type VoiceServiceDeps,
} from "./voice.context";
import {
	billableSeconds,
	elapsedSeconds,
	isOpenSession,
	isStaleSession,
	sessionMaxSeconds,
	settleStaleSession,
} from "./voice.quota";
import * as defaultRepo from "./voice.session.repo";

/** Siklus sesi suara yang sudah berjalan: heartbeat, perpanjang, tutup — menit dari waktu server. */

/** `POST /voice/sessions/:id/heartbeat` — sisa menit atau perintah berhenti. */
export async function heartbeatVoiceSession(
	principal: AssistantPrincipal,
	sessionId: string,
	deps: VoiceServiceDeps = {},
): Promise<VoiceResult<VoiceHeartbeatResponse>> {
	const ctx = await context(deps);
	const userId = principal.user.id;
	const row = await ownedSession(ctx, userId, sessionId);
	if (!row) return notFound();
	const maxSeconds = sessionMaxSeconds(ctx.settings, row.extendedSeconds);
	const ended = (elapsed: number): VoiceResult<VoiceHeartbeatResponse> => ({
		ok: true,
		value: {
			elapsedSeconds: elapsed,
			maxSeconds,
			remainingTodaySeconds: null,
			stop: "ended",
		},
	});
	if (!isOpenSession(row)) return ended(row.billedSeconds);
	if (isStaleSession(row, ctx.now)) {
		const settled = settleStaleSession(row, ctx.settings);
		await ctx.repo.closeSession(row.id, settled);
		return ended(settled.billedSeconds);
	}
	if (!ctx.settings.enabled) {
		const billed = billableSeconds(row, ctx.now, ctx.settings);
		await ctx.repo.closeSession(row.id, {
			endedAt: ctx.now,
			billedSeconds: billed,
			endReason: "disabled",
		});
		return ended(billed);
	}

	const elapsed = elapsedSeconds(row, ctx.now);
	const remaining = await remainingToday(ctx, userId, row);
	const stop =
		remaining !== null && remaining <= 0
			? "quota"
			: elapsed >= maxSeconds
				? "max_duration"
				: null;
	if (stop)
		await ctx.repo.closeSession(row.id, {
			endedAt: ctx.now,
			billedSeconds: billableSeconds(row, ctx.now, ctx.settings),
			endReason: stop,
		});
	else await ctx.repo.touchHeartbeat(row.id, ctx.now);
	return {
		ok: true,
		value: {
			elapsedSeconds: elapsed,
			maxSeconds,
			remainingTodaySeconds: remaining,
			stop,
		},
	};
}

/** `POST /voice/sessions/:id/extend` — tambah batas sesi (kuota harian tetap berlaku). */
export async function extendVoiceSession(
	principal: AssistantPrincipal,
	sessionId: string,
	deps: VoiceServiceDeps = {},
): Promise<VoiceResult<VoiceExtendResponse>> {
	const ctx = await context(deps);
	const row = await ownedSession(ctx, principal.user.id, sessionId);
	if (!row) return notFound();
	if (!isOpenSession(row) || isStaleSession(row, ctx.now))
		return fail(409, VOICE_SESSION_MESSAGES.ended, "voice_session_ended");
	await ctx.repo.addExtension(row.id, VOICE_EXTEND_SECONDS);
	return {
		ok: true,
		value: {
			maxSeconds: sessionMaxSeconds(
				ctx.settings,
				row.extendedSeconds + VOICE_EXTEND_SECONDS,
			),
		},
	};
}

/** `POST /voice/sessions/:id/close` — tutup & tagih waktu nyata (idempoten). */
export async function closeVoiceSession(
	principal: AssistantPrincipal,
	sessionId: string,
	reason: VoiceClientEndReason,
	deps: VoiceServiceDeps = {},
): Promise<VoiceResult<{ billedSeconds: number }>> {
	const ctx = await context(deps);
	const row = await ownedSession(ctx, principal.user.id, sessionId);
	if (!row) return notFound();
	if (!isOpenSession(row))
		return { ok: true, value: { billedSeconds: row.billedSeconds } };
	const close = isStaleSession(row, ctx.now)
		? settleStaleSession(row, ctx.settings)
		: {
				endedAt: ctx.now,
				billedSeconds: billableSeconds(row, ctx.now, ctx.settings),
				endReason: reason,
			};
	await ctx.repo.closeSession(row.id, close);
	return { ok: true, value: { billedSeconds: close.billedSeconds } };
}

/** Sesi suara milik user masih aktif (dipakai `/chat/stream` modality voice). */
export async function isVoiceSessionLive(
	userId: string,
	sessionId: string,
	deps: Pick<VoiceServiceDeps, "repo" | "now"> = {},
): Promise<boolean> {
	const row = await (deps.repo ?? defaultRepo).findSession(sessionId);
	const now = deps.now?.() ?? new Date();
	return (
		row !== null &&
		row.userId === userId &&
		isOpenSession(row) &&
		!isStaleSession(row, now)
	);
}
