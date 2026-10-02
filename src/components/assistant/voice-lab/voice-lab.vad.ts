import { VAD_DEFAULTS } from "./voice-lab.constants";

/** Pendeteksi ujung ucapan berbasis energi (RMS) — implementasi sendiri, tanpa package. */

export interface VadConfig {
	threshold: number;
	silenceMs: number;
	minSpeechMs: number;
}

export type VadEvent =
	| { type: "speech-start"; at: number }
	/** `at` = saat suara terakhir terdengar; `detectedAt` = saat hening cukup lama terdeteksi. */
	| { type: "speech-end"; at: number; detectedAt: number };

export interface Vad {
	/** Masukkan satu sampel energi; mengembalikan event bila ada transisi. */
	push(rms: number, nowMs: number): VadEvent | null;
	reset(): void;
	isSpeaking(): boolean;
}

/** RMS sampel audio (rentang -1..1) → 0..1. */
export function computeRms(samples: ArrayLike<number>): number {
	if (samples.length === 0) return 0;
	let sum = 0;
	for (let i = 0; i < samples.length; i++) {
		const v = samples[i] as number;
		sum += v * v;
	}
	return Math.sqrt(sum / samples.length);
}

/** `getConfig` dibaca tiap sampel supaya ambang & durasi hening bisa diubah live dari UI. */
export function createVad(
	getConfig: () => VadConfig = () => VAD_DEFAULTS,
): Vad {
	let speaking = false;
	let pendingStart: number | null = null;
	let lastLoud = 0;

	return {
		push(rms, nowMs) {
			const cfg = getConfig();
			if (rms >= cfg.threshold) {
				lastLoud = nowMs;
				if (speaking) return null;
				pendingStart ??= nowMs;
				if (nowMs - pendingStart < cfg.minSpeechMs) return null;
				speaking = true;
				return { type: "speech-start", at: pendingStart };
			}
			if (!speaking) {
				pendingStart = null;
				return null;
			}
			if (nowMs - lastLoud < cfg.silenceMs) return null;
			speaking = false;
			pendingStart = null;
			return { type: "speech-end", at: lastLoud, detectedAt: nowMs };
		},
		reset() {
			speaking = false;
			pendingStart = null;
			lastLoud = 0;
		},
		isSpeaking: () => speaking,
	};
}
