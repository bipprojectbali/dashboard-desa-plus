import { describe, expect, it } from "bun:test";
import type { ApbdesEntryRaw, ApbdesItemRaw } from "@/api/transforms/apbdes";
import {
	mapKeuanganEntry,
	mapKeuanganList,
} from "@/api/transforms/keuangan-apbdes";

// ── Fixture HIER (2025-like): hierarki level 1/2/3, parentId terisi ─────────
// Pendapatan: root lvl1 → anak lvl2 "Pad" + "Transfer" → daun lvl3
// Belanja:    root lvl1 → 4 anak lvl2 (bidang) → daun lvl3
// Pembiayaan: root lvl1 → daun lvl3 (tanpa lvl2)
const ITEMS_HIER: ApbdesItemRaw[] = [
	// Pendapatan
	{
		id: "p1",
		tipe: "pendapatan",
		level: 1,
		anggaran: 1_500_000_000,
		parentId: null,
	},
	{
		id: "p2a",
		tipe: "pendapatan",
		level: 2,
		uraian: "PAD",
		anggaran: 800_000_000,
		parentId: "p1",
	},
	{
		id: "p2b",
		tipe: "pendapatan",
		level: 2,
		uraian: "Transfer",
		anggaran: 700_000_000,
		parentId: "p1",
	},
	{
		id: "p3a",
		tipe: "pendapatan",
		level: 3,
		anggaran: 800_000_000,
		parentId: "p2a",
		realisasiItems: [
			{ jumlah: 100_000_000, tanggal: "2025-03-15" },
			{ jumlah: 32_000_000, tanggal: "2025-06-10" },
		],
	},
	{
		id: "p3b",
		tipe: "pendapatan",
		level: 3,
		anggaran: 700_000_000,
		parentId: "p2b",
		realisasiItems: [{ jumlah: 50_000_000, tanggal: "2025-09-01" }],
	},
	// Belanja: 4 bidang
	{
		id: "b1",
		tipe: "belanja",
		level: 1,
		anggaran: 1_500_000_000,
		parentId: null,
	},
	{
		id: "b2a",
		tipe: "belanja",
		level: 2,
		uraian: "Penyelenggaraan",
		anggaran: 350_000_000,
		parentId: "b1",
	},
	{
		id: "b2b",
		tipe: "belanja",
		level: 2,
		uraian: "Pelaksanaan",
		anggaran: 800_000_000,
		parentId: "b1",
	},
	{
		id: "b2c",
		tipe: "belanja",
		level: 2,
		uraian: "Pembinaan",
		anggaran: 200_000_000,
		parentId: "b1",
	},
	{
		id: "b2d",
		tipe: "belanja",
		level: 2,
		uraian: "Pemberdayaan",
		anggaran: 150_000_000,
		parentId: "b1",
	},
	{
		id: "b3a",
		tipe: "belanja",
		level: 3,
		anggaran: 350_000_000,
		parentId: "b2a",
		realisasiItems: [{ jumlah: 100_000_000, tanggal: "2025-03-15" }],
	},
	{
		id: "b3b",
		tipe: "belanja",
		level: 3,
		anggaran: 800_000_000,
		parentId: "b2b",
		realisasiItems: [{ jumlah: 285_000_000, tanggal: "2025-06-20" }],
	},
	{
		id: "b3c",
		tipe: "belanja",
		level: 3,
		anggaran: 200_000_000,
		parentId: "b2c",
		realisasiItems: [],
	},
	{
		id: "b3d",
		tipe: "belanja",
		level: 3,
		anggaran: 150_000_000,
		parentId: "b2d",
		realisasiItems: [],
	},
	// Pembiayaan
	{
		id: "pf1",
		tipe: "pembiayaan",
		level: 1,
		anggaran: 350_000_000,
		parentId: null,
	},
	{
		id: "pf3",
		tipe: "pembiayaan",
		level: 3,
		anggaran: 350_000_000,
		parentId: "pf1",
		realisasiItems: [],
	},
];

const ENTRY_HIER: ApbdesEntryRaw = {
	id: "apbdes-hier",
	tahun: 2025,
	name: "APBDes 2025",
	items: ITEMS_HIER,
};

