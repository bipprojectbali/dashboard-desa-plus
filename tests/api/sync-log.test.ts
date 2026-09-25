import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Sync Log API (src/api/sync-log.ts): riwayat sinkronisasi (NOC/dsb) untuk
 * halaman admin, admin-only (`user?.role !== "admin"` → 401 dari dalam
 * handler). Route lewat `.use(apiMiddleware)` jadi tanpa sesi WAJIB 401 lebih
 * dulu dari middleware sebelum handler sempat cek role atau menyentuh
 * `prisma.syncLog` — aman dites tanpa DB nyata.
 */
describe("Sync Log API", () => {
	it("GET /api/admin/sync/logs tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/sync/logs"),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/admin/sync/logs?type=noc tanpa auth → tetap 401 (query tidak melewati auth)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/sync/logs?type=noc&limit=10"),
		);
		expect(res.status).toBe(401);
	});

	it("route admin/sync tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/sync/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
