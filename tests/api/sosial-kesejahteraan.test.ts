import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Sosial Kesejahteraan API (src/api/sosial-kesejahteraan.ts): proxy list
 * program kesejahteraan masyarakat dari Desa API eksternal (server-side fetch
 * untuk menghindari CORS di browser).
 *
 * Source file ini TIDAK memanggil `.use(apiMiddleware)` sendiri — tapi sama
 * seperti search.ts, di `src/api/index.tsx` route ini dipasang SETELAH
 * `.use(apiMiddleware)` pada instance `api` yang sama, sehingga
 * `onBeforeHandle` middleware tetap berlaku end-to-end. Diverifikasi dengan
 * request nyata ke `@/api`: hasilnya 401 SEBELUM handler sempat memanggil
 * `fetch()` ke Desa API — jadi test ini tidak menyentuh network nyata sama
 * sekali (lebih aman daripada mock fetch/env, sesuai peringatan agar tidak
 * hit network asli tanpa mock).
 */
describe("Sosial Kesejahteraan API Proxy", () => {
	it("GET /api/sosial/kesejahteraan/find-many tanpa auth → 401 (ter-gate sebelum fetch ke Desa API)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/sosial/kesejahteraan/find-many"),
		);
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body).toEqual({ message: "Unauthorized" });
	});

	it("route sosial/kesejahteraan tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/sosial/kesejahteraan/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});
