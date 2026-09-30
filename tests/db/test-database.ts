/**
 * Pengaman test DB: gagal sebelum query apa pun bila proses tidak diarahkan ke
 * TEST_DATABASE_URL (mis. `bun test tests/db` dijalankan langsung, bukan lewat
 * `bun run test:db`), supaya test tidak pernah menulis ke DB dev.
 */
export function assertTestDatabase(): void {
	const testUrl = process.env.TEST_DATABASE_URL?.trim();
	if (!testUrl || process.env.DATABASE_URL?.trim() !== testUrl) {
		throw new Error(
			"Test DB harus dijalankan lewat `bun run test:db` (DATABASE_URL = TEST_DATABASE_URL).",
		);
	}
}
