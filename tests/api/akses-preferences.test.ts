import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Akses Preferences API (src/api/akses-preferences.ts): GET/PUT preferensi
 * akses (izin export data, approval perubahan) milik user. Route lewat
 * `.use(apiMiddleware)` jadi tanpa sesi WAJIB 401 sebelum handler menyentuh
 * `prisma.aksesPreference.upsert` — aman dites tanpa DB nyata.
 */
describe("Akses Preferences API", () => {
	it("GET /api/akses-preferences tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/akses-preferences/"),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/akses-preferences tanpa auth → 401 (body valid tetap ditolak)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/akses-preferences/", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					izinExportData: true,
					requireApprovalPerubahan: false,
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route akses-preferences tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/akses-preferences/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
