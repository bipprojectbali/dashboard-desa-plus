import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Notification Preferences API (src/api/notification-preferences.ts):
 * GET/PUT preferensi notifikasi user (laporan harian, alert sistem, dst).
 * Route lewat `.use(apiMiddleware)` jadi tanpa sesi WAJIB 401 sebelum handler
 * menyentuh `prisma.notificationPreference.upsert` — aman dites tanpa DB
 * nyata.
 */
describe("Notification Preferences API", () => {
	it("GET /api/notification-preferences tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/notification-preferences/"),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/notification-preferences tanpa auth → 401 (body valid tetap ditolak)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/notification-preferences/", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					laporanHarian: true,
					alertSistem: true,
					updateKeamanan: true,
					newsletterBulan: false,
					alertKritis: true,
					aktivitasTim: false,
					komentarMention: true,
					bunyiNotifikasi: true,
					tresholdMemori: false,
					tresholdCpu: false,
					tresholdDisk: false,
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route notification-preferences tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request(
				"http://localhost/api/notification-preferences/does-not-exist",
			),
		);
		expect(res.status).toBe(404);
	});
});
