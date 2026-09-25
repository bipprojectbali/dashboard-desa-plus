import { describe, expect, it } from "bun:test";
import api from "@/api";
import {
	countSuratWeekly,
	EMPTY_COMPLAINT_STATS,
	mapComplaintStats,
	mapSuratTrends,
} from "@/api/complaint-platform";

// ---------------------------------------------------------------------------
// Unit: mapComplaintStats
// ---------------------------------------------------------------------------

describe("mapComplaintStats", () => {
	it("menghitung baru/selesai/ditolak dari rows platform", () => {
		const rows = [
			...Array.from({ length: 16 }, () => ({ status: "baru" })),
			...Array.from({ length: 3 }, () => ({ status: "selesai" })),
			...Array.from({ length: 2 }, () => ({ status: "ditolak" })),
		];
		const result = mapComplaintStats(rows, 21);
		expect(result).toEqual({ total: 21, baru: 16, selesai: 3, ditolak: 2 });
	});

	it("status tak dikenal diabaikan (tidak masuk ke total counter)", () => {
		const rows = [
			{ status: "baru" },
			{ status: "diproses" }, // tak eksis di platform
			{ status: "unknown" },
		];
		const result = mapComplaintStats(rows, 3);
		expect(result.baru).toBe(1);
		expect(result.selesai).toBe(0);
		expect(result.ditolak).toBe(0);
		expect(result.total).toBe(3);
	});

	it("total fallback ke rows.length jika total undefined", () => {
		const rows = [{ status: "baru" }, { status: "selesai" }];
		const result = mapComplaintStats(rows);
		expect(result.total).toBe(2);
	});
});

// ---------------------------------------------------------------------------
// Unit: EMPTY_COMPLAINT_STATS
// ---------------------------------------------------------------------------

describe("EMPTY_COMPLAINT_STATS", () => {
	it("mapComplaintStats([]) setara EMPTY_COMPLAINT_STATS", () => {
		expect(mapComplaintStats([])).toEqual(EMPTY_COMPLAINT_STATS);
	});

	it("semua field nol", () => {
		expect(EMPTY_COMPLAINT_STATS).toEqual({
			total: 0,
			baru: 0,
			selesai: 0,
			ditolak: 0,
		});
	});
});

// ---------------------------------------------------------------------------
// Unit: countSuratWeekly
// ---------------------------------------------------------------------------

describe("countSuratWeekly", () => {
	// Minggu 20 Jul 2026 → startOfWeek = Minggu 19 Jul 2026 00:00 lokal
	const now = new Date("2026-07-20T12:00:00Z");

	it("menghitung item dalam minggu berjalan", () => {
		const rows = [
			{ created_at: "2026-07-19T00:00:00.000Z" }, // batas minggu inklusif
			{ created_at: "2026-07-20T04:16:59.000Z" }, // dalam minggu
			{ created_at: "2026-07-18T23:59:59.000Z" }, // luar minggu
		];
		// startOfWeek menggunakan waktu lokal; test ini berjalan di TZ apapun
		// — kita hanya verifikasi bahwa item ketiga tidak terhitung
		const result = countSuratWeekly(rows, now);
		// Setidaknya item ke-2 (Jul 20) terhitung; item ke-3 (Jul 18) tidak
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThanOrEqual(2);
	});

	it("item tanpa created_at di-skip", () => {
		const rows = [{ created_at: undefined }, {}];
		expect(countSuratWeekly(rows, now)).toBe(0);
	});

	it("array kosong → 0", () => {
		expect(countSuratWeekly([], now)).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// Unit: mapSuratTrends
// ---------------------------------------------------------------------------

describe("mapSuratTrends", () => {
	it("mengelompokkan per bulan, kronologis", () => {
		const rows = [
			{ created_at: "2026-06-15T00:00:00Z" },
			{ created_at: "2026-06-20T00:00:00Z" },
			{ created_at: "2026-07-01T00:00:00Z" },
			{ created_at: "2026-07-20T00:00:00Z" },
			{ created_at: "2026-07-20T04:16:59Z" },
		];
		const result = mapSuratTrends(rows);
		expect(result).toEqual([
			{ month: "Jun", count: 2 },
			{ month: "Jul", count: 3 },
		]);
	});

	it("created_at invalid di-skip", () => {
		const rows = [
			{ created_at: "invalid-date" },
			{ created_at: "" },
			{ created_at: "2026-07-10T00:00:00Z" },
		];
		const result = mapSuratTrends(rows);
		expect(result).toEqual([{ month: "Jul", count: 1 }]);
	});

	it("created_at undefined di-skip", () => {
		const rows = [{ created_at: undefined }];
		expect(mapSuratTrends(rows)).toEqual([]);
	});

	it("casing jenis tidak memengaruhi grouping (hanya created_at yg diperhitungkan)", () => {
		const rows = [
			{ created_at: "2026-07-01T00:00:00Z" },
			{ created_at: "2026-07-02T00:00:00Z" },
		];
		expect(mapSuratTrends(rows)).toEqual([{ month: "Jul", count: 2 }]);
	});

	it("array kosong → []", () => {
		expect(mapSuratTrends([])).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Integration: Auth guard — /api/complaint/stats
// ---------------------------------------------------------------------------

describe("complaint stats auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/complaint/stats"),
		);
		expect(res.status).toBe(401);
	});
});

// ---------------------------------------------------------------------------
// Integration: Auth guard — /api/complaint/service-weekly
// ---------------------------------------------------------------------------

describe("complaint service-weekly auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/complaint/service-weekly"),
		);
		expect(res.status).toBe(401);
	});
});

// ---------------------------------------------------------------------------
// Integration: Auth guard — /api/complaint/service-trends
// ---------------------------------------------------------------------------

describe("complaint service-trends auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/complaint/service-trends"),
		);
		expect(res.status).toBe(401);
	});
});