// ── Fixture FLAT (2026-like): semua parentId=null, realisasiItems kosong ─────
const ITEMS_FLAT: ApbdesItemRaw[] = [
	{
		id: "fp1",
		tipe: "pendapatan",
		level: 3,
		uraian: "PAD Flat",
		anggaran: 500_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fp2",
		tipe: "pendapatan",
		level: 3,
		uraian: "Transfer Flat",
		anggaran: 800_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fb1",
		tipe: "belanja",
		level: 3,
		uraian: "Penyelenggaraan Flat",
		anggaran: 400_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fb2",
		tipe: "belanja",
		level: 3,
		uraian: "Pelaksanaan Flat",
		anggaran: 600_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fb3",
		tipe: "belanja",
		level: 3,
		uraian: "Pembinaan Flat",
		anggaran: 200_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fb4",
		tipe: "belanja",
		level: 3,
		uraian: "Pemberdayaan Flat",
		anggaran: 150_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fb5",
		tipe: "belanja",
		level: 3,
		uraian: "Penanggulangan Flat",
		anggaran: 150_000_000,
		parentId: null,
		realisasiItems: [],
	},
	{
		id: "fpf1",
		tipe: "pembiayaan",
		level: 3,
		uraian: "Pembiayaan Flat",
		anggaran: 700_000_000,
		parentId: null,
		realisasiItems: [],
	},
];

const ENTRY_FLAT: ApbdesEntryRaw = {
	id: "apbdes-flat",
	tahun: 2026,
	name: "APBDes 2026",
	items: ITEMS_FLAT,
};

// ── Fixture GAP: lvl 1 + lvl 3 tanpa lvl 2 ───────────────────────────────────
const ITEMS_GAP: ApbdesItemRaw[] = [
	{
		id: "g1",
		tipe: "belanja",
		level: 1,
		uraian: "Total Belanja",
		anggaran: 1_000_000_000,
		parentId: null,
	},
	{
		id: "g3a",
		tipe: "belanja",
		level: 3,
		uraian: "Bidang A",
		anggaran: 400_000_000,
		parentId: "g1",
		realisasiItems: [],
	},
	{
		id: "g3b",
		tipe: "belanja",
		level: 3,
		uraian: "Bidang B",
		anggaran: 600_000_000,
		parentId: "g1",
		realisasiItems: [],
	},
];

const ENTRY_GAP: ApbdesEntryRaw = {
	id: "apbdes-gap",
	tahun: 2024,
	name: "APBDes 2024",
	items: ITEMS_GAP,
};

describe("mapKeuanganEntry — HIER (2025)", () => {
	const result = mapKeuanganEntry(ENTRY_HIER);

	it("1. allocation = 4 bidang belanja lvl2", () => {
		expect(result.allocation).toHaveLength(4);
		const names = result.allocation.map((a) => a.sector);
		expect(names).toContain("Penyelenggaraan");
		expect(names).toContain("Pelaksanaan");
		expect(names).toContain("Pembinaan");
		expect(names).toContain("Pemberdayaan");
	});

	it("2. report.income & report.expenses non-empty (lvl2)", () => {
		expect(result.report.income.length).toBeGreaterThan(0);
		expect(result.report.expenses.length).toBeGreaterThan(0);
		// income: 2 kategori lvl2 (PAD + Transfer)
		expect(result.report.income).toHaveLength(2);
		// expenses: 4 bidang lvl2
		expect(result.report.expenses).toHaveLength(4);
	});

	it("5. totalBudget = pendapatan + pembiayaan leaf (1.5M + 350jt = 1.85M)", () => {
		// leaves: p3a(800M), p3b(700M), b3a-d (leaf belanja, skip), pf3(350M)
		// pendapatan leaves: 800M + 700M = 1.5M
		// pembiayaan leaves: 350M
		// total: 1.85M
		expect(result.totalBudget).toBe(1_850_000_000);
	});

	it("7. monthly agregasi per bulan (index 0=Jan)", () => {
		// Mar = index 2: p3a income 100M, b3a expense 100M
		expect(result.monthly[2]?.income).toBe(100_000_000);
		expect(result.monthly[2]?.expense).toBe(100_000_000);
		// Jun = index 5: p3a income 32M, b3b expense 285M
		expect(result.monthly[5]?.income).toBe(32_000_000);
		expect(result.monthly[5]?.expense).toBe(285_000_000);
		// Sep = index 8: p3b income 50M
		expect(result.monthly[8]?.income).toBe(50_000_000);
		expect(result.monthly[8]?.expense).toBe(0);
	});

	it("10. realisasiPercent = round(belanjaReal / totalBudget * 100)", () => {
		// belanja real: 100M + 285M = 385M; totalBudget: 1.85M
		const expected = Math.round((385_000_000 / 1_850_000_000) * 100);
		expect(result.realisasiPercent).toBe(expected);
	});

	it("report carries anggaran per-kategori AND realisasi total (parity)", () => {
		// Baris income = anggaran lvl2: PAD=800M, Transfer=700M
		const pad = result.report.income.find((i) => i.category === "PAD");
		expect(pad?.amount).toBe(800_000_000);
		// Total income = realisasi real: 100M+32M+50M = 182M
		expect(result.report.totalIncome).toBe(182_000_000);
	});
});

