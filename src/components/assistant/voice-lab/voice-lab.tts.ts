import { fetchTtsAudio } from "./voice-lab.api";

/**
 * Pemutar TTS berantrean: tiap potongan teks diminta ke server segera (paralel),
 * tetapi diputar berurutan. `stop()` membuang semua (barge-in); `clearPending()`
 * hanya membuang yang belum diputar.
 */

export interface TtsPlayerOptions {
	params(): { model: string; voice: string };
	onFirstAudio(): void;
	onError(message: string): void;
	/** Semua potongan sudah selesai diputar setelah `end()` dipanggil. */
	onDrained(): void;
}

export interface TtsPlayer {
	/** Mulai giliran baru. */
	begin(): void;
	enqueue(text: string): void;
	/** Tandai tidak ada teks lagi. */
	end(): void;
	clearPending(): void;
	stop(): void;
}

export function createTtsPlayer(opts: TtsPlayerOptions): TtsPlayer {
	let queue: Array<Promise<Blob | null>> = [];
	let controller = new AbortController();
	let audio: HTMLAudioElement | null = null;
	let playing = false;
	let ended = false;
	let reportedFirst = false;
	let generation = 0;

	const fetchOne = async (
		text: string,
		signal: AbortSignal,
	): Promise<Blob | null> => {
		try {
			return await fetchTtsAudio({ text, ...opts.params() }, signal);
		} catch (err) {
			// Dibatalkan oleh stop()/barge-in: bukan galat bagi pengguna.
			if (!signal.aborted) opts.onError((err as Error).message);
			return null;
		}
	};

	const playBlob = (blob: Blob, gen: number): Promise<void> =>
		new Promise((resolve) => {
			const url = URL.createObjectURL(blob);
			const el = new Audio(url);
			audio = el;
			const done = () => {
				URL.revokeObjectURL(url);
				if (audio === el) audio = null;
				resolve();
			};
			el.onended = done;
			el.onerror = () => {
				if (gen === generation) opts.onError("Gagal memutar audio");
				done();
			};
			el.onplaying = () => {
				if (!reportedFirst && gen === generation) {
					reportedFirst = true;
					opts.onFirstAudio();
				}
			};
			el.play().catch((err: Error) => {
				if (gen === generation)
					opts.onError(`Audio diblokir browser: ${err.message}`);
				done();
			});
		});

	const loop = async () => {
		if (playing) return;
		playing = true;
		const gen = generation;
		while (queue.length > 0 && gen === generation) {
			const blob = await queue.shift();
			if (blob && gen === generation) await playBlob(blob, gen);
		}
		if (gen !== generation) return;
		playing = false;
		if (ended && queue.length === 0) opts.onDrained();
	};

	const stop = () => {
		generation++;
		controller.abort();
		controller = new AbortController();
		queue = [];
		playing = false;
		ended = false;
		if (audio) {
			audio.pause();
			audio = null;
		}
	};

	return {
		begin() {
			stop();
			reportedFirst = false;
		},
		enqueue(text) {
			if (!text.trim()) return;
			queue.push(fetchOne(text, controller.signal));
			void loop();
		},
		end() {
			ended = true;
			if (!playing && queue.length === 0) opts.onDrained();
			else void loop();
		},
		clearPending() {
			queue = [];
		},
		stop,
	};
}
