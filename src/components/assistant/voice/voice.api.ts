import type {
	VoiceClientEndReason,
	VoiceCloseResponse,
	VoiceErrorBody,
	VoiceErrorCode,
	VoiceExtendResponse,
	VoiceHeartbeatResponse,
	VoiceSessionStartResponse,
} from "@/types/ai-assistant-voice";

/** Klien `/api/assistant/voice/*` (sesi browser). SDP lewat server; kunci OpenAI tidak pernah ke klien. */

const BASE = "/api/assistant/voice";

/** Request suara gagal; `status` null = jaringan putus. */
export class VoiceApiError extends Error {
	constructor(
		readonly status: number | null,
		readonly code: VoiceErrorCode | null,
		message: string,
		readonly retryAfterSec?: number,
	) {
		super(message);
		this.name = "VoiceApiError";
	}
}

async function post<T>(
	path: string,
	body: unknown,
	init: RequestInit = {},
): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${BASE}${path}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			...init,
		});
	} catch (err) {
		throw new VoiceApiError(
			null,
			null,
			`Network error on voice${path}: ${(err as Error).message}`,
		);
	}
	const data = (await res.json().catch(() => null)) as
		| (T & Partial<VoiceErrorBody>)
		| null;
	if (!res.ok) {
		const retry = Number(res.headers.get("retry-after"));
		throw new VoiceApiError(
			res.status,
			data?.code ?? null,
			data?.error ?? `Voice request ${path} failed (${res.status})`,
			Number.isFinite(retry) && retry > 0 ? retry : undefined,
		);
	}
	if (data === null)
		throw new VoiceApiError(null, null, `Invalid JSON from voice${path}`);
	return data;
}

export function acceptVoiceConsent(): Promise<{ accepted: boolean }> {
	return post("/consent", { accepted: true });
}

export function startVoiceSession(
	sdp: string,
): Promise<VoiceSessionStartResponse> {
	return post("/sessions", { sdp });
}

export function heartbeatVoiceSession(
	id: string,
): Promise<VoiceHeartbeatResponse> {
	return post(`/sessions/${encodeURIComponent(id)}/heartbeat`, {});
}

export function extendVoiceSession(id: string): Promise<VoiceExtendResponse> {
	return post(`/sessions/${encodeURIComponent(id)}/extend`, {});
}

/** `keepalive` agar penutupan tetap terkirim saat tab ditutup (`pagehide`). */
export function closeVoiceSession(
	id: string,
	reason: VoiceClientEndReason,
): Promise<VoiceCloseResponse> {
	return post(
		`/sessions/${encodeURIComponent(id)}/close`,
		{ reason },
		{ keepalive: true },
	);
}
