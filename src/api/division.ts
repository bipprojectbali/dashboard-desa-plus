import Elysia, { t } from "elysia";
import { CHART } from "../theme";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const division = new Elysia({
	prefix: "/division",
})
	.get(
		"/",
		async ({ set }) => {
			try {
				const divisions = await prisma.division.findMany({
					include: {
						_count: {
							select: { activities: true },
						},
					},
				});
				return {
					data: divisions.map((d) => ({
						...d,
						activityCount: d.externalActivityCount || d._count.activities,
					})),
				};
			} catch (error) {
				logger.error({ error }, "Failed to fetch divisions");
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
			detail: { summary: "Get all divisions" },
		},
	)
	.get(
		"/activities",
		async ({ query, set }) => {
			try {
				const page = Math.max(1, Number(query.page ?? 1));
				const limit = Math.min(Math.max(1, Number(query.limit ?? 5)), 100);
				const skip = (page - 1) * limit;

				const [activities, total] = await Promise.all([
					prisma.activity.findMany({
						include: {
							division: {
								select: { name: true, color: true },
							},
						},
						orderBy: { createdAt: "desc" },
						take: limit,
						skip,
					}),
					prisma.activity.count(),
				]);

				return { data: activities, total, page, limit };
			} catch (error) {
				logger.error({ error }, "Failed to fetch activities");
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
			detail: { summary: "Get activities (paginated, default 5 per page)" },
		},
	)
	.get(
		"/activities/stats",
		async ({ set }) => {
			try {
				// Get activity count by status
				const [selesai, berjalan, tertunda, dibatalkan] = await Promise.all([
					prisma.activity.count({ where: { status: "SELESAI" } }),
					prisma.activity.count({ where: { status: "BERJALAN" } }),
					prisma.activity.count({ where: { status: "TERTUNDA" } }),
					prisma.activity.count({ where: { status: "DIBATALKAN" } }),
				]);

				const total = selesai + berjalan + tertunda + dibatalkan;

				// Calculate percentages
				const percentages = {
					selesai: total > 0 ? (selesai / total) * 100 : 0,
					berjalan: total > 0 ? (berjalan / total) * 100 : 0,
					tertunda: total > 0 ? (tertunda / total) * 100 : 0,
					dibatalkan: total > 0 ? (dibatalkan / total) * 100 : 0,
				};

				return {
					data: {
						total,
						counts: { selesai, berjalan, tertunda, dibatalkan },
						percentages,
					},
				};
			} catch (error) {
				logger.error({ error }, "Failed to fetch activity stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Object({
						total: t.Number(),
						counts: t.Object({
							selesai: t.Number(),
							berjalan: t.Number(),
							tertunda: t.Number(),
							dibatalkan: t.Number(),
						}),
						percentages: t.Object({
							selesai: t.Number(),
							berjalan: t.Number(),
							tertunda: t.Number(),
							dibatalkan: t.Number(),
						}),
					}),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get activity statistics by status" },
		},
	)
	.get(
		"/documents/stats",
		async ({ set }) => {
			try {
				// Group documents by type
				const [gambarCount, dokumenCount] = await Promise.all([
					prisma.document.count({ where: { type: "Gambar" } }),
					prisma.document.count({ where: { type: "Dokumen" } }),
				]);

				return {
					data: [
						{ name: "Gambar", jumlah: gambarCount, color: CHART.amber },
						{ name: "Dokumen", jumlah: dokumenCount, color: CHART.green },
					],
				};
			} catch (error) {
				logger.error({ error }, "Failed to fetch document stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							name: t.String(),
							jumlah: t.Number(),
							color: t.String(),
						}),
					),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get document statistics by type" },
		},
	)
	.get(
		"/discussions",
		async ({ query, set }) => {
			try {
				const page = Math.max(1, Number(query.page ?? 1));
				const limit = Math.min(Math.max(1, Number(query.limit ?? 5)), 100);
				const skip = (page - 1) * limit;

				const where = { parentId: null } as const;

				const [discussions, total] = await Promise.all([
					prisma.discussion.findMany({
						where,
						include: {
							sender: {
								select: { name: true, email: true },
							},
							division: {
								select: { name: true },
							},
						},
						orderBy: { createdAt: "desc" },
						take: limit,
						skip,
					}),
					prisma.discussion.count({ where }),
				]);

				const data = discussions.map((d) => ({
					id: d.id,
					message: d.message,
					sender: d.sender.name || d.sender.email,
					date: d.createdAt.toISOString(),
					division: d.division?.name || null,
					isResolved: d.isResolved,
				}));

				return { data, total, page, limit };
			} catch (error) {
				logger.error({ error }, "Failed to fetch discussions");
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
					data: t.Array(
						t.Object({
							id: t.String(),
							message: t.String(),
							sender: t.String(),
							date: t.String(),
							division: t.Nullable(t.String()),
							isResolved: t.Boolean(),
						}),
					),
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get discussions (paginated, default 5 per page)" },
		},
	);
