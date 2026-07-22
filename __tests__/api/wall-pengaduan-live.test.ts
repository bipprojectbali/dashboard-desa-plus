import { describe, expect, it } from "bun:test";
import {
	mapPengaduanService,
	mapPengaduanStats,
	mapPengaduanTrend,
} from "@/api/transforms/noc-pengaduan";

describe("mapPengaduanStats", () => {
	it("maps diproses → proses correctly", () => {
		const result = mapPengaduanStats({
			stats: { total: 10, baru: 3, diproses: 5, selesai: 2 },
		});
		expect(result.proses).toBe(5);
		expect(result.total).toBe(10);
		expect(result.baru).toBe(3);
		expect(result.selesai).toBe(2);
	});

	it("defaults missing fields to 0", () => {
		const result = mapPengaduanStats({ stats: {} });
		expect(result.total).toBe(0);
		expect(result.baru).toBe(0);
		expect(result.proses).toBe(0);
		expect(result.selesai).toBe(0);
	});

	it("handles null/undefined input", () => {
		const result = mapPengaduanStats(null);
		expect(result).toEqual({ total: 0, baru: 0, proses: 0, selesai: 0 });
	});

	it("passthrough when all fields present", () => {
		const result = mapPengaduanStats({
			stats: { total: 100, baru: 20, diproses: 30, selesai: 50 },
		});
		expect(result).toEqual({ total: 100, baru: 20, proses: 30, selesai: 50 });
	});
});

describe("mapPengaduanTrend", () => {
	it("maps bulan → month and coerces count to number", () => {
		const result = mapPengaduanTrend([{ bulan: "Jan", count: "12" }]);
		expect(result).toEqual([{ month: "Jan", count: 12 }]);
	});

	it("handles numeric count", () => {
		const result = mapPengaduanTrend([{ bulan: "Feb", count: 7 }]);
		expect(result[0].count).toBe(7);
	});

	it("returns [] for null input", () => {
		expect(mapPengaduanTrend(null)).toEqual([]);
	});

	it("returns [] for non-array input", () => {
		// @ts-expect-error testing invalid input
		expect(mapPengaduanTrend("invalid")).toEqual([]);
	});

	it("returns [] for empty array", () => {
		expect(mapPengaduanTrend([])).toEqual([]);
	});

	it("defaults missing bulan to empty string", () => {
		const result = mapPengaduanTrend([{ count: 5 }]);
		expect(result[0].month).toBe("");
	});
});

describe("mapPengaduanService", () => {
	it("maps jenis → letterType", () => {
		const result = mapPengaduanService([{ jenis: "SKCK", count: 10 }]);
		expect(result).toEqual([{ letterType: "SKCK", count: 10 }]);
	});

	it("coerces string count to number", () => {
		const result = mapPengaduanService([{ jenis: "SKU", count: "8" }]);
		expect(result[0].count).toBe(8);
	});

	it("returns [] for null input", () => {
		expect(mapPengaduanService(null)).toEqual([]);
	});

	it("returns [] for non-array input", () => {
		// @ts-expect-error testing invalid input
		expect(mapPengaduanService({})).toEqual([]);
	});
});
