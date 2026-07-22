import { afterEach, describe, expect, it } from "bun:test";
import api from "@/api";

const ORIGINAL_TOKEN = process.env.WALL_ACCESS_TOKEN;

afterEach(() => {
	if (ORIGINAL_TOKEN === undefined) delete process.env.WALL_ACCESS_TOKEN;
	else process.env.WALL_ACCESS_TOKEN = ORIGINAL_TOKEN;
});

// WHITELIST kunci per slice — tolak key tak dikenal. Blacklist (cek nik/nama)
// bisa lolos untuk occupationTop/nama divisi; whitelist menutup celah itu.
const KPI_KEYS = [
	"residents",
	"umkm",
	"complaints",
	"activities",
	"securityReports",
	"documents",
] as const;

const ALLOWED_KEYS: Record<string, string[]> = {
	kpi: [...KPI_KEYS],
	keuangan: ["apbdes", "satisfaction", "sdgs"],
	pengaduan: ["stats", "trend7m", "serviceByType", "pengajuanTerbaru", "musrenbang"],
	demografi: ["stats", "gender", "religion", "ageGroups", "occupationTop"],
	divisi: ["activities", "documents", "projects", "discussions"],
	keamanan: ["total", "baru", "diproses", "selesai"],
	// beranda: teks operasional publik (name, title, location) disertakan sengaja
	// (setara website desa). Field PII-orang dilarang — dijaga oleh test nested di bawah.
	beranda: [
		"kpi",
		"suratTrend",
		"kepuasan",
		"divisi",
		"kalender",
		"apbdes",
		"sdgs",
	],
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
			expect(Object.keys(data.kpi).sort()).toEqual([...KPI_KEYS].sort());
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

	it("beranda nested — hanya field teks operasional publik, bukan PII-orang", async () => {
		delete process.env.WALL_ACCESS_TOKEN;
		const res = await api.handle(
			new Request("http://localhost/api/noc/wall-snapshot"),
		);
		const { data } = await res.json();
		const beranda = data.beranda;
		if (beranda === null || beranda === undefined) return; // builder gagal = skip

		// divisi[] hanya boleh punya field operasional; nik/email/telepon dilarang
		const DIVISI_ALLOWED = ["id", "name", "activityCount", "color"];
		const DIVISI_PII_BANNED = [
			"nik",
			"email",
			"phone",
			"telepon",
			"nama_lengkap",
		];
		for (const item of beranda.divisi ?? []) {
			for (const key of Object.keys(item)) {
				expect(DIVISI_ALLOWED).toContain(key);
				expect(DIVISI_PII_BANNED).not.toContain(key);
			}
		}

		// kalender[] hanya boleh punya field operasional publik
		const KALENDER_ALLOWED = ["id", "title", "startDate", "time", "divisi"];
		const KALENDER_PII_BANNED = [
			"nik",
			"email",
			"phone",
			"createdBy",
			"userId",
		];
		for (const item of beranda.kalender ?? []) {
			for (const key of Object.keys(item)) {
				expect(KALENDER_ALLOWED).toContain(key);
				expect(KALENDER_PII_BANNED).not.toContain(key);
			}
		}
	});
});
