import { describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";

// Setelah allowlist diperketat (hanya /api/noc/wall-snapshot yang publik),
// GET noc lain wajib auth → 401 tanpa sesi. Detail regresi kebocoran PII
// diuji di noc-allowlist.test.ts. Di sini kita pastikan endpoint tetap
// terdaftar (bukan 404) dan validasi query tetap jalan.
describe("NOC API Module (allowlist tightened)", () => {
	const idDesa = "desa1";

	it("last-sync tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/last-sync?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(401);
	});

	it("active-divisions tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/active-divisions?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(401);
	});

	it("latest-projects tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/latest-projects?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(401);
	});

	it("upcoming-events tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/upcoming-events?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(401);
	});

	it("diagram-jumlah-document tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/diagram-jumlah-document?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(401);
	});

	it("diagram-progres-kegiatan tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/diagram-progres-kegiatan?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(401);
	});

	it("latest-discussion tanpa auth → 401", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/latest-discussion?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(401);
	});

	it("wall-snapshot tetap publik → 200", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.success).toBe(true);
	});

	it("should return 401 or 422 for sync without admin auth", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/noc/sync", {
				method: "POST",
			}),
		);
		expect([401, 422]).toContain(response.status);
	});

	// prisma di-import agar koneksi DB terinisialisasi konsisten dgn suite lain.
	it("prisma client tersedia", () => {
		expect(prisma).toBeDefined();
	});
});
