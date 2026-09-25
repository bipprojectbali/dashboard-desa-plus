import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * IP Whitelist API (src/api/ip-whitelist.ts): CRUD daftar IP yang diizinkan
 * mengakses akun user (fitur keamanan). Route lewat `.use(apiMiddleware)`
 * jadi tanpa sesi WAJIB 401 sebelum handler menyentuh
 * `prisma.ipWhitelistEntry.*` — aman dites tanpa DB nyata. Endpoint ini juga
 * yang dipakai untuk enforcement whitelist itu sendiri (lihat
 * apiMiddleware.tsx), jadi krusial route ini tidak bocor tanpa auth.
 */
describe("IP Whitelist API", () => {
	it("GET /api/ip-whitelist tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/ip-whitelist/"),
		);
		expect(res.status).toBe(401);
	});

	it("POST /api/ip-whitelist tanpa auth → 401 (tak bisa tambah IP anonim)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/ip-whitelist/", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ ip: "127.0.0.1", label: "Kantor" }),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("DELETE /api/ip-whitelist/:id tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/ip-whitelist/abc123", {
				method: "DELETE",
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route ip-whitelist tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/ip-whitelist/does-not-exist/sub"),
		);
		expect(res.status).toBe(404);
	});
});
