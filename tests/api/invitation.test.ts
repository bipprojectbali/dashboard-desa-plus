import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Invitation API (src/api/invitation.ts): generate & kelola link undangan
 * signup. Seluruh prefix `/invitation` dipasang lewat `.use(apiMiddleware)`
 * (termasuk endpoint `/:token/validate` dan `/:token/accept` yang secara
 * bisnis semestinya bisa diakses calon user baru sebelum login) — tanpa sesi
 * SEMUA endpoint di bawah prefix ini ditolak 401 oleh middleware sebelum
 * handler sempat query Prisma. Ini murni auth-guard test, bukan uji alur
 * penerimaan undangan yang sesungguhnya (butuh token+DB nyata).
 */
describe("Invitation API", () => {
	it("POST /api/invitation tanpa auth → 401 (bukan admin, tak bisa generate)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/invitation/", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/invitation/list tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/invitation/list"),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/invitation/:token/validate tanpa auth → 401 (di-gate oleh apiMiddleware prefix)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/invitation/some-token/validate"),
		);
		expect(res.status).toBe(401);
	});

	it("POST /api/invitation/:token/accept tanpa auth → 401 (di-gate oleh apiMiddleware prefix)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/invitation/some-token/accept", {
				method: "POST",
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route invitation tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/invitation/foo/bar/baz"),
		);
		expect(res.status).toBe(404);
	});
});
