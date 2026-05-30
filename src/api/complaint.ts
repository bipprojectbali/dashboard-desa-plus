import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const complaint = new Elysia({
	prefix: "/complaint",
})
	.get(
		"/stats",
		async ({ set }) => {
			try {
				const [total, baru, proses, selesai] = await Promise.all([
					prisma.complaint.count(),
					prisma.complaint.count({ where: { status: "BARU" } }),
					prisma.complaint.count({ where: { status: "DIPROSES" } }),
					prisma.complaint.count({ where: { status: "SELESAI" } }),
				]);
				return { data: { total, baru, proses, selesai } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch complaint stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						total: t.Number(),
						baru: t.Number(),
						proses: t.Number(),
						selesai: t.Number(),
					}),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get complaint statistics" },
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
				// Get last 6 months trends for service letters
				const trends = await prisma.$queryRaw<
					{ month: string; month_num: number; count: number }[]
				>`
					SELECT 
						TO_CHAR("createdAt", 'Mon') as month,
						EXTRACT(MONTH FROM "createdAt") as month_num,
						COUNT(*)::INTEGER as count
					FROM service_letter
					WHERE "createdAt" > NOW() - INTERVAL '6 months'
					GROUP BY month, month_num
					ORDER BY month_num ASC
				`;
				return { data: trends };
			} catch (error) {
				logger.error({ error }, "Failed to fetch service trends");
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
			detail: { summary: "Get service letter trends for last 6 months" },
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
				const startOfWeek = new Date();
				startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
				startOfWeek.setHours(0, 0, 0, 0);

				const count = await prisma.serviceLetter.count({
					where: {
						createdAt: {
							gte: startOfWeek,
						},
					},
				});
				return { data: { count } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch weekly service stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						count: t.Number(),
					}),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get service letter count for current week" },
		},
	);
