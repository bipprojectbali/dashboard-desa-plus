import { describe, expect, it } from "bun:test";
import {
	parseAgeList,
	parseBanjarList,
	parseDemografiSummary,
	parseJobList,
	parseMigrationList,
	parseSectorList,
	readDemografiPayload,
} from "@/components/demografi/demografi-response.parse";

describe("readDemografiPayload", () => {
	it("returns data from a successful response", () => {
		expect(
			readDemografiPayload({ data: { success: true, data: [1, 2] } }),
		).toEqual([1, 2]);
	});

	it("returns null for failed, empty, or malformed responses", () => {
		expect(readDemografiPayload({ data: { success: false, data: [1] } })).toBe(
			null,
		);
		expect(readDemografiPayload({ data: { success: true } })).toBe(null);
		expect(readDemografiPayload({ data: null, error: "x" })).toBe(null);
		expect(readDemografiPayload(null)).toBe(null);
	});
});

describe("parseDemografiSummary", () => {
	it("prefers nested summary fields, falls back to top-level, then 0", () => {
		const parsed = parseDemografiSummary({
			summary: { totalPenduduk: 120, totalKK: 0 },
			heads: 40,
		});
		expect(parsed.stats).toEqual({ total: 120, heads: 40, poor: 0 });
		expect(parsed.births).toBeUndefined();
	});

	it("counts dynamics given as numbers or arrays", () => {
		const parsed = parseDemografiSummary({
			dinamika: {
				kelahiran: 3,
				kematian: 1,
				pindahMasuk: [{}, {}],
				pindahKeluar: 4,
			},
		});
		expect(parsed).toMatchObject({
			births: 3,
			deaths: 1,
			moveIn: 2,
			moveOut: 4,
		});
	});
});

describe("list parsers", () => {
	it("return null for non-array payloads", () => {
		expect(parseBanjarList({})).toBe(null);
		expect(parseAgeList(null)).toBe(null);
		expect(parseJobList("x")).toBe(null);
		expect(parseMigrationList(undefined)).toBe(null);
		expect(parseSectorList(5)).toBe(null);
	});

	it("maps banjar rows with ID/EN aliases and caps at 10", () => {
		const rows = Array.from({ length: 12 }, (_, i) => ({
			id: `b${i}`,
			nama: `Banjar ${i}`,
			penduduk: 10,
			kk: 3,
		}));
		const parsed = parseBanjarList(rows);
		expect(parsed).toHaveLength(10);
		expect(parsed?.[0]).toEqual({
			id: "b0",
			name: "Banjar 0",
			totalPopulation: 10,
			totalKK: 3,
			totalPoor: 0,
		});
		expect(parseBanjarList([{}])?.[0]?.name).toBe("Unknown");
	});

	it("maps age rows with fallbacks", () => {
		expect(parseAgeList([{ kelompokUmur: "0-4", count: "7" }, {}])).toEqual([
			{ ageRange: "0-4", total: 7 },
			{ ageRange: "Unknown", total: 0 },
		]);
	});

	it("sums job totals by gender when no total is given", () => {
		expect(
			parseJobList([{ pekerjaan: "Petani", lakiLaki: 4, perempuan: "2" }, {}]),
		).toEqual([
			{ job: "Petani", total: 6 },
			{ job: "Lainnya", total: 0 },
		]);
	});

	it("counts migration in and out across field variants", () => {
		expect(
			parseMigrationList([
				{ jenis: "MASUK" },
				{ type: "in" },
				{ arah: "keluar" },
				{ jenis: "lain" },
			]),
		).toEqual({ moveIn: 2, moveOut: 1 });
	});

	it("unwraps wrapped sector payloads and keeps 0 values via ??", () => {
		expect(
			parseSectorList({
				items: [{ sektorUnggulan: "Pertanian", value: 0, nilai: 9 }],
			}),
		).toEqual([{ sektor: "Pertanian", value: 0 }]);
		expect(parseSectorList([{ nilai: 5 }])).toEqual([
			{ sektor: "Unknown", value: 5 },
		]);
	});
});
