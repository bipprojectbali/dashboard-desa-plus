import type { WallBumdes } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";

type KpiRaw = WallBumdes["kpi"];
type RingkasanRaw = WallBumdes["ringkasan"];
type TopProdukRaw = WallBumdes["topProduk"][number];
type DetailRaw = WallBumdes["detail"][number];

export async function fetchUmkmKpi(period: string): Promise<KpiRaw | null> {
	return withCache(`bumdes:kpi:${period}`, TTL.BUMDES, async () => {
		const res = await desaExternalClient.GET(
			"/api/ekonomi/umkm/dashboard/kpi",
			{ params: { query: { period } } },
		);
		if (res.error) throw new Error("UMKM kpi API error");
		return (res.data?.data as KpiRaw | null) ?? null;
	});
}

export async function fetchUmkmRingkasan(
	period: string,
): Promise<RingkasanRaw | null> {
	return withCache(`bumdes:ringkasan:${period}`, TTL.BUMDES, async () => {
		const res = await desaExternalClient.GET(
			"/api/ekonomi/umkm/dashboard/ringkasan-penjualan",
			{ params: { query: { period } } },
		);
		if (res.error) throw new Error("UMKM ringkasan API error");
		return (res.data?.data as RingkasanRaw | null) ?? null;
	});
}

export async function fetchUmkmTopProduk(
	period: string,
): Promise<TopProdukRaw[] | null> {
	return withCache(`bumdes:top-produk:${period}`, TTL.BUMDES, async () => {
		const res = await desaExternalClient.GET(
			"/api/ekonomi/umkm/dashboard/top-produk",
			{ params: { query: { period } } },
		);
		if (res.error) throw new Error("UMKM top-produk API error");
		const data = res.data?.data;
		return Array.isArray(data) ? (data as TopProdukRaw[]) : null;
	});
}

export async function fetchUmkmDetail(
	period: string,
): Promise<DetailRaw[] | null> {
	return withCache(`bumdes:detail:${period}::`, TTL.BUMDES, async () => {
		const res = await desaExternalClient.GET(
			"/api/ekonomi/umkm/dashboard/detail-penjualan",
			{ params: { query: { period } } },
		);
		if (res.error) throw new Error("UMKM detail API error");
		const data = res.data?.data;
		return Array.isArray(data) ? (data as DetailRaw[]) : null;
	});
}
