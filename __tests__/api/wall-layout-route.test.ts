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
		const body = (await res.json()) as { data: { order: string[] } };
		expect(Array.isArray(body.data.order)).toBe(true);
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
