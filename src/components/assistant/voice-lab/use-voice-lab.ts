import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVoiceLabConfig } from "./use-voice-lab-config";
import { describeError } from "./voice-lab.claude";
import type { VoiceLabPath } from "./voice-lab.constants";
import { VAD_DEFAULTS } from "./voice-lab.constants";
import { createLevelMeter, openMic, stopStream } from "./voice-lab.devices";
import { buildExport, type VoiceLabExport } from "./voice-lab.export";
import { createLevelBus } from "./voice-lab.level-bus";
import {
	evaluateSession,
	remainingMs,
	type SessionClock,
	startSession,
	touchSession,
} from "./voice-lab.session";
import type { TurnMetrics } from "./voice-lab.stats";
import type {
	ControllerEvents,
	TurnView,
	VoiceController,
	VoiceStatus,
} from "./voice-lab.types";
import { createV1bController } from "./voice-lab.v1b";
import { createV2Controller } from "./voice-lab.v2";
import { createVad } from "./voice-lab.vad";

/** Alasan sesi dimatikan otomatis (null = dimatikan pengguna). */
export type AutoOffReason = "idle" | "cap" | null;

const MAX_LOG_LINES = 60;
const TICK_MS = 1000;

/** Hook utama halaman uji: satu sesi (V2 atau V1-B) + pengukuran. */
export function useVoiceLab() {
	const cfg = useVoiceLabConfig();
	const [path, setPath] = useState<VoiceLabPath>("v2");
	const [status, setStatus] = useState<VoiceStatus>("off");
	const [turns, setTurns] = useState<TurnView[]>([]);
	const [metrics, setMetrics] = useState<TurnMetrics[]>([]);
	const [logs, setLogs] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [autoOff, setAutoOff] = useState<AutoOffReason>(null);
	const [remaining, setRemaining] = useState(0);
	const levelBus = useMemo(createLevelBus, []);

	const session = useRef<{
		mic: MediaStream | null;
		controller: VoiceController | null;
		stopMeter: (() => void) | null;
		timer: ReturnType<typeof setInterval> | null;
		clock: SessionClock | null;
		turnSeq: number;
		startedAt: number;
	}>({
		mic: null,
		controller: null,
		stopMeter: null,
		timer: null,
		clock: null,
		turnSeq: 0,
		startedAt: 0,
	});
	const { settingsRef } = cfg;

	const log = useCallback((line: string) => {
		const at = ((performance.now() - session.current.startedAt) / 1000).toFixed(
			1,
		);
		setLogs((prev) => [
			...prev.slice(-(MAX_LOG_LINES - 1)),
			`[${at}s] ${line}`,
		]);
	}, []);

	const teardown = useCallback(() => {
		const s = session.current;
		s.controller?.stop();
		s.stopMeter?.();
		if (s.timer) clearInterval(s.timer);
		stopStream(s.mic);
		session.current = {
			...s,
			mic: null,
			controller: null,
			stopMeter: null,
			timer: null,
			clock: null,
		};
	}, []);

	const stop = useCallback(
		(reason: AutoOffReason = null) => {
			teardown();
			setStatus("off");
			setRemaining(0);
			if (reason) setAutoOff(reason);
		},
		[teardown],
	);

	const makeEvents = useCallback(
		(): ControllerEvents => ({
			status: setStatus,
			turn: (view) =>
				setTurns((prev) => {
					const i = prev.findIndex(
						(t) => t.id === view.id && t.path === view.path,
					);
					if (i === -1) return [...prev, view];
					const next = [...prev];
					next[i] = view;
					return next;
				}),
			metrics: (m) => setMetrics((prev) => [...prev, m]),
			activity: () => {
				const s = session.current;
				if (s.clock) s.clock = touchSession(s.clock, performance.now());
			},
			log,
			error: (message) => {
				setError(message);
				log(`galat: ${message}`);
			},
			nextTurnId: () => ++session.current.turnSeq,
		}),
		[log],
	);

	const start = useCallback(async () => {
		if (session.current.controller) return;
		setError(null);
		setAutoOff(null);
		setStatus("connecting");
		session.current.startedAt = performance.now();
		try {
			const mic = await openMic(settingsRef.current);
			session.current.mic = mic;
			const create = path === "v2" ? createV2Controller : createV1bController;
			const controller = await create({
				mic,
				getSettings: () => settingsRef.current,
				events: makeEvents(),
			});
			session.current.controller = controller;
			const vad = createVad(() => ({
				threshold: settingsRef.current.threshold,
				silenceMs: settingsRef.current.silenceMs,
				minSpeechMs: VAD_DEFAULTS.minSpeechMs,
			}));
			const meter = createLevelMeter(mic, (rms, now) => {
				levelBus.emit(rms);
				const event = vad.push(rms, now);
				if (event) controller.onVad(event);
			});
			session.current.stopMeter = meter.stop;
			const now = performance.now();
			session.current.clock = startSession(now);
			setRemaining(remainingMs(session.current.clock, now));
			session.current.timer = setInterval(() => {
				const clock = session.current.clock;
				if (!clock) return;
				const t = performance.now();
				setRemaining(remainingMs(clock, t));
				const verdict = evaluateSession(clock, t);
				if (verdict !== "ok") stop(verdict);
			}, TICK_MS);
			await controller.start();
		} catch (err) {
			setError(describeError(err));
			stop();
		}
	}, [path, levelBus, makeEvents, settingsRef, stop]);

	useEffect(() => () => teardown(), [teardown]);

	const commit = useCallback(() => session.current.controller?.commit(), []);

	const clearMetrics = useCallback(() => {
		setMetrics([]);
		setTurns([]);
	}, []);

	const exportData = useCallback(
		(includeText: boolean): VoiceLabExport => {
			const s = settingsRef.current;
			const texts = new Map(
				turns.map((t) => [
					t.id,
					{ userText: t.userText, answerText: t.answerText },
				]),
			);
			return buildExport(metrics, {
				generatedAt: new Date(),
				browser: navigator.userAgent,
				includeText,
				texts,
				settings: {
					transcribeModel: s.transcribeModel,
					transcribeMode: s.transcribeMode,
					transcribeDelay: s.transcribeDelay,
					ttsModel: s.ttsModel,
					ttsVoice: s.ttsVoice,
					liveModel: s.liveModel,
					endMethod: s.endMethod,
					threshold: s.threshold,
					silenceMs: s.silenceMs,
					echoCancellation: s.echoCancellation,
					noiseSuppression: s.noiseSuppression,
				},
			});
		},
		[metrics, turns, settingsRef],
	);

	return {
		...cfg,
		path,
		setPath,
		status,
		turns,
		metrics,
		logs,
		error,
		autoOff,
		remaining,
		levelBus,
		start,
		stop,
		commit,
		clearMetrics,
		exportData,
		running: status !== "off",
	};
}
