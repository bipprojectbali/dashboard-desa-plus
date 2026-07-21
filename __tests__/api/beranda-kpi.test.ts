import { describe, expect, it } from "bun:test";
import { EMPTY_COMPLAINT_STATS } from "@/api/complaint-platform";
import {
	type BerandaKpiCounts,
	buildBerandaKpiTiles,
} from "@/api/wall-snapshot/beranda-kpi";

const BASE: BerandaKpiCounts = {
	weeklyService: 12,
	complaints: { baru: 5, selesai: 8, ditolak: 2 },
	totalPenduduk: 1500,
	totalKK: 400,
};

describe("buildBerandaKpiTiles", () => {
	it("menghasilkan tepat 4 tile", () => {
		expect(buildBerandaKpiTiles(BASE)).toHaveLength(4);
	});

	it("urutan: Surat → Pengaduan → Layanan → Penduduk", () => {
		const tiles = buildBerandaKpiTiles(BASE);
		expect(tiles[0].label).toBe("Surat Minggu Ini");
		expect(tiles[1].label).toBe("Pengaduan Aktif");
		expect(tiles[2].label).toBe("Layanan Selesai");
		expect(tiles[3].label).toBe("Total Penduduk");
	});

	it("value mapping: Pengaduan=baru, Layanan=selesai", () => {
		const tiles = buildBerandaKpiTiles(BASE);
		expect(tiles[0].value).toBe(BASE.weeklyService);
		expect(tiles[1].value).toBe(BASE.complaints.baru);
		expect(tiles[2].value).toBe(BASE.complaints.selesai);
		expect(tiles[3].value).toBe(BASE.totalPenduduk);
	});

	it("sublabel interpolasi nilai baru + ditolak untuk Pengaduan", () => {
		const tiles = buildBerandaKpiTiles(BASE);
		expect(tiles[1].sublabel).toBe("5 baru, 2 ditolak");
	});

	it("sublabel KK untuk Penduduk", () => {
		const tiles = buildBerandaKpiTiles(BASE);
		expect(tiles[3].sublabel).toBe("400 kepala keluarga");
	});

	it("edge fallback: semua 0 → 4 tile dengan value 0", () => {
		const c: BerandaKpiCounts = {
			weeklyService: 0,
			complaints: { baru: 0, selesai: 0, ditolak: 0 },
			totalPenduduk: 0,
			totalKK: 0,
		};
		const tiles = buildBerandaKpiTiles(c);
		expect(tiles).toHaveLength(4);
		for (const t of tiles) expect(t.value).toBe(0);
		expect(tiles[1].sublabel).toBe("0 baru, 0 ditolak");
		expect(tiles[3].sublabel).toBe("0 kepala keluarga");
	});

	it("edge fallback: EMPTY_COMPLAINT_STATS → Pengaduan=0, Layanan=0", () => {
		const tiles = buildBerandaKpiTiles({
			weeklyService: 0,
			complaints: {
				baru: EMPTY_COMPLAINT_STATS.baru,
				selesai: EMPTY_COMPLAINT_STATS.selesai,
				ditolak: EMPTY_COMPLAINT_STATS.ditolak,
			},
			totalPenduduk: 0,
			totalKK: 0,
		});
		expect(tiles[1].value).toBe(0);
		expect(tiles[2].value).toBe(0);
	});

	it("edge fallback: summary null → totalPenduduk=0, totalKK=0", () => {
		// Caller memetakan null summary ke 0 sebelum masuk builder
		const tiles = buildBerandaKpiTiles({
			weeklyService: 3,
			complaints: { baru: 1, selesai: 2, ditolak: 0 },
			totalPenduduk: 0,
			totalKK: 0,
		});
		expect(tiles[3].value).toBe(0);
		expect(tiles[3].sublabel).toBe("0 kepala keluarga");
	});
});
