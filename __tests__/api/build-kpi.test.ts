/**
 * Unit test buildKpi — mock 5 sumber live, assert mapping & fallback 0.
 *
 * mock.module WAJIB di atas import — Bun memprosesnya sebelum module dievaluasi.
 * afterAll(mock.restore) WAJIB — mock global, bisa bocor ke file test lain.
 */
import { afterAll, describe, expect, it, mock } from "bun:test";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DEMOGRAFI_FIXTURE = { summary: { totalPenduduk: 4200, totalKK: 1050 } };
const UMKM_KPI_FIXTURE = { umkmAktif: 9 };
const PENGADUAN_FIXTURE = {
	stats: { total: 21, baru: 5, proses: 10, selesai: 4, ditolak: 2 },
	trend7m: [],
	serviceByType: [],
	pengajuanTerbaru: [],
	musrenbang: [],
};
const UPCOMING_FIXTURE = { data: { upcoming: [{}, {}, {}] } }; // 3 event
const CCTV_FIXTURE = { laporanMingguIni: 1, cctvOnline: 3 };

// ── Mocks ─────────────────────────────────────────────────────────────────────

mock.module("@/api/dashboard-cache", () => ({
	getDemografiSummary: async () => DEMOGRAFI_FIXTURE,
}));

mock.module("@/utils/desa-external-client", () => ({
	desaExternalClient: {
		GET: async (path: string) => {
			if (path.includes("umkm/dashboard/kpi"))
				return { data: { data: UMKM_KPI_FIXTURE } };
			if (path.includes("keamanan/cctv/stats"))
				return { data: { data: CCTV_FIXTURE } };
			return { error: `unexpected path: ${path}` };
		},
	},
}));

mock.module("@/utils/noc-external-client", () => ({
	nocExternalClient: {
		GET: async () => ({ data: UPCOMING_FIXTURE }),
	},
}));

mock.module("@/api/wall-snapshot/build-pengaduan", () => ({
	buildPengaduan: async () => PENGADUAN_FIXTURE,
}));

// cache harus di-mock agar withCache langsung eksekusi fn tanpa caching antar-it
mock.module("@/utils/cache", () => ({
	TTL: { DASHBOARD: 900_000, KEAMANAN: 1_800_000, DEMOGRAFI: 21_600_000 },
	withCache: async (_key: string, _ttl: number, fn: () => Promise<unknown>) =>
		fn(),
}));

// ── Imports setelah mock ──────────────────────────────────────────────────────

import { buildKpi } from "@/api/wall-snapshot/build-kpi";

afterAll(() => mock.restore());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("buildKpi", () => {
	it("memetakan 5 sumber ke WallKpi dengan benar", async () => {
		const kpi = await buildKpi();

		expect(kpi.residents).toBe(4200);
		expect(kpi.umkm).toBe(9);
		expect(kpi.complaints).toBe(21);
		expect(kpi.activities).toBe(3);
		expect(kpi.securityReports).toBe(1);
	});

	// Regresi: CCTV API balikin object {cctvOnline, laporanMingguIni}. buildKpi
	// WAJIB ekstrak angka laporanMingguIni — bukan teruskan object. Kalau object
	// bocor ke KPI, frontend render "[object Object]" (bug 2026-07-27).
	it("securityReports selalu number, bukan object dari API", async () => {
		const kpi = await buildKpi();
		expect(typeof kpi.securityReports).toBe("number");
		expect(kpi.securityReports).not.toBe(
			CCTV_FIXTURE as unknown as number,
		);
	});

	it("tidak ada field documents", async () => {
		const kpi = await buildKpi();
		expect(Object.keys(kpi)).not.toContain("documents");
	});

	it("fallback 0 saat getDemografiSummary throw", async () => {
		mock.module("@/api/dashboard-cache", () => ({
			getDemografiSummary: async () => {
				throw new Error("API down");
			},
		}));
		const kpi = await buildKpi();
		expect(kpi.residents).toBe(0);
		// sumber lain tetap normal
		expect(kpi.umkm).toBe(9);
		expect(kpi.complaints).toBe(21);
	});

	it("fallback 0 saat UMKM API error", async () => {
		mock.module("@/utils/desa-external-client", () => ({
			desaExternalClient: {
				GET: async (path: string) => {
					if (path.includes("umkm/dashboard/kpi")) return { error: "timeout" };
					if (path.includes("keamanan/cctv/stats"))
						return { data: { data: CCTV_FIXTURE } };
					return { error: "unexpected" };
				},
			},
		}));
		const kpi = await buildKpi();
		expect(kpi.umkm).toBe(0);
		expect(kpi.securityReports).toBe(1);
	});

	it("fallback 0 saat NOC upcoming-events error", async () => {
		mock.module("@/utils/noc-external-client", () => ({
			nocExternalClient: {
				GET: async () => ({ error: "noc down", data: null }),
			},
		}));
		const kpi = await buildKpi();
		expect(kpi.activities).toBe(0);
	});

	it("fallback 0 saat buildPengaduan throw", async () => {
		mock.module("@/api/wall-snapshot/build-pengaduan", () => ({
			buildPengaduan: async () => {
				throw new Error("Jenna down");
			},
		}));
		const kpi = await buildKpi();
		expect(kpi.complaints).toBe(0);
	});
});
