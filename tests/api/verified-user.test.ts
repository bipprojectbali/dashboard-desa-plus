import { describe, expect, it } from "bun:test";
import api from "@/api";
import {
	isUnverifiedAllowed,
	isVerified,
	UNVERIFIED_MESSAGE,
} from "@/middleware/verified-user";

/**
 * Keputusan verifikasi admin di apiMiddleware (P-1). Fungsi murni — dites
 * tanpa server/DB. Alur nyata dengan sesi & API key ada di tests/db/.
 */
describe("isVerified", () => {
	it("hanya emailVerified === true yang lolos", () => {
		expect(isVerified({ emailVerified: true })).toBe(true);
	});

	it("false, null, dan undefined ditolak", () => {
		expect(isVerified({ emailVerified: false })).toBe(false);
		expect(isVerified({ emailVerified: null })).toBe(false);
		expect(isVerified({})).toBe(false);
		expect(isVerified(null)).toBe(false);
		expect(isVerified(undefined)).toBe(false);
	});
});

describe("isUnverifiedAllowed", () => {
	it("/api/profile/update boleh (dengan/tanpa trailing slash)", () => {
		expect(isUnverifiedAllowed("/api/profile/update")).toBe(true);
		expect(isUnverifiedAllowed("/api/profile/update/")).toBe(true);
	});

	it("path data lain ditolak", () => {
		expect(isUnverifiedAllowed("/api/keuangan")).toBe(false);
		expect(isUnverifiedAllowed("/api/my-permissions/")).toBe(false);
		expect(isUnverifiedAllowed("/api/profile/update-role")).toBe(false);
		expect(isUnverifiedAllowed("/api/profile")).toBe(false);
		expect(isUnverifiedAllowed("/")).toBe(false);
	});

	it("pesan 403 sesuai keputusan", () => {
		expect(UNVERIFIED_MESSAGE).toBe("Akun menunggu verifikasi admin");
	});
});

describe("apiMiddleware tanpa sesi (perilaku lama tetap)", () => {
	it("GET /api/keuangan/apbdes-detail tanpa auth → 401, bukan 403", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/keuangan/apbdes-detail"),
		);
		expect(res.status).toBe(401);
	});

	// Skema 401 route profile `{ error }` tidak cocok dengan body middleware
	// `{ message }`, jadi Elysia bisa membalas 422 — keduanya tetap menolak.
	it("POST /api/profile/update tanpa auth ditolak walau path dikecualikan", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/profile/update", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name: "x" }),
			}),
		);
		expect([401, 422]).toContain(res.status);
	});
});
