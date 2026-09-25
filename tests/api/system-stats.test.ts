import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * System Stats API (src/api/system-stats.ts): health-check agregat (DB, Desa
 * API, NOC API) via `computeSystemStats()`, dipakai dashboard admin. Route
 * lewat `.use(apiMiddleware)` jadi tanpa sesi WAJIB 401 sebelum handler
 * sempat memanggil `computeSystemStats()` (yang menyentuh DB & external API
 * nyata) — aman dites tanpa koneksi apa pun.
 */
describe("System Stats API", () => {
	it("GET /api/system/stats tanpa auth → 401 (tidak sempat panggil computeSystemStats)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/system/stats"),
		);
		expect(res.status).toBe(401);
	});

	it("route system tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/system/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
