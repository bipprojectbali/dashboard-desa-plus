/** Panjang minimum kunci sebelum awal & akhirnya boleh ditampilkan. */
const HINT_MIN_LENGTH = 12;
const HINT_EDGE = 4;

/**
 * Petunjuk API key untuk halaman admin, mis. `sk-c****dc07`. Kunci pendek
 * hanya ditampilkan sebagai `****` agar sebagian besar isinya tidak terbuka.
 */
export function maskApiKey(apiKey: string): string {
	const key = apiKey.trim();
	if (key.length < HINT_MIN_LENGTH) return "****";
	return `${key.slice(0, HINT_EDGE)}****${key.slice(-HINT_EDGE)}`;
}
