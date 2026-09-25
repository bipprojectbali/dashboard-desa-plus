import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Keamanan Preferences API (src/api/keamanan-preferences.ts): GET/PUT
 * preferensi keamanan user (2FA, biometrik login, IP whitelist toggle, log
 * aktivitas). Route lewat `.use(apiMiddleware)` jadi tanpa sesi WAJIB 401
 * sebelum handler menyentuh `prisma.keamananPreference.upsert` — aman dites
 * tanpa DB nyata. Preferensi ini juga yang dibaca middleware untuk enforce IP
 * whitelist, jadi penting endpoint-nya tidak bocor tanpa auth.
 */
describe("Keamanan Preferences API", () => {
	it("GET /api/keamanan-preferences tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/keamanan-preferences/"),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/keamanan-preferences tanpa auth → 401 (body valid tetap ditolak)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/keamanan-preferences/", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					twoFactorAuth: true,
					biometrikLogin: false,
					ipWhitelist: true,
					logAktivitas: true,
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route keamanan-preferences tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/keamanan-preferences/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
