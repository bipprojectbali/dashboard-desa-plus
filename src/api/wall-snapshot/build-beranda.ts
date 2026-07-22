import type { WallBeranda } from "@/types/wall";
import { cache, TTL, withCache } from "@/utils/cache";
import { getEnv } from "@/utils/env";
import { nocExternalClient } from "@/utils/noc-external-client";
import { EMPTY_COMPLAINT_STATS } from "../complaint-platform";
import {
	getComplaintStats,
	getDemografiSummary,
	getSuratTrends,
	getSuratWeekly,
} from "../dashboard-cache";
import { type ApbdesEntryRaw, mapApbdesList } from "../transforms/apbdes";
import {
	mapActiveDivisions,
	type NocDivisionRaw,
} from "../transforms/noc-divisions";
import { mapUpcomingEvents, type NocEventRaw } from "../transforms/noc-events";
import { buildBerandaKpiTiles } from "./beranda-kpi";
import { buildSatisfaction } from "./external-satisfaction";

const DEFAULT_VILLAGE_ID = getEnv("NOC_VILLAGE_ID", "desa1");

async function fetchKpi(): Promise<WallBeranda["kpi"]> {
	const [stats, weekly, summaryPayload] = await Promise.all([
		getComplaintStats().catch(() => EMPTY_COMPLAINT_STATS),
		getSuratWeekly().catch(() => ({ count: 0 })),
		getDemografiSummary().catch(() => null),
	]);
	const summary = (
		summaryPayload as {
			summary?: { totalPenduduk?: number; totalKK?: number };
		} | null
	)?.summary;
	return buildBerandaKpiTiles({
		weeklyService: weekly.count,
		complaints: {
			baru: stats.baru,
			selesai: stats.selesai,
			ditolak: stats.ditolak,
		},
		totalPenduduk: summary?.totalPenduduk ?? 0,
		totalKK: summary?.totalKK ?? 0,
	});
}

async function fetchSuratTrend(): Promise<WallBeranda["suratTrend"]> {
	return getSuratTrends().catch(() => []);
}

async function fetchDivisi(): Promise<WallBeranda["divisi"]> {
	return withCache(
		`dashboard:active-divisions:${DEFAULT_VILLAGE_ID}`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/active-divisions",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID } } },
			);
			if (error || !extData) throw new Error("NOC API error");
			const res = extData as any;
			const divisi: NocDivisionRaw[] = res?.data?.divisi;
			if (!Array.isArray(divisi)) throw new Error("Invalid NOC response");
			return mapActiveDivisions(divisi);
		},
	);
}

async function fetchKalender(): Promise<WallBeranda["kalender"]> {
	return withCache(
		`dashboard:upcoming-events:${DEFAULT_VILLAGE_ID}:all`,
		TTL.DASHBOARD,
		async () => {
			const { data: extData, error } = await nocExternalClient.GET(
				"/api/noc/upcoming-events",
				{ params: { query: { idDesa: DEFAULT_VILLAGE_ID, filter: "all" } } },
			);
			if (error || !extData) throw new Error("NOC API error");
			const res = extData as any;
			const list: NocEventRaw[] =
				res?.data?.upcoming ?? res?.data?.events ?? res?.data?.today;
			if (!Array.isArray(list)) throw new Error("Invalid NOC response");
			return mapUpcomingEvents(list);
		},
	);
}

async function fetchApbdes(): Promise<WallBeranda["apbdes"]> {
	// Reuse shared cache populated by sync job / endpoint; fetch findMany on miss
	const cached = cache.get<ApbdesEntryRaw[]>("apbdes:all");
	let entries: ApbdesEntryRaw[];

	if (cached) {
		entries = cached;
	} else {
		const baseUrl =
			process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
		const response = await fetch(`${baseUrl}/api/landingpage/apbdes/findMany`);
		if (!response.ok) throw new Error(`Desa API error: ${response.status}`);
		const json = await response.json();
		entries = (json.data ?? json) as ApbdesEntryRaw[];
		cache.set("apbdes:all", entries, TTL.APBDES);
	}

	// Pick tahun terbaru (list sudah desc dari mapApbdesList)
	return mapApbdesList(entries)[0]?.data ?? [];
}

async function fetchSdgs(): Promise<WallBeranda["sdgs"]> {
	return withCache("dashboard:sdgs", TTL.DASHBOARD, async () => {
		const baseUrl =
			process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
		const response = await fetch(
			`${baseUrl}/api/landingpage/sdgsdesa/findMany`,
		);
		if (!response.ok) throw new Error(`Desa API error: ${response.status}`);
		const json = await response.json();
		if (!json.success || !Array.isArray(json.data))
			throw new Error("Invalid SDGs response");
		return json.data.map(
			(item: {
				name: string;
				jumlah: string | number;
				image: { link: string };
			}) => ({
				title: item.name,
				score: Number(item.jumlah),
				image: `${baseUrl}${item.image.link}`,
			}),
		);
	});
}

/** Rakit slice Beranda dari 7 sumber data secara paralel. */
export async function buildBeranda(): Promise<WallBeranda> {
	const [kpi, suratTrend, kepuasan, divisi, kalender, apbdes, sdgs] =
		await Promise.all([
			fetchKpi(),
			fetchSuratTrend(),
			buildSatisfaction(),
			fetchDivisi(),
			fetchKalender(),
			fetchApbdes(),
			fetchSdgs(),
		]);

	return { kpi, suratTrend, kepuasan, divisi, kalender, apbdes, sdgs };
}
