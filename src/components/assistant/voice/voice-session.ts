import type { AssistantText } from "@/locales/assistant";
import type { AssistantVoiceText } from "@/locales/assistant-voice";
import { resetVoice, voiceStore } from "@/store/assistant-voice";
import {
	VOICE_HEARTBEAT_INTERVAL_MS,
	type VoiceClientEndReason,
} from "@/types/ai-assistant-voice";
import {
	closeVoiceSession,
	extendVoiceSession,
	heartbeatVoiceSession,
	VoiceApiError,
} from "./voice.api";
import {
	isIdleTimeout,
	projectBeat,
	remainingSeconds,
	stopCloseReason,
	voiceErrorMessage,
	voiceStopMessage,
} from "./voice.logic";
import {
	createVoiceController,
	type VoiceController,
	type VoiceControllerEvents,
} from "./voice-controller";

/**
 * Siklus hidup satu sesi suara panel (level modul, satu per tab): start,
 * heartbeat menit nyata ke server, hitung mundur lokal, mati otomatis saat
 * hening, perpanjang, tutup. Server tetap sumber kebenaran batas & kuota.
 */

export interface VoiceSessionContext {
	t: AssistantVoiceText;
	text: AssistantText;
	ask: VoiceControllerEvents["ask"];
}

const TICK_MS = 1000;

let context: VoiceSessionContext | null = null;
let controller: VoiceController | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let idleOffSeconds = 0;
let lastActivity = 0;
let beatInFlight = false;
/** Naik tiap sesi berakhir: event dari sesi lama (mis. dimatikan saat menghubungkan) diabaikan. */
let generation = 0;

/** Teks & jalur tanya terbaru dari panel (bahasa/rute bisa berubah selama sesi). */
export function bindVoiceContext(ctx: VoiceSessionContext) {
	context = ctx;
}

const touch = () => {
	lastActivity = Date.now();
};

function clearTimers() {
	if (heartbeatTimer) clearInterval(heartbeatTimer);
	if (tickTimer) clearInterval(tickTimer);
	heartbeatTimer = null;
	tickTimer = null;
	window.removeEventListener("pagehide", onPageHide);
}

/** Akhiri sesi; `reason` null = server sudah menutupnya (tidak perlu dikabari). */
export function endVoice(
	reason: VoiceClientEndReason | null,
	notice: string | null,
) {
	if (voiceStore.status === "off") return;
	generation += 1;
	const id = voiceStore.sessionId;
	controller?.stop();
	controller = null;
	clearTimers();
	resetVoice(notice);
	if (id && reason) closeQuietly(id, reason);
}

function closeQuietly(id: string, reason: VoiceClientEndReason) {
	closeVoiceSession(id, reason).catch((err: unknown) => {
		// Tidak fatal: server menganggap sesi selesai setelah heartbeat basi.
		console.warn("Voice session close failed:", (err as Error).message);
	});
}

function onPageHide() {
	endVoice("page_hidden", null);
}

async function heartbeat() {
	const id = voiceStore.sessionId;
	if (!id || beatInFlight || !context) return;
	beatInFlight = true;
	const { t, text } = context;
	try {
		const beat = await heartbeatVoiceSession(id);
		if (voiceStore.sessionId !== id) return;
		voiceStore.beat = beat;
		voiceStore.beatAt = Date.now();
		if (beat.stop)
			endVoice(stopCloseReason(beat.stop), voiceStopMessage(beat.stop, t));
	} catch (err) {
		// Jaringan putus sesaat: coba lagi di detak berikutnya; bila berlanjut, server menutup sesi basi.
		if (err instanceof VoiceApiError && err.status === null) return;
		if (voiceStore.sessionId === id)
			endVoice(null, voiceErrorMessage(err, t, text));
	} finally {
		beatInFlight = false;
	}
}

function tick() {
	const now = Date.now();
	voiceStore.now = now;
	const { beat, beatAt, status } = voiceStore;
	if (isIdleTimeout(status, lastActivity, now, idleOffSeconds)) {
		endVoice("idle", context ? voiceStopMessage("idle", context.t) : null);
		return;
	}
	// Waktu habis menurut hitungan lokal: minta keputusan server sekarang.
	if (beat && remainingSeconds(projectBeat(beat, (now - beatAt) / 1000)) <= 0)
		void heartbeat();
}

/** Nyalakan mode suara (setelah persetujuan mikrofon). Galat ditampilkan sebagai `notice`. */
export async function startVoice() {
	if (voiceStore.status !== "off" || !context) return;
	const ctx = context;
	const gen = generation;
	const live = () => gen === generation;
	let serverSessionId: string | null = null;
	resetVoice(null);
	voiceStore.status = "connecting";
	voiceStore.now = Date.now();
	let created: VoiceController;
	try {
		created = await createVoiceController({
			emptyCommentary: ctx.t.commentary.empty,
			failureCommentary: ctx.t.commentary.failed,
			events: {
				status(s) {
					if (!live()) return;
					voiceStore.status = s;
					touch();
				},
				session(start) {
					serverSessionId = start.sessionId;
					if (!live()) return;
					voiceStore.sessionId = start.sessionId;
					voiceStore.beat = {
						elapsedSeconds: 0,
						maxSeconds: start.maxSeconds,
						remainingTodaySeconds: start.remainingTodaySeconds,
					};
					voiceStore.beatAt = Date.now();
					idleOffSeconds = start.idleOffSeconds;
				},
				transcript(text) {
					if (live()) voiceStore.transcript = text;
				},
				activity: touch,
				lost() {
					if (live())
						endVoice("error", (context ?? ctx).t.errors.connectionLost);
				},
				ask: (question, handlers, signal) =>
					(context ?? ctx).ask(question, handlers, signal),
			},
		});
	} catch (err) {
		// Sesi server sudah dibuat tapi WebRTC gagal: tutup agar kunci & menit tidak tertahan.
		if (serverSessionId) closeQuietly(serverSessionId, "error");
		if (live()) resetVoice(voiceErrorMessage(err, ctx.t, ctx.text));
		return;
	}
	if (!live()) {
		// Dimatikan user selagi menghubungkan.
		created.stop();
		if (serverSessionId) closeQuietly(serverSessionId, "user");
		return;
	}
	controller = created;
	touch();
	heartbeatTimer = setInterval(
		() => void heartbeat(),
		VOICE_HEARTBEAT_INTERVAL_MS,
	);
	tickTimer = setInterval(tick, TICK_MS);
	window.addEventListener("pagehide", onPageHide);
}

/** Tombol Off. */
export function stopVoice() {
	endVoice("user", null);
}

/** Perpanjang sesi 1 menit (ajakan sebelum batas sesi habis). */
export async function extendVoice() {
	const id = voiceStore.sessionId;
	if (!id || !context) return;
	const { t, text } = context;
	try {
		const res = await extendVoiceSession(id);
		if (voiceStore.sessionId === id && voiceStore.beat)
			voiceStore.beat.maxSeconds = res.maxSeconds;
	} catch (err) {
		voiceStore.notice = voiceErrorMessage(err, t, text);
	}
}

export function setVoiceAnswerMuted(muted: boolean) {
	voiceStore.answerMuted = muted;
	controller?.setAnswerMuted(muted);
}

export function setVoiceMicMuted(muted: boolean) {
	voiceStore.micMuted = muted;
	controller?.setMicMuted(muted);
}
