import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * My Permissions API (src/api/my-permissions.ts): mengembalikan daftar
 * feature key yang diizinkan untuk role user saat ini. Handler-nya sendiri
 * punya fallback graceful `if (!user) return { allowed: [] }` — TAPI file ini
 * memanggil `.use(apiMiddleware)` secara eksplisit (beda dari search.ts/
 * sosial-kesejahteraan.ts), sehingga request tanpa sesi/API-key ditolak 401
 * oleh `onBeforeHandle` middleware SEBELUM sampai ke handler tsb. Fallback
 * `{allowed:[]}` di source hanya ter-exercise untuk user yang berhasil auth
 * tapi tanpa RolePermission — bukan untuk request anonim. Diverifikasi
 * langsung lewat Read source + percobaan request nyata.
 */
describe("My Permissions API", () => {
	it("GET /api/my-permissions tanpa auth → 401 (apiMiddleware reject duluan)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/my-permissions/"),
		);
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body).toEqual({ message: "Unauthorized" });
	});

	it("route my-permissions tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/my-permissions/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
