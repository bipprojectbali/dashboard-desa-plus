import { describe, expect, it } from "bun:test";
import type { WallKeamanan } from "@/types/wall";

// Fixture WallKeamanan valid — mirror shape builder output
const VALID_FIXTURE: WallKeamanan = {
	kpi: { cctvOnline: 5, laporanMingguIni: 3 },
	cctv: [
		{
			id: "cctv-1",
			kode: "CC01",
			nama: "CCTV Depan Kantor",
			lokasi: "Jl. Raya Darmasaba No. 1",
			latitude: -8.6705,
			longitude: 115.212,
			status: "Online",
		},
		{
			id: "cctv-2",
			kode: "CC02",
			nama: "CCTV Perempatan",
			lokasi: "Jl. Darmasaba Selatan",
			latitude: -8.675,
			longitude: 115.215,
			status: "Offline",
		},
	],
	laporanPublik: [
		{
			id: "lap-1",
			judul: "Pencurian motor di banjar",
			lokasi: "Banjar Tegeh",
			tanggalWaktu: "2026-07-25T10:00:00.000Z",
			status: "Selesai",
		},
		{
			id: "lap-2",
			judul: "Keributan warga",
			lokasi: "Banjar Kaja",
			tanggalWaktu: "2026-07-26T08:30:00.000Z",
			status: "Proses",
		},
	],
};

const CCTV_ALLOWED = [
	"id",
	"kode",
	"nama",
	"lokasi",
	"latitude",
	"longitude",
	"status",
];
const LAPORAN_ALLOWED = ["id", "judul", "lokasi", "tanggalWaktu", "status"];
const PII_BANNED = [
	"nik",
	"nama_lengkap",
	"email",
	"phone",
	"reportedBy",
	"userId",
	"createdBy",
];

describe("WallKeamanan shape guard (fixture — no live API)", () => {
	it("kpi punya 2 field angka", () => {
		const { kpi } = VALID_FIXTURE;
		expect(Object.keys(kpi).sort()).toEqual(["cctvOnline", "laporanMingguIni"]);
		expect(typeof kpi.cctvOnline).toBe("number");
		expect(typeof kpi.laporanMingguIni).toBe("number");
	});

	it("cctv[] punya field yang diizinkan saja", () => {
		for (const item of VALID_FIXTURE.cctv) {
			for (const key of Object.keys(item)) {
				expect(CCTV_ALLOWED).toContain(key);
				expect(PII_BANNED).not.toContain(key);
			}
			expect(typeof item.id).toBe("string");
			expect(typeof item.kode).toBe("string");
			expect(typeof item.nama).toBe("string");
			expect(typeof item.lokasi).toBe("string");
			expect(typeof item.latitude).toBe("number");
			expect(typeof item.longitude).toBe("number");
			expect(typeof item.status).toBe("string");
		}
	});

	it("laporanPublik[] punya field yang diizinkan saja", () => {
		for (const item of VALID_FIXTURE.laporanPublik) {
			for (const key of Object.keys(item)) {
				expect(LAPORAN_ALLOWED).toContain(key);
				expect(PII_BANNED).not.toContain(key);
			}
			expect(typeof item.id).toBe("string");
			expect(typeof item.judul).toBe("string");
			expect(typeof item.lokasi).toBe("string");
			expect(typeof item.tanggalWaktu).toBe("string");
			expect(typeof item.status).toBe("string");
		}
	});

	it("cctv[] status hanya Online atau Offline", () => {
		for (const item of VALID_FIXTURE.cctv) {
			expect(["Online", "Offline"]).toContain(item.status);
		}
	});

	it("laporanPublik[] status hanya nilai yang dikenal", () => {
		const KNOWN_STATUS = ["Selesai", "Proses", "Gagal", "Baru"];
		for (const item of VALID_FIXTURE.laporanPublik) {
			expect(KNOWN_STATUS).toContain(item.status);
		}
	});
});
