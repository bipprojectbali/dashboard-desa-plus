import { describe, expect, it, mock } from "bun:test";
import type { ApbdesEntryRaw } from "@/api/transforms/apbdes";
import { mapKeuanganList } from "@/api/transforms/keuangan-apbdes";

/**
 * Fixture minimal: 1 entry, 2 item (pendapatan + belanja leaf), 1 aid (bantuan).
 * Cukup untuk memverifikasi paritas slice wall == output mapKeuanganList[0].
 */
const ENTRY_FIXTURE: ApbdesEntryRaw = {
	id: "entry-2025",
	tahun: 2025,
	name: "APBDes 2025",
	items: [
		{
			id: "p1",
			tipe: "pendapatan",
			level: 1,
			anggaran: 31_000_000,
			parentId: null,
			realisasiItems: [{ jumlah: 10_000_000, tanggal: "2025-03-01" }],
		},
		{
			id: "b1",
			tipe: "belanja",
			level: 1,
			uraian: "Bidang Pemerintahan",
			anggaran: 20_000_000,
			parentId: null,
			realisasiItems: [{ jumlah: 5_000_000, tanggal: "2025-04-15" }],
		},
		{
			id: "aid1",
			tipe: "pendapatan",
			level: 2,
			uraian: "Bantuan Keuangan Provinsi",
			anggaran: 148_800_000,
			parentId: "p1",
			realisasiItems: [],
		},
	],
};

// Mock cache + desa client agar buildKeuangan tak perlu koneksi nyata.
mock.module("@/utils/cache", () => ({
	cache: { get: () => null, set: () => {} },
	TTL: { APBDES: 60 },
}));
mock.module("@/utils/desa-external-client", () => ({
	desaExternalClient: {
		GET: async () => ({ data: { data: [ENTRY_FIXTURE] }, error: null }),
	},
}));

describe("buildKeuangan — paritas wall == mapKeuanganList[0]", () => {
	it("slice wall identik dengan hasil transform (tanpa id/name)", async () => {
		const { buildKeuangan } = await import(
			"@/api/wall-snapshot/build-keuangan"
		);
		const wallSlice = await buildKeuangan();
		const transformResult = mapKeuanganList([ENTRY_FIXTURE]);
		const first = transformResult[0];
		if (!first) throw new Error("fixture tidak menghasilkan data");
		const { id: _id, name: _name, ...expected } = first;

		expect(wallSlice).not.toBeNull();
		expect(wallSlice).toEqual(expected);
	});

	it("field kunci hadir & bertipe benar", async () => {
		const { buildKeuangan } = await import(
			"@/api/wall-snapshot/build-keuangan"
		);
		const s = await buildKeuangan();
		expect(s).not.toBeNull();
		if (!s) return;

		expect(typeof s.tahun).toBe("number");
		expect(typeof s.totalBudget).toBe("number");
		expect(typeof s.totalIncomeReal).toBe("number");
		expect(typeof s.totalExpenseReal).toBe("number");
		expect(typeof s.realisasiPercent).toBe("number");
		expect(Array.isArray(s.monthly)).toBe(true);
		expect(s.monthly).toHaveLength(12);
		expect(Array.isArray(s.allocation)).toBe(true);
		expect(typeof s.report).toBe("object");
		expect(Array.isArray(s.aid)).toBe(true);
	});
});

describe("buildKeuangan — empty/degradasi", () => {
	it("entries kosong → null (widget empty-state, wall tak 500)", async () => {
		// Override mock agar return kosong untuk test ini.
		mock.module("@/utils/desa-external-client", () => ({
			desaExternalClient: {
				GET: async () => ({ data: { data: [] }, error: null }),
			},
		}));
		// Re-import agar mock baru dipakai (cache mock masih return null).
		const { buildKeuangan } = await import(
			"@/api/wall-snapshot/build-keuangan"
		);
		const result = await buildKeuangan();
		expect(result).toBeNull();
	});
});
