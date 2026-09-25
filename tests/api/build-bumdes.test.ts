/**
 * Unit test buildBumdes — mock 4 endpoint UMKM dashboard, assert slice & fallback.
 *
 * mock.module WAJIB di atas import — Bun memprosesnya sebelum module dievaluasi.
 * afterAll(mock.restore) WAJIB — mock global, bisa bocor ke file test lain.
 */
import { afterAll, describe, expect, it, mock } from "bun:test";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const KPI_FIXTURE = {
	umkmAktif: 12,
	totalUmkm: 20,
	omzetBulanan: 5_000_000,
	kategoriTerbanyak: "Makanan",
	jumlahKategoriTerbanyak: 7,
};

const RINGKASAN_FIXTURE = {
	totalPenjualan: 18_000_000,
	persentasePerubahan: 8.5,
	kategoriAktif: 4,
	totalTransaksi: 320,
};

const TOP_PRODUK_FIXTURE = [
	{
		namaProduk: "Kopi Lokal",
		namaUmkm: "Bumdes Darmasaba",
		totalPenjualan: 3_200_000,
		jumlahTerjual: 160,
		growth: 12,
	},
];

const DETAIL_FIXTURE = [
	{
		namaProduk: "Kopi Lokal",
		penjualanBulanIni: 3_200_000,
		penjualanBulanLalu: 2_850_000,
		trend: "up" as const,
		trendPersen: 12.3,
		stok: 45,
		statusStok: "tersedia",
	},
];

// ── Mocks ─────────────────────────────────────────────────────────────────────

mock.module("@/utils/cache", () => ({
	TTL: { BUMDES: 3_600_000 },
	withCache: async (_key: string, _ttl: number, fn: () => Promise<unknown>) =>
		fn(),
}));

mock.module("@/utils/desa-external-client", () => ({
	desaExternalClient: {
		GET: async (path: string) => {
			if (path.includes("kpi")) return { data: { data: KPI_FIXTURE } };
			if (path.includes("ringkasan-penjualan"))
				return { data: { data: RINGKASAN_FIXTURE } };
			if (path.includes("top-produk"))
				return { data: { data: TOP_PRODUK_FIXTURE } };
			if (path.includes("detail-penjualan"))
				return { data: { data: DETAIL_FIXTURE } };
			return { error: `unexpected path: ${path}` };
		},
	},
}));

// ── Import setelah mock ───────────────────────────────────────────────────────

import { buildBumdes } from "@/api/wall-snapshot/build-bumdes";

afterAll(() => mock.restore());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("buildBumdes", () => {
	it("memetakan 4 endpoint ke WallBumdes dengan benar", async () => {
		const result = await buildBumdes();
		expect(result).not.toBeNull();
		expect(result?.kpi.umkmAktif).toBe(12);
		expect(result?.kpi.omzetBulanan).toBe(5_000_000);
		expect(result?.ringkasan.persentasePerubahan).toBe(8.5);
		expect(result?.topProduk).toHaveLength(1);
		expect(result?.topProduk[0]?.namaProduk).toBe("Kopi Lokal");
		expect(result?.detail[0]?.trend).toBe("up");
	});

	it("null saat kpi API gagal", async () => {
		mock.module("@/utils/desa-external-client", () => ({
			desaExternalClient: {
				GET: async () => ({ error: "api down" }),
			},
		}));
		const result = await buildBumdes();
		expect(result).toBeNull();
	});

	it("fallback empty array + default ringkasan saat endpoint non-kpi gagal", async () => {
		mock.module("@/utils/desa-external-client", () => ({
			desaExternalClient: {
				GET: async (path: string) => {
					if (path.includes("kpi")) return { data: { data: KPI_FIXTURE } };
					return { error: "partial down" };
				},
			},
		}));
		const result = await buildBumdes();
		expect(result).not.toBeNull();
		expect(result?.kpi.umkmAktif).toBe(12);
		expect(result?.topProduk).toEqual([]);
		expect(result?.detail).toEqual([]);
		expect(result?.ringkasan.totalPenjualan).toBe(0);
	});
});
