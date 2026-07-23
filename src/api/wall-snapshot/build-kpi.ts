import type { WallKpi } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";
import { getEnv } from "@/utils/env";
import { nocExternalClient } from "@/utils/noc-external-client";
import { getDemografiSummary } from "../dashboard-cache";
import { buildPengaduan } from "./build-pengaduan";

const DEFAULT_VILLAGE_ID = getEnv("NOC_VILLAGE_ID", "desa1");

async function fetchResidents(): Promise<number> {
	const payload = await getDemografiSummary();
	const summary = (payload as { summary?: { totalPenduduk?: number } } | null)
		?.summary;
	return summary?.totalPenduduk ?? 0;
}

async function fetchUmkmAktif(): Promise<number> {
	return withCache("wall:kpi:umkm", TTL.DASHBOARD, async () => {
		const res = await desaExternalClient.GET("/api/ekonomi/umkm/dashboard/kpi");
		if (res.error) throw new Error("UMKM KPI API error");
		return (res.data?.data as { umkmAktif?: number } | null)?.umkmAktif ?? 0;
	});
}

async function fetchUpcomingCount(): Promise<number> {
	return withCache(
		`wall:kpi:upcoming-count:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data, error } = await nocExternalClient.GET(
				"/api/noc/upcoming-events",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID, filter: "all" } } },
			);
			if (error || !data) throw new Error("NOC upcoming-events API error");
			const res = data as unknown as {
				data?: { upcoming?: unknown[]; events?: unknown[]; today?: unknown[] };
			};
			const list =
				res?.data?.upcoming ?? res?.data?.events ?? res?.data?.today ?? [];
			return Array.isArray(list) ? list.length : 0;
		},
	);
}

async function fetchCctvLaporan(): Promise<number> {
	return withCache("keamanan:cctv:stats", TTL.KEAMANAN, async () => {
		const res = await desaExternalClient.GET("/api/keamanan/cctv/stats");
		if (res.error) throw new Error("CCTV stats API error");
		return (
			(res.data?.data as { laporanMingguIni?: number } | null)
				?.laporanMingguIni ?? 0
		);
	});
}

/** 5 KPI lintas domain dari sumber live — tanpa prisma.count(). */
export async function buildKpi(): Promise<WallKpi> {
	const [residents, umkm, complaints, activities, securityReports] =
		await Promise.all([
			fetchResidents().catch(() => 0),
			fetchUmkmAktif().catch(() => 0),
			buildPengaduan()
				.then((d) => d.stats.total)
				.catch(() => 0),
			fetchUpcomingCount().catch(() => 0),
			fetchCctvLaporan().catch(() => 0),
		]);

	return { residents, umkm, complaints, activities, securityReports };
}
