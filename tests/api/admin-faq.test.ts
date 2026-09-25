import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Admin FAQ API (src/api/admin-faq.ts): CRUD FAQ untuk halaman admin, semua
 * endpoint admin-only (`user?.role !== "admin"` → 401 dari dalam handler ATAU
 * dari apiMiddleware). Tanpa sesi sama sekali, request ditolak lebih awal oleh
 * `.use(apiMiddleware)` (onBeforeHandle) sebelum handler sempat cek role atau
 * menyentuh Prisma — jadi test ini deterministik tanpa DB nyata.
 */
describe("Admin FAQ API", () => {
	it("GET /api/admin/faq tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/"),
		);
		expect(res.status).toBe(401);
	});

	it("POST /api/admin/faq tanpa auth → 401 (tak bisa buat FAQ anonim)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					question: "Apa itu desa?",
					answer: "Desa adalah...",
					category: "umum",
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/admin/faq/:id tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/abc123", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					question: "q",
					answer: "a",
					category: "c",
					isPublished: true,
				}),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("PATCH /api/admin/faq/:id/toggle tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/abc123/toggle", {
				method: "PATCH",
			}),
		);
		expect(res.status).toBe(401);
	});

	it("DELETE /api/admin/faq/:id tanpa auth → 401 (tak bisa hapus FAQ anonim)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/abc123", {
				method: "DELETE",
			}),
		);
		expect(res.status).toBe(401);
	});

	it("PUT /api/admin/faq/reorder tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/reorder", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ items: [] }),
			}),
		);
		expect(res.status).toBe(401);
	});

	it("route admin/faq tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/admin/faq/does-not-exist/sub"),
		);
		expect(res.status).toBe(404);
	});
});
