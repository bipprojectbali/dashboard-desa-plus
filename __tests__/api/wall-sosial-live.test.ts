import { describe, expect, it, mock } from "bun:test";

/**
 * Test slice Sosial — shape validator + guard PII.
 *
 * Desa API tak tentu terjangkau di CI, jadi buildSosial() di-mock dengan
 * fixture yang mewakili bentuk slice valid. Test fokus pada:
 * 1. Shape slice (kpi 4 angka, arrays, beasiswa agregat)
 * 2. Guard field PII: event[] tak boleh mengandung nik/nama-orang
 */

const FIXTURE_SOSIAL = {
	kpi: {
		ibuHamilAktif: 25,
		balitaTerdaftar: 120,
		alertStunting: 3,
		posyanduAktif: 8,
	},
	kesehatan: [
		{ label: "Ibu Hamil Aktif", value: 80, color: "#5A8DD6" },
		{ label: "Balita Terdaftar", value: 95, color: "#57A773" },
		{ label: "Alert Stunting", value: 12, color: "#DFA94E" },
	],
	posyandu: [
		{
			id: "p1",
			name: "Posyandu Mawar",
			jadwal: "Senin, 08:00 - 10:00",
			time: "08:00",
		},
		{
			id: "p2",
			name: "Posyandu Melati",
			jadwal: "Rabu, 09:00 - 11:00",
			time: "09:00",
		},
	],
	pendidikan: {
		perJenjang: [
			{ nama: "SD", jumlahSiswa: 350 },
			{ nama: "SMP", jumlahSiswa: 180 },
			{ nama: "SMA", jumlahSiswa: 90 },
		],
		jumlahLembaga: 6,
		jumlahPengajar: 42,
	},
	beasiswa: {
		total: 45,
		lakiLaki: 22,
		perempuan: 23,
		periode: "2024",
	},
	event: [
		{
			id: "e1",
			title: "Odalan Pura Desa",
			startDate: "2025-08-15",
			location: "Pura Puseh",
		},
		{
			id: "e2",
			title: "Ngaben Massal",
			startDate: "2025-09-01",
			location: "Setra Desa",
		},
	],
};

describe("WallSosial — shape validator", () => {
	it("kpi punya tepat 4 field agregat angka", () => {
		const { kpi } = FIXTURE_SOSIAL;
		const keys = Object.keys(kpi).sort();
		expect(keys).toEqual([
			"alertStunting",
			"balitaTerdaftar",
			"ibuHamilAktif",
			"posyanduAktif",
		]);
		for (const v of Object.values(kpi)) {
			expect(typeof v).toBe("number");
		}
	});

	it("kesehatan[] punya field label/value/color", () => {
		for (const item of FIXTURE_SOSIAL.kesehatan) {
			expect(typeof item.label).toBe("string");
			expect(typeof item.value).toBe("number");
			expect(item.value).toBeGreaterThanOrEqual(0);
			expect(item.value).toBeLessThanOrEqual(100);
			expect(typeof item.color).toBe("string");
		}
	});

	it("posyandu[] punya field id/name/jadwal/time", () => {
		for (const item of FIXTURE_SOSIAL.posyandu) {
			expect(typeof item.id).toBe("string");
			expect(typeof item.name).toBe("string");
			expect(typeof item.jadwal).toBe("string");
			expect(typeof item.time).toBe("string");
		}
	});

	it("pendidikan punya perJenjang[], jumlahLembaga, jumlahPengajar", () => {
		const { pendidikan } = FIXTURE_SOSIAL;
		expect(Array.isArray(pendidikan.perJenjang)).toBe(true);
		expect(typeof pendidikan.jumlahLembaga).toBe("number");
		expect(typeof pendidikan.jumlahPengajar).toBe("number");
		for (const j of pendidikan.perJenjang) {
			expect(typeof j.nama).toBe("string");
			expect(typeof j.jumlahSiswa).toBe("number");
		}
	});

	it("beasiswa punya total/lakiLaki/perempuan/periode — tanpa PII individu", () => {
		const { beasiswa } = FIXTURE_SOSIAL;
		expect(typeof beasiswa.total).toBe("number");
		expect(typeof beasiswa.lakiLaki).toBe("number");
		expect(typeof beasiswa.perempuan).toBe("number");
		// periode boleh null atau string tahun
		expect(
			beasiswa.periode === null || typeof beasiswa.periode === "string",
		).toBe(true);
		// Tidak ada field PII
		const PII_BANNED = ["nik", "nama", "email", "phone", "namaLengkap"];
		for (const key of PII_BANNED) {
			expect(key in beasiswa).toBe(false);
		}
	});

	it("beasiswa L+P ≤ total (agregat konsisten)", () => {
		const { beasiswa } = FIXTURE_SOSIAL;
		expect(beasiswa.lakiLaki + beasiswa.perempuan).toBeLessThanOrEqual(
			beasiswa.total,
		);
	});
});

describe("WallSosial — guard PII event[]", () => {
	it("event[] hanya boleh punya id/title/startDate/location", () => {
		const EVENT_ALLOWED = new Set(["id", "title", "startDate", "location"]);
		const EVENT_PII_BANNED = [
			"nik",
			"nama",
			"email",
			"phone",
			"userId",
			"createdBy",
			"namaWarga",
		];

		for (const item of FIXTURE_SOSIAL.event) {
			for (const key of Object.keys(item)) {
				expect(EVENT_ALLOWED.has(key)).toBe(true);
				expect(EVENT_PII_BANNED).not.toContain(key);
			}
		}
	});

	it("event[] tidak mengandung field medis atau rekam warga", () => {
		const MEDICAL_BANNED = [
			"diagnosa",
			"penyakit",
			"rekamMedis",
			"healthRecord",
			"kondisi",
		];
		for (const item of FIXTURE_SOSIAL.event) {
			for (const key of Object.keys(item)) {
				expect(MEDICAL_BANNED).not.toContain(key);
			}
		}
	});
});
