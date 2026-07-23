/**
 * Unit test transform murni demografi (src/api/transforms/demografi.ts).
 * Fixture = bentuk sebenarnya dari Desa API stg (dashboard/summary, distribusi*,
 * databanjar, demografipekerjaan, kelahiran/kematian/migrasi).
 */
import { describe, expect, it } from "bun:test";
import {
	countDinamika,
	extractStats,
	mapAge,
	mapBanjar,
	mapOccupation,
	mapReligion,
	mapSectors,
} from "@/api/transforms/demografi";

describe("extractStats", () => {
	it("ambil total/heads/poor dari payload.summary", () => {
		const payload = {
			summary: {
				totalPenduduk: 4200,
				totalKK: 1176,
				totalKemiskinan: 240,
			},
		};
		expect(extractStats(payload)).toEqual({
			total: 4200,
			heads: 1176,
			poor: 240,
		});
	});

	it("payload null/kosong → semua 0", () => {
		expect(extractStats(null)).toEqual({ total: 0, heads: 0, poor: 0 });
		expect(extractStats({})).toEqual({ total: 0, heads: 0, poor: 0 });
	});
});

describe("mapReligion", () => {
	it("map agama+jumlah, pertahankan LAINNYA", () => {
		const raw = [
			{ agama: "HINDU", jumlah: 3850 },
			{ agama: "LAINNYA", jumlah: 290 },
		];
		expect(mapReligion(raw)).toEqual([
			{ label: "HINDU", count: 3850 },
			{ label: "LAINNYA", count: 290 },
		]);
	});

	it("non-array → []", () => {
		expect(mapReligion(null)).toEqual([]);
		expect(mapReligion(undefined)).toEqual([]);
	});
});

describe("mapAge", () => {
	it("map rentangUmur+jumlah", () => {
		const raw = [{ rentangUmur: "0-14", jumlah: 820 }];
		expect(mapAge(raw)).toEqual([{ range: "0-14", count: 820 }]);
	});
});

describe("mapBanjar", () => {
	it("map nama/penduduk/kk/miskin → name/population/kk/poor", () => {
		const raw = [
			{ nama: "Banjar Adat Kangin", penduduk: 520, kk: 145, miskin: 30 },
		];
		expect(mapBanjar(raw)).toEqual([
			{ name: "Banjar Adat Kangin", population: 520, kk: 145, poor: 30 },
		]);
	});

	it("sorted desc by population, ambil take teratas", () => {
		const raw = [
			{ nama: "A", penduduk: 300, kk: 80, miskin: 10 },
			{ nama: "B", penduduk: 520, kk: 145, miskin: 30 },
			{ nama: "C", penduduk: 405, kk: 115, miskin: 28 },
		];
		expect(mapBanjar(raw, 2)).toEqual([
			{ name: "B", population: 520, kk: 145, poor: 30 },
			{ name: "C", population: 405, kk: 115, poor: 28 },
		]);
	});

	it("default take 5 → batasi maksimal 5 baris", () => {
		const raw = Array.from({ length: 8 }, (_, i) => ({
			nama: `B${i}`,
			penduduk: (i + 1) * 100,
			kk: 10,
			miskin: 1,
		}));
		expect(mapBanjar(raw)).toHaveLength(5);
		expect(mapBanjar(raw)[0]).toEqual({
			name: "B7",
			population: 800,
			kk: 10,
			poor: 1,
		});
	});

	it("non-array → []", () => {
		expect(mapBanjar(null)).toEqual([]);
	});
});

describe("mapOccupation", () => {
	it("count = lakiLaki + perempuan, sorted desc, take teratas", () => {
		const raw = [
			{ pekerjaan: "Petani", lakiLaki: 100, perempuan: 50 }, // 150
			{ pekerjaan: "PNS", lakiLaki: 30, perempuan: 20 }, // 50
			{ pekerjaan: "Wiraswasta", lakiLaki: 120, perempuan: 80 }, // 200
		];
		const result = mapOccupation(raw, 2);
		expect(result).toEqual([
			{ label: "Wiraswasta", count: 200 },
			{ label: "Petani", count: 150 },
		]);
	});

	it("fallback ke field jumlah jika ada", () => {
		const raw = [{ pekerjaan: "X", jumlah: 42 }];
		expect(mapOccupation(raw)[0]).toEqual({ label: "X", count: 42 });
	});
});

describe("countDinamika", () => {
	it("births/deaths dari panjang array, migrasi dipisah masuk/keluar", () => {
		const result = countDinamika({
			births: [{}, {}, {}, {}, {}], // 5
			deaths: [{}, {}, {}, {}], // 4
			migration: [
				{ jenis: "MASUK" },
				{ jenis: "MASUK" },
				{ jenis: "MASUK" },
				{ jenis: "KELUAR" },
				{ jenis: "KELUAR" },
				{ jenis: "KELUAR" },
			],
		});
		expect(result).toEqual({
			births: 5,
			deaths: 4,
			moveIn: 3,
			moveOut: 3,
		});
	});

	it("input non-array → semua 0", () => {
		expect(
			countDinamika({ births: null, deaths: undefined, migration: {} }),
		).toEqual({ births: 0, deaths: 0, moveIn: 0, moveOut: 0 });
	});
});

describe("mapSectors", () => {
	it("resolve label longgar (name/nama/sektor) + value", () => {
		expect(mapSectors([{ name: "Pertanian", value: 90 }])).toEqual([
			{ label: "Pertanian", value: 90 },
		]);
		expect(mapSectors([{ sektor: "Peternakan", nilai: 30 }])).toEqual([
			{ label: "Peternakan", value: 30 },
		]);
	});

	it("sorted desc by value, ambil take teratas", () => {
		const raw = [
			{ name: "Kuliner", value: 15 },
			{ name: "Pertanian", value: 90 },
			{ name: "Peternakan", value: 40 },
		];
		expect(mapSectors(raw, 2)).toEqual([
			{ label: "Pertanian", value: 90 },
			{ label: "Peternakan", value: 40 },
		]);
	});

	it("default take 5 → batasi maksimal 5 bar", () => {
		const raw = Array.from({ length: 9 }, (_, i) => ({
			name: `S${i}`,
			value: (i + 1) * 10,
		}));
		expect(mapSectors(raw)).toHaveLength(5);
		expect(mapSectors(raw)[0]).toEqual({ label: "S8", value: 90 });
	});

	it("non-array → []", () => {
		expect(mapSectors(null)).toEqual([]);
	});
});
