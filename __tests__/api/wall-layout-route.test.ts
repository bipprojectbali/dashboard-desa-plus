import { describe, expect, it } from "bun:test";
import api from "@/api";

// Asimetri auth wall-layout: baca publik (TV kiosk), tulis admin-only.
// Mirror pola noc-allowlist.test.ts.
describe("wall-layout route auth", () => {
	it("GET /api/wall-layout tanpa auth → 200 (baca publik)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/wall-layout"),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			data: { order: string[]; sizes: unknown };
		};
		expect(Array.isArray(body.data.order)).toBe(true);
		// sizes selalu ada di payload (objek override atau null).
		expect("sizes" in body.data).toBe(true);
	});

	it("PUT dengan sizes di luar batas → 401/422 (tak pernah tersimpan diam-diam)", async () => {
		// Tanpa auth tetap 401 (write admin-only) — memastikan sizes cacat tak
		// menyelinap lewat jalur publik. Validasi bentuk diuji di wall-sizes.test.
		const res = await api.handle(
			new Request("http://localhost/api/wall-layout", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					order: ["ops-panel"],
					sizes: { "ops-panel": { w: 99, h: 99 } },
				}),
			}),
		);
		expect([401, 422]).toContain(res.status);
	});

	it("PUT /api/wall-layout tanpa auth → 401 (tulis admin-only)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/wall-layout", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ order: ["ops-panel"] }),
			}),
		);
		expect(res.status).toBe(401);
	});
});
