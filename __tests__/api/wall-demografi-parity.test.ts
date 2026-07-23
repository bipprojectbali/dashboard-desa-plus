/**
 * Parity guard demografi: memastikan wall builder (build-demografi) menghasilkan
 * nilai yang identik dengan yang dibaca route dashboard (/api/demografi/*) —
 * keduanya bersumber dari Desa API live lewat shared loaders di dashboard-cache.
 *
 * mock.module WAJIB sebelum import modul yang memakainya (Bun evaluasi mock dulu).
 * afterAll(mock.restore) WAJIB — mock.module global, bisa bocor antar file.
 */
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

// ── Fixtures: bentuk asli Desa API stg ─────────────────────────────────────────

const SUMMARY_FIXTURE = {
	summary: { totalPenduduk: 4200, totalKK: 1176, totalKemiskinan: 240 },
	dinamika: { kelahiran: 1, kematian: 1, pindahMasuk: 0, pindahKeluar: 0 },
};

const RELIGION_FIXTURE = [
	{ agama: "HINDU", jumlah: 3850 },
	{ agama: "LAINNYA", jumlah: 290 },
	{ agama: "ISLAM", jumlah: 285 },
];

const AGE_FIXTURE = [
	{ rentangUmur: "0-14", jumlah: 820 },
	{ rentangUmur: "15-24", jumlah: 650 },
];

const BANJAR_FIXTURE = [
	{ nama: "Banjar Adat Kangin", penduduk: 520, kk: 145, miskin: 30 },
	{ nama: "Banjar Adat Kauh", penduduk: 450, kk: 120, miskin: 25 },
];

const OCCUPATION_FIXTURE = [
	{ pekerjaan: "Petani/Pekebun", lakiLaki: 100, perempuan: 50 },
	{ pekerjaan: "Wiraswasta", lakiLaki: 120, perempuan: 80 },
];

const BIRTHS_FIXTURE = [{}, {}, {}, {}, {}]; // 5
const DEATHS_FIXTURE = [{}, {}, {}, {}]; // 4
const MIGRATION_FIXTURE = [
	{ jenis: "MASUK" },
	{ jenis: "MASUK" },
	{ jenis: "MASUK" },
	{ jenis: "KELUAR" },
	{ jenis: "KELUAR" },
	{ jenis: "KELUAR" },
];
const SECTORS_FIXTURE = [
	{ name: "Pertanian", value: 90 },
	{ name: "Peternakan", value: 30 },
];

const BY_PATH: Record<string, unknown> = {
	"/api/kependudukan/dashboard/summary": SUMMARY_FIXTURE,
	"/api/kependudukan/distribusiagama/find-many": RELIGION_FIXTURE,
	"/api/kependudukan/distribusiumur/find-many": AGE_FIXTURE,
	"/api/kependudukan/databanjar/find-many": BANJAR_FIXTURE,
	"/api/ekonomi/demografipekerjaan/find-many": OCCUPATION_FIXTURE,
	"/api/kesehatan/kelahiran/findMany": BIRTHS_FIXTURE,
	"/api/kesehatan/kematian/findMany": DEATHS_FIXTURE,
	"/api/kependudukan/migrasipenduduk/find-many": MIGRATION_FIXTURE,
	"/api/ekonomi/sektourunggulandesa/find-many": SECTORS_FIXTURE,
};

// ── Mock ────────────────────────────────────────────────────────────────────────

mock.module("@/utils/desa-external-client", () => ({
	desaExternalClient: {
		GET: async (path: string) => {
			if (path in BY_PATH) return { data: { data: BY_PATH[path] } };
			return { error: `unexpected: ${path}` };
		},
	},
}));

// ── Imports setelah mock ─────────────────────────────────────────────────────────

import {
	getDemografiAge,
	getDemografiBanjar,
	getDemografiReligion,
	getDemografiSummary,
} from "@/api/dashboard-cache";
import { buildDemografi } from "@/api/wall-snapshot/build-demografi";
import { cache } from "@/utils/cache";

beforeEach(() => cache.flush());
afterAll(() => mock.restore());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("wall demografi parity", () => {
	it("stats wall = summary Desa API (total/heads/poor)", async () => {
		const demografi = await buildDemografi();
		expect(demografi.stats).toEqual({
			total: 4200,
			heads: 1176,
			poor: 240,
		});
	});

	it("religion wall identik dengan loader dashboard (termasuk LAINNYA)", async () => {
		const [demografi, dashboardRaw] = await Promise.all([
			buildDemografi(),
			getDemografiReligion(),
		]);
		// Total agama di wall = total agama dashboard
		const wallTotal = demografi.religion.reduce((a, r) => a + r.count, 0);
		const dashTotal = (dashboardRaw as { jumlah: number }[]).reduce(
			(a, r) => a + r.jumlah,
			0,
		);
		expect(wallTotal).toBe(dashTotal);
		expect(demografi.religion).toContainEqual({ label: "LAINNYA", count: 290 });
	});

	it("banjar & age wall identik dgn loader dashboard", async () => {
		const [demografi, banjarRaw, ageRaw] = await Promise.all([
			buildDemografi(),
			getDemografiBanjar(),
			getDemografiAge(),
		]);
		expect(demografi.banjar).toHaveLength((banjarRaw as unknown[]).length);
		expect(demografi.banjar[0]).toEqual({
			name: "Banjar Adat Kangin",
			population: 520,
			kk: 145,
			poor: 30,
		});
		expect(demografi.ageGroups).toHaveLength((ageRaw as unknown[]).length);
	});

	it("dinamika dihitung dari panjang array (bukan summary.dinamika)", async () => {
		const demografi = await buildDemografi();
		// 5 kelahiran, 4 kematian, 3 masuk, 3 keluar — sama seperti halaman Demografi
		expect(demografi.dinamika).toEqual({
			births: 5,
			deaths: 4,
			moveIn: 3,
			moveOut: 3,
		});
	});

	it("occupation sorted desc + count = L+P", async () => {
		const demografi = await buildDemografi();
		expect(demografi.occupationTop[0]).toEqual({
			label: "Wiraswasta",
			count: 200,
		});
		expect(demografi.occupationTop[1]).toEqual({
			label: "Petani/Pekebun",
			count: 150,
		});
	});

	it("gender sengaja kosong (Desa API tak sediakan)", async () => {
		const demografi = await buildDemografi();
		expect(demografi.gender).toEqual([]);
	});

	it("cache di-share: loader & builder pakai key demografi:* yang sama", async () => {
		await buildDemografi();
		// setelah build, cache demografi:summary terisi payload ber-.summary
		const cached = cache.get("demografi:summary") as { summary?: unknown };
		expect(cached?.summary).toBeDefined();
		// loader dashboard baca dari cache yang sama (tanpa fetch ulang)
		const viaSummary = await getDemografiSummary();
		expect(viaSummary).toEqual(cached);
	});

	it("degradasi anggun: 1 endpoint gagal → slice itu kosong, lain tetap terisi", async () => {
		// Override: religion error, sisanya normal
		mock.module("@/utils/desa-external-client", () => ({
			desaExternalClient: {
				GET: async (path: string) => {
					if (path.includes("distribusiagama")) return { error: "down" };
					if (path in BY_PATH) return { data: { data: BY_PATH[path] } };
					return { error: `unexpected: ${path}` };
				},
			},
		}));
		cache.flush();

		const demografi = await buildDemografi();
		expect(demografi.religion).toEqual([]); // slice gagal → kosong
		expect(demografi.stats.total).toBe(4200); // slice lain tetap jalan
		expect(demografi.banjar.length).toBeGreaterThan(0);
	});
});
