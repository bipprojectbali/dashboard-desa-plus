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

/**
 * Loader per-slice demografi. Satu modul ini = satu penulis shape per cache key
 * `demografi:*` → dibaca oleh route dashboard (demografi.ts) DAN wall builder
 * (build-demografi.ts). Semua mengembalikan `data.data` mentah (array) atau null.
 * Throw (tidak swallow) supaya try/catch pemanggil tetap bekerja.
 */
function makeDemografiLoader(cacheKey: string, path: DemografiPath) {
	return () =>
		withCache(cacheKey, TTL.DEMOGRAFI, async () => {
			const res = await desaExternalClient.GET(path);
			if (res.error) throw new Error(`Desa API error: ${path}`);
			return res.data?.data ?? null;
		});
}

/** Path Desa API yang dipakai loader demografi (union sempit untuk type-safety). */
type DemografiPath =
	| "/api/kependudukan/databanjar/find-many"
	| "/api/kependudukan/distribusiumur/find-many"
	| "/api/ekonomi/demografipekerjaan/find-many"
	| "/api/kependudukan/distribusiagama/find-many"
	| "/api/kesehatan/kelahiran/findMany"
	| "/api/kesehatan/kematian/findMany"
	| "/api/kependudukan/migrasipenduduk/find-many"
	| "/api/ekonomi/sektourunggulandesa/find-many";

export const getDemografiBanjar = makeDemografiLoader(
	"demografi:banjar",
	"/api/kependudukan/databanjar/find-many",
);
export const getDemografiAge = makeDemografiLoader(
	"demografi:age",
	"/api/kependudukan/distribusiumur/find-many",
);
export const getDemografiOccupation = makeDemografiLoader(
	"demografi:occupation",
	"/api/ekonomi/demografipekerjaan/find-many",
);
export const getDemografiReligion = makeDemografiLoader(
	"demografi:religion",
	"/api/kependudukan/distribusiagama/find-many",
);
export const getDemografiBirths = makeDemografiLoader(
	"demografi:births",
	"/api/kesehatan/kelahiran/findMany",
);
export const getDemografiDeaths = makeDemografiLoader(
	"demografi:deaths",
	"/api/kesehatan/kematian/findMany",
);
export const getDemografiMigration = makeDemografiLoader(
	"demografi:migration",
	"/api/kependudukan/migrasipenduduk/find-many",
);
export const getDemografiSectors = makeDemografiLoader(
	"demografi:sectors",
	"/api/ekonomi/sektourunggulandesa/find-many",
);
