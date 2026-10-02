/** Pemancar level mikrofon agar meter UI memperbarui diri tanpa merender ulang seluruh halaman. */

export type LevelListener = (rms: number) => void;

export interface LevelBus {
	emit(rms: number): void;
	subscribe(listener: LevelListener): () => void;
}

export function createLevelBus(): LevelBus {
	const listeners = new Set<LevelListener>();
	return {
		emit(rms) {
			for (const l of listeners) l(rms);
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
}