describe("mapKeuanganEntry — FLAT (2026)", () => {
	const result = mapKeuanganEntry(ENTRY_FLAT);

	it("3. allocation NON-EMPTY (children-of-root fallback ke root)", () => {
		expect(result.allocation.length).toBeGreaterThan(0);
		// 5 belanja roots (semua parentId=null)
		expect(result.allocation).toHaveLength(5);
	});

	it("4. report income + expenses NON-EMPTY", () => {
		expect(result.report.income.length).toBeGreaterThan(0);
		expect(result.report.expenses.length).toBeGreaterThan(0);
	});

	it("6. totalBudget dihitung dari items walau jumlah tidak tersedia", () => {
		// pendapatan: 500M + 800M = 1.3M; pembiayaan: 700M; total: 2M
		expect(result.totalBudget).toBe(2_000_000_000);
	});

	it("8. monthly semua 0 (realisasiItems kosong), tanpa throw", () => {
		expect(result.monthly).toHaveLength(12);
		for (const m of result.monthly) {
			expect(m.income).toBe(0);
			expect(m.expense).toBe(0);
		}
	});
});

describe("mapKeuanganEntry — GAP (lvl 1+3 tanpa lvl 2)", () => {
	const result = mapKeuanganEntry(ENTRY_GAP);

	it("11. tidak mengemit root aggregate — pakai children lvl3", () => {
		// root: g1 (Total Belanja); children: g3a, g3b → pakai children
		expect(result.allocation).toHaveLength(2);
		const names = result.allocation.map((a) => a.sector);
		// TIDAK boleh muncul root "Total Belanja" saja
		expect(names).not.toContain("Total Belanja");
		expect(names).toContain("Bidang A");
		expect(names).toContain("Bidang B");
	});
});

describe("mapKeuanganEntry — aid filter", () => {
	it("9. aid filter bantuan/hibah; status cair bila totalRealisasi>0 else proses", () => {
		const entry: ApbdesEntryRaw = {
			id: "x",
			tahun: 2025,
			items: [
				{
					id: "aid1",
					tipe: "pendapatan",
					uraian: "Bantuan Keuangan Prov",
					anggaran: 100_000_000,
					realisasiItems: [{ jumlah: 50_000_000 }],
				},
				{
					id: "aid2",
					tipe: "pendapatan",
					uraian: "Hibah Langsung",
					anggaran: 200_000_000,
					realisasiItems: [],
				},
				{
					id: "other",
					tipe: "pendapatan",
					uraian: "PAD Pajak",
					anggaran: 50_000_000,
				},
			],
		};
		const r = mapKeuanganEntry(entry);
		expect(r.aid).toHaveLength(2);
		const cair = r.aid.find((a) => a.source === "Bantuan Keuangan Prov");
		expect(cair?.status).toBe("cair");
		const proses = r.aid.find((a) => a.source === "Hibah Langsung");
		expect(proses?.status).toBe("proses");
	});

	it("10b. realisasiPercent = 0 saat totalBudget = 0", () => {
		const r = mapKeuanganEntry({ id: "empty", tahun: 2025, items: [] });
		expect(r.realisasiPercent).toBe(0);
	});
});

describe("mapKeuanganList", () => {
	it("12. sort tahun desc; array kosong → []", () => {
		expect(mapKeuanganList([])).toEqual([]);
		const sorted = mapKeuanganList([ENTRY_FLAT, ENTRY_GAP, ENTRY_HIER]);
		expect(sorted[0]?.tahun).toBe(2026);
		expect(sorted[1]?.tahun).toBe(2025);
		expect(sorted[2]?.tahun).toBe(2024);
	});
});
