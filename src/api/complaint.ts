import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";
import { TTL, withCache } from "../utils/cache";
import { platformFetch } from "../utils/platform-external-client";
import {
	EMPTY_COMPLAINT_STATS,
	countSuratWeekly,
	mapComplaintStats,
	mapSuratTrends,
	type PlatformLaporan,
	type PlatformSurat,
} from "./complaint-platform";

export const complaint = new Elysia({
	prefix: "/complaint",
})
	.get(
		"/stats",
		async ({ set }) => {
			try {
				const data = await withCache(
					"dashboard:complaint:stats",
					TTL.DASHBOARD,
					async () => {
						const json =
							await platformFetch<PlatformLaporan>("/api/noc/laporan?limit=1000");
						return mapComplaintStats(json.data, json.total);
					},
				);
				return { data };
			} catch (error) {
				logger.error({ error }, "Failed to fetch complaint stats from platform");
				set.status = 500;
				return { data: EMPTY_COMPLAINT_STATS };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						total: t.Number(),
						baru: t.Number(),
						selesai: t.Number(),
						ditolak: t.Number(),
					}),
				}),
				500: t.Object({
					data: t.Object({
						total: t.Number(),
						baru: t.Number(),
						selesai: t.Number(),
						ditolak: t.Number(),
					}),
				}),
			},
			detail: { summary: "Get complaint statistics (live platform)" },
		},
	)
	.get(
		"/recent",
		async ({ query, set }) => {
			try {
				const page = Math.max(1, Number(query.page ?? 1));
				const limit = Math.min(Math.max(1, Number(query.limit ?? 5)), 100);
				const skip = (page - 1) * limit;

				const [recent, total] = await Promise.all([
					prisma.complaint.findMany({
						orderBy: { createdAt: "desc" },
						take: limit,
						skip,
					}),
					prisma.complaint.count(),
				]);

				return { data: recent, total, page, limit };
			} catch (error) {
				logger.error({ error }, "Failed to fetch recent complaints");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(t.Any()),
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Get recent complaints (paginated, default 5 per page)",
			},
		},
	)
	.get(
		"/trends",
		async ({ set }) => {
			try {
				// Get last 7 months complaint trends
				const trends = await prisma.$queryRaw<
					{ month: string; month_num: number; count: number }[]
				>`
					SELECT 
						TO_CHAR("createdAt", 'Mon') as month,
						EXTRACT(MONTH FROM "createdAt") as month_num,
						COUNT(*)::INTEGER as count
					FROM complaint
					WHERE "createdAt" > NOW() - INTERVAL '7 months'
					GROUP BY month, month_num
					ORDER BY month_num ASC
				`;
				return { data: trends };
			} catch (error) {
				logger.error({ error }, "Failed to fetch complaint trends");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(t.Any()),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get complaint trends for last 7 months" },
		},
	)
	.get(
		"/service-stats",
		async ({ set }) => {
			try {
				const serviceStats = await prisma.serviceLetter.groupBy({
					by: ["letterType"],
					_count: { _all: true },
				});
				return { data: serviceStats };
			} catch (error) {
				logger.error({ error }, "Failed to fetch service stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(t.Any()),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get service letter statistics by type" },
		},
	)
	.get(
		"/innovation-ideas",
		async ({ set }) => {
			try {
				const ideas = await prisma.innovationIdea.findMany({
					orderBy: { createdAt: "desc" },
					take: 5,
				});
				return { data: ideas };
			} catch (error) {
				logger.error({ error }, "Failed to fetch innovation ideas");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(t.Any()),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get recent innovation ideas" },
		},
	)
	.get(
		"/service-trends",
		async ({ set }) => {
			try {
				const data = await withCache(
					"dashboard:surat:trends",
					TTL.DASHBOARD,
					async () => {
						const json =
							await platformFetch<PlatformSurat>("/api/noc/surat?limit=1000");
						return mapSuratTrends(json.data);
					},
				);
				return { data };
			} catch (error) {
				logger.error({ error }, "Failed to fetch surat trends from platform");
				set.status = 500;
				return { data: [] };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({ month: t.String(), count: t.Number() }),
					),
				}),
				500: t.Object({ data: t.Array(t.Any()) }),
			},
			detail: { summary: "Get surat trends per month (live platform)" },
		},
	)
	.get(
		"/export",
		async ({ set }) => {
			try {
				const data = await prisma.complaint.findMany({
					orderBy: { createdAt: "desc" },
				});

				const { buildPdfTable } = await import("../utils/pdf-table");

				const buffer = await buildPdfTable({
					title: "Laporan Pengaduan Layanan Publik",
					columns: [
						{ header: "Judul", key: "title", width: 180 },
						{ header: "Kategori", key: "category", width: 120 },
						{ header: "Status", key: "status", width: 80 },
						{ header: "Tanggal", key: "createdAt", width: 95 },
					],
					rows: data.map((c) => ({
						title: c.title,
						category: c.category,
						status: c.status,
						createdAt: new Date(c.createdAt).toLocaleDateString("id-ID"),
					})),
				});

				const ab = buffer.buffer.slice(
					buffer.byteOffset,
					buffer.byteOffset + buffer.byteLength,
				) as ArrayBuffer;
				return new Response(ab, {
					headers: {
						"Content-Type": "application/pdf",
						"Content-Disposition": `attachment; filename="pengaduan-${new Date().toISOString().slice(0, 10)}.pdf"`,
					},
				});
			} catch (error) {
				logger.error({ error }, "Failed to export complaints");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Export all complaints as PDF" },
		},
	)
	.get(
		"/service-weekly",
		async ({ set }) => {
			try {
				const data = await withCache(
					"dashboard:surat:weekly",
					TTL.DASHBOARD,
					async () => {
						const json =
							await platformFetch<PlatformSurat>("/api/noc/surat?limit=1000");
						return { count: countSuratWeekly(json.data) };
					},
				);
				return { data };
			} catch (error) {
				logger.error({ error }, "Failed to fetch weekly surat from platform");
				set.status = 500;
				return { data: { count: 0 } };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						count: t.Number(),
					}),
				}),
				500: t.Object({ data: t.Object({ count: t.Number() }) }),
			},
			detail: { summary: "Get surat count for current week (live platform)" },
		},
	);
