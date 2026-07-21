import type { WallBeranda } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";
import { getEnv } from "@/utils/env";
import { nocExternalClient } from "@/utils/noc-external-client";
import {
	mapActiveDivisions,
	type NocDivisionRaw,
} from "../transforms/noc-divisions";
import { mapUpcomingEvents, type NocEventRaw } from "../transforms/noc-events";
import { buildSatisfaction } from "./external-satisfaction";

const DEFAULT_VILLAGE_ID = getEnv("NOC_VILLAGE_ID", "desa1");
const APBDES_ID = getEnv("DESA_APBDES_ID", "cmk-apbdes-001");

const APBDES_COLOR_MAP: Record<string, string> = {
	pendapatan: "#10B981",
	belanja: "#3B82F6",
	pembiayaan: "#F59E0B",
};

async function fetchKpi(): Promise<WallBeranda["kpi"]> {
	const now = new Date();
	const startOfWeek = new Date(now);
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
	startOfWeek.setHours(0, 0, 0, 0);

	const [
		weeklyService,
		pengaduanBaru,
		pengaduanDitolak,
		layananSelesai,
		totalPenduduk,
		totalKK,
	] = await Promise.all([
		prisma.serviceLetter.count({ where: { createdAt: { gte: startOfWeek } } }),
		prisma.complaint.count({ where: { status: "BARU" } }),
		prisma.complaint.count({ where: { status: "DITOLAK" } }),
		prisma.complaint.count({ where: { status: "SELESAI" } }),
		prisma.resident.count(),
		prisma.resident.count({ where: { isHeadOfHousehold: true } }),
	]);

	return [
		{
			label: "Surat Minggu Ini",
			value: weeklyService,
			sublabel: "Total surat diajukan",
		},
		{
			label: "Pengaduan Aktif",
			value: pengaduanBaru,
			sublabel: `${pengaduanBaru} baru, ${pengaduanDitolak} ditolak`,
		},
		{
			label: "Layanan Selesai",
			value: layananSelesai,
			sublabel: "Total diselesaikan",
		},
		{
			label: "Total Penduduk",
			value: totalPenduduk,
			sublabel: `${totalKK} kepala keluarga`,
		},
	];
}

async function fetchSuratTrend(): Promise<WallBeranda["suratTrend"]> {
	const rows = await prisma.$queryRaw<{ month: string; count: number }[]>`
		SELECT
			TO_CHAR("createdAt", 'Mon') AS month,
			COUNT(*)::INTEGER AS count
		FROM service_letter
		WHERE "createdAt" > NOW() - INTERVAL '7 months'
		GROUP BY month, EXTRACT(MONTH FROM "createdAt")
		ORDER BY EXTRACT(MONTH FROM "createdAt") ASC
	`;
	return rows.map((r) => ({ month: r.month, count: Number(r.count) }));
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
	return withCache(`apbdes:${APBDES_ID}`, TTL.APBDES, async () => {
		const baseUrl =
			process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
		const response = await fetch(
			`${baseUrl}/api/landingpage/apbdes/${APBDES_ID}`,
		);
		if (!response.ok) throw new Error(`Desa API error: ${response.status}`);
		const json = await response.json();
		const apbdesData = json.data || json;

		if (apbdesData?.items && Array.isArray(apbdesData.items)) {
			const grouped: Record<
				string,
				{ totalAnggaran: number; totalRealisasi: number }
			> = {};
			for (const item of apbdesData.items) {
				const tipe = item.tipe?.toLowerCase() || "lainnya";
				if (!grouped[tipe])
					grouped[tipe] = { totalAnggaran: 0, totalRealisasi: 0 };
				if (item.level === 1) grouped[tipe].totalAnggaran += item.anggaran || 0;
				const itemRealisasi = (item.realisasiItems ?? []).reduce(
					(acc: number, r: any) => acc + (r.jumlah || 0),
					0,
				);
				grouped[tipe].totalRealisasi += itemRealisasi;
			}
			return Object.entries(grouped)
				.filter(([tipe]) => tipe !== "lainnya")
				.map(([tipe, stats]) => ({
					category: tipe.charAt(0).toUpperCase() + tipe.slice(1),
					anggaran: stats.totalAnggaran,
					realisasi: stats.totalRealisasi,
					percentage:
						stats.totalAnggaran > 0
							? (stats.totalRealisasi / stats.totalAnggaran) * 100
							: 0,
					color: APBDES_COLOR_MAP[tipe] ?? "#6B7280",
				}));
		}

		if (Array.isArray(apbdesData)) {
			return apbdesData.map((item: any) => ({
				category: item.category || "Unknown",
				anggaran: item.anggaran || 0,
				realisasi: item.realisasi || 0,
				percentage: item.percentage || 0,
				color: item.color || "#3B82F6",
			}));
		}

		return [];
	});
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
