/**
 * Shared loader untuk cache key yang dibaca oleh route dashboard DAN wall builder.
 * Satu modul ini = satu penulis shape per key → poisoning cache mustahil secara struktural.
 * Loader throw (tidak swallow error) supaya outer try/catch di route tetap bekerja.
 */
import { TTL, withCache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";
import { platformFetch } from "@/utils/platform-external-client";
import {
	type ComplaintStats,
	countSuratWeekly,
	mapComplaintStats,
	mapSuratTrends,
	type PlatformLaporan,
	type PlatformSurat,
	type TrendPoint,
} from "./complaint-platform";

export async function getComplaintStats(): Promise<ComplaintStats> {
	return withCache("dashboard:complaint:stats", TTL.DASHBOARD, async () => {
		const json = await platformFetch<PlatformLaporan>(
			"/api/noc/laporan?limit=1000",
		);
		return mapComplaintStats(json.data, json.total);
	});
}

export async function getSuratWeekly(): Promise<{ count: number }> {
	return withCache("dashboard:surat:weekly", TTL.DASHBOARD, async () => {
		const json = await platformFetch<PlatformSurat>(
			"/api/noc/surat?limit=1000",
		);
		return { count: countSuratWeekly(json.data) };
	});
}

export async function getSuratTrends(): Promise<TrendPoint[]> {
	return withCache("dashboard:surat:trends", TTL.DASHBOARD, async () => {
		const json = await platformFetch<PlatformSurat>(
			"/api/noc/surat?limit=1000",
		);
		return mapSuratTrends(json.data);
	});
}

/**
 * Returns parent payload (berisi .summary) — shape identik dgn cache.set di demografi.ts /sync.
 * Ekstraksi .summary dilakukan di caller. null valid → tak ter-cache (cache.ts:79).
 */
export async function getDemografiSummary(): Promise<unknown | null> {
	return withCache("demografi:summary", TTL.DEMOGRAFI, async () => {
		const res = await desaExternalClient.GET(
			"/api/kependudukan/dashboard/summary",
		);
		if (res.error) throw new Error("Desa API error");
		return res.data?.data ?? null;
	});
}
