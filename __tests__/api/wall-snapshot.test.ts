import { afterEach, describe, expect, it } from "bun:test";
import api from "@/api";

const ORIGINAL_TOKEN = process.env.WALL_ACCESS_TOKEN;

afterEach(() => {
	if (ORIGINAL_TOKEN === undefined) delete process.env.WALL_ACCESS_TOKEN;
	else process.env.WALL_ACCESS_TOKEN = ORIGINAL_TOKEN;
});

// WHITELIST kunci per slice — tolak key tak dikenal. Blacklist (cek nik/nama)
// bisa lolos untuk occupationTop/nama divisi; whitelist menutup celah itu.
const ALLOWED_KEYS: Record<string, string[]> = {
	kpi: [
		"residents",
		"umkm",
		"complaints",
		"activities",
		"securityReports",
		"documents",
	],
	keuangan: ["apbdes", "satisfaction", "sdgs"],
	pengaduan: ["stats", "trend7m", "serviceByType", "kepuasan"],
	demografi: ["stats", "gender", "religion", "ageGroups", "occupationTop"],
	divisi: ["activities", "documents"],
	keamanan: ["total", "baru", "diproses", "selesai"],
};

describe("GET /api/noc/wall-snapshot", () => {
	it("terbuka tanpa auth → 200 success (bukti bukan 401)", async () => {
		delete process.env.WALL_ACCESS_TOKEN;
		const res = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.success).toBe(true);
		expect(body.data).toBeTruthy();
	});

	it("kpi punya 6 key & system punya field health", async () => {
		delete process.env.WALL_ACCESS_TOKEN;
		const res = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		const { data } = await res.json();

		if (data.kpi !== null) {
			expect(Object.keys(data.kpi).sort()).toEqual(
				[...ALLOWED_KEYS.kpi].sort(),
			);
		}
		if (data.system !== null) {
			expect(data.system).toHaveProperty("cpuPct");
			expect(data.system).toHaveProperty("memPct");
			expect(data.system).toHaveProperty("db");
		}
	});

	it("PII whitelist — tiap slice hanya boleh punya key yang diizinkan", async () => {
		delete process.env.WALL_ACCESS_TOKEN;
		const res = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		const { data } = await res.json();

		for (const [slice, allowed] of Object.entries(ALLOWED_KEYS)) {
			const value = data[slice];
			if (value === null || value === undefined) continue;
			for (const key of Object.keys(value)) {
				expect(allowed).toContain(key);
			}
		}
	});

	it("token di-set + tanpa key → 403; key benar → 200", async () => {
		process.env.WALL_ACCESS_TOKEN = "rahasia-wall";

		const denied = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		expect(denied.status).toBe(403);

		const allowed = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot?key=rahasia-wall"),
		);
		expect(allowed.status).toBe(200);
	});
});
