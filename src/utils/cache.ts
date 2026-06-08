interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

class InMemoryCache {
	private store = new Map<string, CacheEntry<unknown>>();

	set<T>(key: string, value: T, ttlMs: number): void {
		this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
	}

	get<T>(key: string): T | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return undefined;
		}
		return entry.value as T;
	}

	delete(key: string): void {
		this.store.delete(key);
	}

	deleteByPrefix(prefix: string): number {
		let count = 0;
		for (const key of this.store.keys()) {
			if (key.startsWith(prefix)) {
				this.store.delete(key);
				count++;
			}
		}
		return count;
	}

	flush(): number {
		const size = this.store.size;
		this.store.clear();
		return size;
	}

	stats() {
		const now = Date.now();
		const entries = [...this.store.entries()].map(([key, entry]) => ({
			key,
			ttlRemaining: Math.max(0, entry.expiresAt - now),
			expiresAt: new Date(entry.expiresAt).toISOString(),
		}));
		return { size: this.store.size, entries };
	}
}

export const cache = new InMemoryCache();

export const TTL = {
	DEMOGRAFI: 6 * 60 * 60 * 1000,
	APBDES: 60 * 60 * 1000,
	UMKM: 60 * 60 * 1000,
	KEAMANAN: 30 * 60 * 1000,
	SOSIAL: 30 * 60 * 1000,
	BUMDES: 60 * 60 * 1000,
} as const;

export async function withCache<T>(
	key: string,
	ttlMs: number,
	fn: () => Promise<T>,
): Promise<T> {
	if (process.env.CACHE_ENABLED === "false") return fn();
	const hit = cache.get<T>(key);
	if (hit !== undefined) return hit;
	const result = await fn();
	if (result != null) {
		cache.set(key, result, ttlMs);
	}
	return result;
}
