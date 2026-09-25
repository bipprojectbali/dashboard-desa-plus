/**
 * Unit test transform murni Jenna (src/api/transforms/jenna.ts).
 * Fixture = bentuk JennaAnalyticsData dari NOC `/api/noc/jenna/analytics`
 * (sama yang dipakai halaman /jenna-analytic).
 */
import { describe, expect, it } from "bun:test";
import {
	type JennaAnalyticsRaw,
	mapJenna,
	mapJennaJamSibuk,
	mapJennaKpi,
	mapJennaMingguan,
	mapJennaTopik,
} from "@/api/transforms/jenna";

describe("mapJennaKpi", () => {
	it("ambil stats interaksi/jawaban/belum/waktu", () => {
		const raw: JennaAnalyticsRaw = {
			stats: {
				interaksiHariIni: 12,
				changeFromYesterday: 15,
				jawabanOtomatis: 100,
				belumDitindak: 55,
				waktuRespon: "7.9 sec",
			},
		};
		expect(mapJennaKpi(raw)).toEqual({
			interaksiHariIni: 12,
			changeFromYesterday: 15,
			jawabanOtomatis: 100,
			belumDitindak: 55,
			waktuRespon: "7.9 sec",
		});
	});

	it("payload null/kosong → angka 0 & waktuRespon '—'", () => {
		expect(mapJennaKpi(null)).toEqual({
			interaksiHariIni: 0,
			changeFromYesterday: 0,
			jawabanOtomatis: 0,
			belumDitindak: 0,
			waktuRespon: "—",
		});
		expect(mapJennaKpi({}).waktuRespon).toBe("—");
	});

	it("coerce string angka & negatif changeFromYesterday", () => {
		const kpi = mapJennaKpi({
			stats: { interaksiHariIni: 3, changeFromYesterday: -100 },
		});
		expect(kpi.interaksiHariIni).toBe(3);
		expect(kpi.changeFromYesterday).toBe(-100);
	});
});

describe("mapJennaMingguan", () => {
	it("map day+count, coerce count string→number", () => {
		const rows = [
			{ day: "Jum", count: 9 },
			{ day: "Sen", count: "4" },
		];
		expect(mapJennaMingguan(rows)).toEqual([
			{ day: "Jum", count: 9 },
			{ day: "Sen", count: 4 },
		]);
	});

	it("buang entri tanpa day; non-array → []", () => {
		expect(mapJennaMingguan([{ count: 5 }, { day: "Rab", count: 6 }])).toEqual([
			{ day: "Rab", count: 6 },
		]);
		expect(mapJennaMingguan(undefined)).toEqual([]);
	});
});

describe("mapJennaTopik", () => {
	it("map topic+count, buang tanpa topic", () => {
		const rows = [
			{ topic: "Informasi", count: 67 },
			{ count: 10 },
			{ topic: "Bansos", count: "11" },
		];
		expect(mapJennaTopik(rows)).toEqual([
			{ topic: "Informasi", count: 67 },
			{ topic: "Bansos", count: 11 },
		]);
	});

	it("non-array → []", () => {
		expect(mapJennaTopik(null)).toEqual([]);
	});
});

describe("mapJennaJamSibuk", () => {
	it("map slot+pct dengan clamp 0..100", () => {
		const rows = [
			{ slot: "Pagi (08–12)", pct: 25 },
			{ slot: "Malam (20–08)", pct: 175 },
			{ slot: "Siang", pct: -5 },
		];
		expect(mapJennaJamSibuk(rows)).toEqual([
			{ slot: "Pagi (08–12)", pct: 25 },
			{ slot: "Malam (20–08)", pct: 100 },
			{ slot: "Siang", pct: 0 },
		]);
	});

	it("buang entri tanpa slot; non-array → []", () => {
		expect(mapJennaJamSibuk([{ pct: 50 }])).toEqual([]);
		expect(mapJennaJamSibuk(undefined)).toEqual([]);
	});
});

describe("mapJenna (agregat)", () => {
	it("rakit seluruh slice dari payload lengkap", () => {
		const raw: JennaAnalyticsRaw = {
			stats: { interaksiHariIni: 0, jawabanOtomatis: 100, belumDitindak: 55 },
			chartMingguan: [{ day: "Jum", count: 9 }],
			topTopics: [{ topic: "Informasi", count: 67 }],
			jamTersibuk: [{ slot: "Malam", pct: 75 }],
		};
		const out = mapJenna(raw);
		expect(out.kpi.jawabanOtomatis).toBe(100);
		expect(out.mingguan).toHaveLength(1);
		expect(out.topik[0]?.topic).toBe("Informasi");
		expect(out.jamSibuk[0]?.pct).toBe(75);
	});

	it("payload kosong → slice aman (kpi default, list kosong)", () => {
		const out = mapJenna({});
		expect(out.mingguan).toEqual([]);
		expect(out.topik).toEqual([]);
		expect(out.jamSibuk).toEqual([]);
		expect(out.kpi.waktuRespon).toBe("—");
	});
});
