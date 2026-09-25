import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Umum Preferences API (src/api/umum-preferences.ts): GET/PUT preferensi
 * umum (bahasa, zona waktu, format tanggal, refresh otomatis, dsb). Non-admin
 * user mewarisi preferensi dari admin (global default), tapi itu logika
 * DALAM handler — route tetap lewat `.use(apiMiddleware)` jadi tanpa sesi
 * WAJIB 401 sebelum handler menyentuh Prisma sama sekali. Aman dites tanpa
 * DB nyata.
 */
describe("Umum Preferences API", () => {
	it("GET /api/umum-preferences tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/umum-preferences/"),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/umum-preferences tanpa auth → 401 (body valid tetap ditolak)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/umum-preferences/", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					bahasa: "id",
					zonaWaktu: "Asia/Makassar",
					formatTanggal: "DD/MM/YYYY",
					refreshOtomatis: true,
					intervalRefresh: "1",
					tampilkanGrid: true,
					animasiTransisi: true,
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route umum-preferences tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/umum-preferences/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
