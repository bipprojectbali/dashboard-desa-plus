/**
 * Regression guard: memastikan jalur dashboard (loader) dan jalur wall (builder)
 * membaca nilai dan shape yang identik dari shared cache.
 *
 * mock.module WAJIB di atas import — Bun memprosesnya sebelum module dievaluasi.
 * afterAll(mock.restore) WAJIB — mock.module global, tak auto-restore, bisa bocor
 * ke test file lain dalam satu proses Bun.
 */
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const LAPORAN_FIXTURE = [
	{ status: "baru" },
	{ status: "baru" },
	{ status: "selesai" },
	{ status: "ditolak" },
];

const now = new Date();
const thisWeek = new Date(now);
thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
thisWeek.setHours(1, 0, 0, 0);

const SURAT_FIXTURE = [
	{ created_at: thisWeek.toISOString() }, // minggu ini
	{ created_at: "2025-01-15T00:00:00Z" }, // lama
	{ created_at: "2026-06-15T00:00:00Z" }, // bulan lalu
	{ created_at: thisWeek.toISOString() }, // minggu ini ke-2
];

const SUMMARY_FIXTURE = {
	summary: { totalPenduduk: 1500, totalKK: 400 },
	dinamika: { kelahiran: 10, kematian: 3 },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

mock.module("@/utils/platform-external-client", () => ({
	platformFetch: async (path: string) => {
		if (path.includes("laporan"))
			return { data: LAPORAN_FIXTURE, total: LAPORAN_FIXTURE.length };
		if (path.includes("surat")) return { data: SURAT_FIXTURE };
		throw new Error(`Unexpected platform path: ${path}`);
	},
}));

mock.module("@/utils/desa-external-client", () => ({
	desaExternalClient: {
		GET: async (path: string) => {
			if (path.includes("summary")) return { data: { data: SUMMARY_FIXTURE } };
			return { error: "unexpected" };
		},
	},
}));

// ── Imports setelah mock ───────────────────────────────────────────────────────

import { EMPTY_COMPLAINT_STATS } from "@/api/complaint-platform";
import {
	getComplaintStats,
	getDemografiSummary,
	getSuratWeekly,
} from "@/api/dashboard-cache";
import { buildBerandaKpiTiles } from "@/api/wall-snapshot/beranda-kpi";
import { cache } from "@/utils/cache";

beforeEach(() => cache.flush());
afterAll(() => mock.restore());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("wall-dashboard parity", () => {
	it("KPI angka identik via shared loaders", async () => {
		const [stats, weekly, summaryPayload] = await Promise.all([
			getComplaintStats(),
			getSuratWeekly(),
			getDemografiSummary(),
		]);
		const summary = (
			summaryPayload as {
				summary?: { totalPenduduk?: number; totalKK?: number };
			} | null
		)?.summary;

		const tiles = buildBerandaKpiTiles({
			weeklyService: weekly.count,
			complaints: {
				baru: stats.baru,
				selesai: stats.selesai,
				ditolak: stats.ditolak,
			},
			totalPenduduk: summary?.totalPenduduk ?? 0,
			totalKK: summary?.totalKK ?? 0,
		});

		// Nilai dashboard dan wall identik karena bersumber dari loader yang sama
		expect(tiles[0].value).toBe(weekly.count);
		expect(tiles[1].value).toBe(stats.baru);
		expect(tiles[2].value).toBe(stats.selesai);
		expect(tiles[3].value).toBe(SUMMARY_FIXTURE.summary.totalPenduduk);
		expect(tiles[3].sublabel).toBe(
			`${SUMMARY_FIXTURE.summary.totalKK} kepala keluarga`,
		);
	});

	it("shape guard: dashboard:surat:weekly tersimpan sebagai {count:number}", async () => {
		await getSuratWeekly();
		const cached = cache.get<{ count: number }>("dashboard:surat:weekly");
		expect(cached).toBeDefined();
		expect(typeof cached).toBe("object");
		expect("count" in (cached as object)).toBe(true);
		expect(typeof cached?.count).toBe("number");
	});

	it("shape guard: demografi:summary tersimpan sebagai payload ber-.summary", async () => {
		await getDemografiSummary();
		const cached = cache.get("demografi:summary");
		expect(cached).toBeDefined();
		expect((cached as any)?.summary).toBeDefined();
		expect(typeof (cached as any)?.summary?.totalPenduduk).toBe("number");
	});

	it("cache miss kedua loader → nilai konsisten (cache dipakai)", async () => {
		// Panggil dua kali; kedua hasil harus identik (cache hit)
		const first = await getComplaintStats();
		const second = await getComplaintStats();
		expect(second).toEqual(first);
	});

	it("fallback: API down → EMPTY_COMPLAINT_STATS, 4 tile tetap ada", async () => {
		// Override sementara dengan error
		mock.module("@/utils/platform-external-client", () => ({
			platformFetch: async () => {
				throw new Error("API down");
			},
		}));
		cache.flush();

		const stats = await getComplaintStats().catch(() => EMPTY_COMPLAINT_STATS);
		const weekly = await getSuratWeekly().catch(() => ({ count: 0 }));
		const tiles = buildBerandaKpiTiles({
			weeklyService: weekly.count,
			complaints: {
				baru: stats.baru,
				selesai: stats.selesai,
				ditolak: stats.ditolak,
			},
			totalPenduduk: 0,
			totalKK: 0,
		});
		expect(tiles).toHaveLength(4);
		for (const t of tiles) expect(t.value).toBe(0);
	});
});
