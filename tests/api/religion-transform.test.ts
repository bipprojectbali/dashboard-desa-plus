import { describe, expect, it } from "bun:test";
import {
	groupReligion,
	normalizeReligion,
	religionYears,
	rowYear,
} from "@/api/transforms/religion";

// Fixture meniru bentuk asli endpoint distribusiagama (lintas tahun, ada
// beberapa baris "LAINNYA" — akar bug "3 LAINNYA" di dashboard).
const RAW = [
	{ agama: "HINDU", jumlah: 3850, tahun: 2026 },
	{ agama: "LAINNYA", jumlah: 2026, tahun: 2026 },
	{ agama: "LAINNYA", jumlah: 290, tahun: 2021 },
	{ agama: "ISLAM", jumlah: 285, tahun: 2026 },
	{ agama: "KRISTEN_PROTESTAN", jumlah: 42, tahun: 2026 },
	{ agama: "LAINNYA", jumlah: 10, tahun: 2020 },
];

describe("normalizeReligion", () => {
	it("map enum → label resmi (Kristen/Katolik dipendekkan, bukan 4 kategori)", () => {
		expect(normalizeReligion("KRISTEN_PROTESTAN")).toEqual({
			key: "KRISTEN_PROTESTAN",
			label: "Kristen",
		});
		expect(normalizeReligion("KRISTEN_KATOLIK")).toEqual({
			key: "KRISTEN_KATOLIK",
			label: "Katolik",
		});
		expect(normalizeReligion("hindu")).toEqual({
			key: "HINDU",
			label: "Hindu",
		});
	});

	it("spasi/tanda hubung → underscore key", () => {
		expect(normalizeReligion("kristen katolik")).toEqual({
			key: "KRISTEN_KATOLIK",
			label: "Katolik",
		});
	});

	it("kosong/null → bucket Lainnya", () => {
		expect(normalizeReligion("")).toEqual({ key: "LAINNYA", label: "Lainnya" });
		expect(normalizeReligion(null)).toEqual({
			key: "LAINNYA",
			label: "Lainnya",
		});
	});

	it("nilai tak dikenal → title-case fallback", () => {
		expect(normalizeReligion("PENGHAYAT")).toEqual({
			key: "PENGHAYAT",
			label: "Penghayat",
		});
	});
});

describe("rowYear / religionYears", () => {
	it("ambil tahun valid, urut menurun & unik", () => {
		expect(religionYears(RAW)).toEqual([2026, 2021, 2020]);
	});

	it("baris tanpa tahun → null, tidak masuk daftar tahun", () => {
		expect(rowYear({ agama: "HINDU", jumlah: 1 })).toBeNull();
		expect(religionYears([{ agama: "HINDU", jumlah: 1 }])).toEqual([]);
	});

	it("non-array → []", () => {
		expect(religionYears(null)).toEqual([]);
		expect(religionYears(undefined)).toEqual([]);
	});
});

describe("groupReligion", () => {
	it("filter tahun terbaru → hanya baris tahun itu (buang LAINNYA tahun lama)", () => {
		const out = groupReligion(RAW, 2026);
		expect(out).toEqual([
			{ key: "HINDU", label: "Hindu", count: 3850 },
			{ key: "ISLAM", label: "Islam", count: 285 },
			{ key: "KRISTEN_PROTESTAN", label: "Kristen", count: 42 },
			{ key: "LAINNYA", label: "Lainnya", count: 2026 },
		]);
		// Hanya satu "Lainnya", bukan tiga.
		expect(out.filter((s) => s.key === "LAINNYA")).toHaveLength(1);
	});

	it("Lainnya selalu di urutan paling bawah walau count besar", () => {
		const out = groupReligion(RAW, 2026);
		expect(out.at(-1)?.key).toBe("LAINNYA");
	});

	it("tahun tertentu tanpa data → []", () => {
		expect(groupReligion(RAW, 2019)).toEqual([]);
	});

	it("tanpa filter tahun → jumlahkan agama sama lintas tahun", () => {
		const out = groupReligion(RAW, null);
		const lainnya = out.find((s) => s.key === "LAINNYA");
		expect(lainnya?.count).toBe(2026 + 290 + 10);
	});

	it("dedup + sum baris agama sama dalam satu tahun", () => {
		const dup = [
			{ agama: "ISLAM", jumlah: 100, tahun: 2026 },
			{ agama: "islam", jumlah: 50, tahun: 2026 },
		];
		expect(groupReligion(dup, 2026)).toEqual([
			{ key: "ISLAM", label: "Islam", count: 150 },
		]);
	});

	it("non-array → []", () => {
		expect(groupReligion(null, 2026)).toEqual([]);
		expect(groupReligion(undefined, null)).toEqual([]);
	});
});
