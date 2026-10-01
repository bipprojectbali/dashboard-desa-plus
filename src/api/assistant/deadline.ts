/**
 * Batas waktu berbasis AbortController + setTimeout. Sengaja tidak memakai
 * AbortSignal.any/timeout supaya perilakunya sama di Bun dan di lingkungan
 * test (happy-dom mengganti AbortSignal global).
 */

/** Error alasan abort karena batas waktu habis. */
export class DeadlineExceededError extends Error {
	constructor(readonly timeoutMs: number) {
		super(`Deadline exceeded after ${timeoutMs}ms`);
		this.name = "DeadlineExceededError";
	}
}

export interface Deadline {
	signal: AbortSignal;
	/** Hentikan timer & lepas listener parent. Wajib dipanggil (finally). */
	dispose(): void;
}

/** Signal yang abort setelah `timeoutMs`, atau lebih cepat bila `parent` abort. */
export function createDeadline(
	timeoutMs: number,
	parent?: AbortSignal,
): Deadline {
	const controller = new AbortController();
	const timer = setTimeout(
		() => controller.abort(new DeadlineExceededError(timeoutMs)),
		timeoutMs,
	);
	const onParentAbort = () => controller.abort(parent?.reason);

	if (parent?.aborted) onParentAbort();
	else parent?.addEventListener("abort", onParentAbort, { once: true });

	return {
		signal: controller.signal,
		dispose() {
			clearTimeout(timer);
			parent?.removeEventListener("abort", onParentAbort);
		},
	};
}

/** Tolak dengan `signal.reason` begitu signal abort; selesai normal bila `promise` lebih dulu. */
export function raceWithSignal<T>(
	promise: Promise<T>,
	signal: AbortSignal,
): Promise<T> {
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise<T>((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then(
			(value) => {
				signal.removeEventListener("abort", onAbort);
				resolve(value);
			},
			(err: unknown) => {
				signal.removeEventListener("abort", onAbort);
				reject(err);
			},
		);
	});
}
