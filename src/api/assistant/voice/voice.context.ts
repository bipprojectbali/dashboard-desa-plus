import type { VoiceErrorCode } from "@/types/ai-assistant-voice";
import {
	type AssistantSettingsValues,
	getAssistantSettings,
} from "../config/settings.repo";
import { startOfDayWita } from "../limits/usage";
import { VOICE_SESSION_MESSAGES } from "./voice.constants";
import {
	billableSeconds,
	dailyVoiceLimitSeconds,
	remainingTodaySeconds,
	type VoiceSessionRow,
} from "./voice.quota";
import type { VoiceSessionRepo } from "./voice.session.repo";
import * as defaultRepo from "./voice.session.repo";
import type { VoiceSlotDeps } from "./voice.slot";
import type { FetchLike } from "./voice.upstream";

/** Bagian bersama service suara: hasil, dependensi yang bisa diganti test, sisa menit, kepemilikan sesi. */

export type VoiceResult<T> =
	| { ok: true; value: T }
	| {
			ok: false;
			status: number;
			error: string;
			code?: VoiceErrorCode;
			retryAfterSec?: number;
	  };

export interface VoiceServiceDeps {
	loadSettings?: () => Promise<AssistantSettingsValues>;
	repo?: VoiceSessionRepo;
	slot?: VoiceSlotDeps;
	fetchImpl?: FetchLike;
	now?: () => Date;
}

export type Ctx = {
	repo: VoiceSessionRepo;
	settings: AssistantSettingsValues;
	now: Date;
};

export const fail = (
	status: number,
	error: string,
	code?: VoiceErrorCode,
	retryAfterSec?: number,
): VoiceResult<never> => ({ ok: false, status, error, code, retryAfterSec });

export async function context(deps: VoiceServiceDeps): Promise<Ctx> {
	return {
		repo: deps.repo ?? defaultRepo,
		settings: await (deps.loadSettings ?? getAssistantSettings)(),
		now: deps.now?.() ?? new Date(),
	};
}

/** Sisa detik suara hari ini (WITA), termasuk sesi yang sedang berjalan; null = tanpa batas. */
export async function remainingToday(
	ctx: Ctx,
	userId: string,
	current?: VoiceSessionRow,
): Promise<number | null> {
	const limit = dailyVoiceLimitSeconds(ctx.settings, userId);
	if (limit === null) return null;
	const used = await ctx.repo.sumBilledSince(userId, startOfDayWita(ctx.now));
	const live = current ? billableSeconds(current, ctx.now, ctx.settings) : 0;
	return remainingTodaySeconds(limit, used + live);
}

/** Sesi milik user ini (404 bila tidak ada/milik orang lain — tidak membocorkan keberadaan). */
export async function ownedSession(
	ctx: Ctx,
	userId: string,
	sessionId: string,
): Promise<VoiceSessionRow | null> {
	const row = await ctx.repo.findSession(sessionId);
	return row && row.userId === userId ? row : null;
}

export const notFound = () =>
	fail(404, VOICE_SESSION_MESSAGES.notFound, "voice_session_not_found");
