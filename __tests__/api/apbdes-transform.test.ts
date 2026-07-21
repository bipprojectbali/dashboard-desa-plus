import { describe, expect, it } from "bun:test";
import {
	mapApbdesEntry,
	mapApbdesList,
	type ApbdesEntryRaw,
	type ApbdesItemRaw,
} from "@/api/transforms/apbdes";

// Fixture 2025: campuran level 1, 2, 3
// pendapatan: leaf = item-p3 (anggaran 1_500_000, realisasi 132_000_000 → 8.8%)
// belanja: leaf = item-b3 (anggaran 1_500_000, realisasi 385_000_000 → 25.7%)
// pembiayaan: leaf = item-pf3 (anggaran 350_000_000, realisasi 0)
const ITEMS_2025: ApbdesItemRaw[] = [
	// pendapatan tree
	{ id: "item-p1", tipe: "pendapatan", level: 1, anggaran: 1_500_000_000, parentId: null },
	{ id: "item-p2", tipe: "pendapatan", level: 2, anggaran: 1_500_000_000, parentId: "item-p1" },
	{
		id: "item-p3",
		tipe: "pendapatan",
		level: 3,
		anggaran: 1_500_000_000,
		parentId: "item-p2",
		realisasiItems: [{ jumlah: 100_000_000 }, { jumlah: 32_000_000 }],
	},
	// belanja tree
	{ id: "item-b1", tipe: "belanja", level: 1, anggaran: 1_500_000_000, parentId: null },
	{ id: "item-b2", tipe: "belanja", level: 2, anggaran: 1_500_000_000, parentId: "item-b1" },
	{
		id: "item-b3",
		tipe: "belanja",
		level: 3,
		anggaran: 1_500_000_000,
		parentId: "item-b2",
		realisasiItems: [{ jumlah: 385_000_000 }],
	},
	// pembiayaan tree
	{ id: "item-pf1", tipe: "pembiayaan", level: 1, anggaran: 350_000_000, parentId: null },
	{
		id: "item-pf3",
		tipe: "pembiayaan",
		level: 3,
		anggaran: 350_000_000,
		parentId: "item-pf1",
		realisasiItems: [],
	},
];

const ENTRY_2025: ApbdesEntryRaw = {
	id: "apbdes-2025",
	tahun: 2025,
	name: "APBDes Darmasaba Tahun 2025",
	items: ITEMS_2025,
};

// Fixture 2026: semua level 3, tidak ada level 1
const ITEMS_2026: ApbdesItemRaw[] = [
	{
		id: "p26-root",
		tipe: "pendapatan",
		level: 3,
		anggaran: 2_000_000_000,
		parentId: null,
		realisasiItems: [{ jumlah: 0 }],
	},
	{
		id: "b26-root",
		tipe: "belanja",
		level: 3,
		anggaran: 1_800_000_000,
		parentId: null,
		realisasiItems: [],
	},
];

const ENTRY_2026: ApbdesEntryRaw = {
	id: "apbdes-2026",
	tahun: 2026,
	name: "APBDes Darmasaba Tahun 2026",
	items: ITEMS_2026,
};

describe("mapApbdesEntry", () => {
	it("sets tahun and name from entry fields", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		expect(result.tahun).toBe(2025);
		expect(result.name).toBe("APBDes Darmasaba Tahun 2025");
	});

	it("builds title as 'Realisasi <name>'", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		expect(result.title).toBe("Realisasi APBDes Darmasaba Tahun 2025");
	});

	it("uses leaf-based sum: skips non-leaf items (2025)", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		const pendapatan = result.data.find((d) => d.category === "Pendapatan");
		expect(pendapatan).toBeDefined();
		// leaf item-p3: anggaran 1.5M
		expect(pendapatan!.anggaran).toBe(1_500_000_000);
	});

	it("sums realisasiItems on leaf (pendapatan 2025 = 132jt)", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		const pendapatan = result.data.find((d) => d.category === "Pendapatan");
		expect(pendapatan!.realisasi).toBe(132_000_000);
	});

	it("percentage pendapatan 2025 ≈ 8.8%", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		const pendapatan = result.data.find((d) => d.category === "Pendapatan");
		expect(pendapatan!.percentage).toBeCloseTo(8.8, 0);
	});

	it("belanja realisasi 2025 = 385jt → ~25.7%", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		const belanja = result.data.find((d) => d.category === "Belanja");
		expect(belanja!.realisasi).toBe(385_000_000);
		expect(belanja!.percentage).toBeCloseTo(25.7, 0);
	});

	it("pembiayaan realisasi 2025 = 0 → 0%", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		const pembiayaan = result.data.find((d) => d.category === "Pembiayaan");
		expect(pembiayaan!.realisasi).toBe(0);
		expect(pembiayaan!.percentage).toBe(0);
	});

	it("2026 all-level-3 (no parentId): all items are leaves → correct anggaran", () => {
		const result = mapApbdesEntry(ENTRY_2026);
		const pendapatan = result.data.find((d) => d.category === "Pendapatan");
		expect(pendapatan!.anggaran).toBe(2_000_000_000);
	});

	it("assigns correct colors", () => {
		const result = mapApbdesEntry(ENTRY_2025);
		expect(result.data.find((d) => d.category === "Pendapatan")?.color).toBe("#10B981");
		expect(result.data.find((d) => d.category === "Belanja")?.color).toBe("#3B82F6");
		expect(result.data.find((d) => d.category === "Pembiayaan")?.color).toBe("#F59E0B");
	});

	it("handles entry with no items gracefully", () => {
		const result = mapApbdesEntry({ id: "empty", tahun: 2024 });
		expect(result.data).toEqual([]);
		expect(result.title).toBe("Realisasi APBDes Tahun 2024");
	});

	it("title fallback uses tahun when name is absent", () => {
		const result = mapApbdesEntry({ id: "x", tahun: 2023 });
		expect(result.name).toBe("APBDes Tahun 2023");
		expect(result.title).toBe("Realisasi APBDes Tahun 2023");
	});
});

describe("mapApbdesList", () => {
	it("sorts by tahun desc (terbaru dulu)", () => {
		const result = mapApbdesList([ENTRY_2025, ENTRY_2026]);
		expect(result[0]!.tahun).toBe(2026);
		expect(result[1]!.tahun).toBe(2025);
	});

	it("handles empty array", () => {
		expect(mapApbdesList([])).toEqual([]);
	});
});
