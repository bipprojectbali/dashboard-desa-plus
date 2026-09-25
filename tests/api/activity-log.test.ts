import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Activity Log API (src/api/activity-log.ts): riwayat aksi user (GET list,
 * POST catat aksi, GET export PDF). Semua route lewat `.use(apiMiddleware)`
 * jadi tanpa sesi/API-key WAJIB 401 sebelum handler sempat menyentuh Prisma —
 * ini membuat test auth-guard aman dijalankan tanpa koneksi DB nyata.
 */
describe("Activity Log API", () => {
	it("GET /api/activity-log tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/activity-log/"),
		);
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body).toEqual({ message: "Unauthorized" });
	});

	it("POST /api/activity-log tanpa auth → 401 (tidak menulis log diam-diam)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/activity-log/", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ action: "test-action" }),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/activity-log/export tanpa auth → 401 (PDF tak bisa diunduh anonim)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/activity-log/export"),
		);
		expect(res.status).toBe(401);
	});

	it("route activity-log tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/activity-log/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
