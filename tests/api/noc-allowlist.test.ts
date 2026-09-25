import { describe, expect, it } from "bun:test";
import api from "@/api";

// Regresi kebocoran PII: allowlist diperketat jadi HANYA /api/noc/wall-snapshot.
// GET noc lain (latest-discussion → senderName+message, dst) kembali wajib auth.
describe("NOC allowlist tightening (PII regression)", () => {
	it("GET /api/noc/latest-discussion tanpa auth → 401 (kebocoran tertutup)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/latest-discussion?idDesa=desa1"),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/noc/active-divisions tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/active-divisions?idDesa=desa1"),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/noc/latest-projects tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/latest-projects?idDesa=desa1"),
		);
		expect(res.status).toBe(401);
	});

	it("GET /api/noc/wall-snapshot tanpa auth → 200 (wall tetap publik)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		expect(res.status).toBe(200);
	});
});
