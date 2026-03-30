import { Elysia, t } from "elysia";
import { prisma } from "../utils/db";
import { $ } from "bun";

export const noc = new Elysia({ prefix: "/noc" })
	.post(
		"/sync",
		async ({ set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}

			try {
				// Jalankan script sinkronisasi
				await $`bun run sync:noc`.quiet();
				return {
					success: true,
					message: "Sinkronisasi berhasil diselesaikan",
					lastSyncedAt: new Date().toISOString(),
				};
			} catch (error) {
				return { success: false, error: "Sinkronisasi gagal dijalankan" };
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.Optional(t.String()),
					error: t.Optional(t.String()),
					lastSyncedAt: t.Optional(t.String()),
				}),
				401: t.Object({ error: t.String() }),
			},
		},
	)
	.get(
		"/last-sync",
		async ({ query }) => {
			const { idDesa } = query;
			const latest = await prisma.division.findFirst({
				where: { villageId: idDesa },
				select: { lastSyncedAt: true },
				orderBy: { lastSyncedAt: "desc" },
			});

			return { lastSyncedAt: latest?.lastSyncedAt?.toISOString() || null };
		},
		{
			query: t.Object({ idDesa: t.String() }),
			response: {
				200: t.Object({
					lastSyncedAt: t.Nullable(t.String()),
				}),
			},
		},
	)
	.get(
		"/active-divisions",
		async ({ query }) => {
			const { idDesa, limit } = query;
			const data = await prisma.division.findMany({
				where: { villageId: idDesa },
				include: {
					_count: {
						select: { activities: true },
					},
				},
				orderBy: {
					activities: {
						_count: "desc",
					},
				},
				take: limit ? Number.parseInt(limit) : 5,
			});

			return {
				data: data.map((d) => ({
					id: d.id,
					name: d.name,
					activityCount: d._count.activities,
					color: d.color,
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							name: t.String(),
							activityCount: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/latest-projects",
		async ({ query }) => {
			const { idDesa, limit } = query;
			const data = await prisma.activity.findMany({
				where: { villageId: idDesa },
				orderBy: { createdAt: "desc" },
				take: limit ? Number.parseInt(limit) : 5,
				include: { division: true },
			});

			return {
				data: data.map((a) => ({
					id: a.id,
					title: a.title,
					status: a.status,
					progress: a.progress,
					divisionName: a.division.name,
					createdAt: a.createdAt.toISOString(),
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							title: t.String(),
							status: t.String(),
							progress: t.Number(),
							divisionName: t.String(),
							createdAt: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/upcoming-events",
		async ({ query }) => {
			const { idDesa, limit, filter } = query;
			const now = new Date();
			const where: any = { villageId: idDesa };

			if (filter === "today") {
				const startOfDay = new Date(now.setHours(0, 0, 0, 0));
				const endOfDay = new Date(now.setHours(23, 59, 59, 999));
				where.startDate = {
					gte: startOfDay,
					lte: endOfDay,
				};
			} else {
				where.startDate = {
					gte: now,
				};
			}

			const data = await prisma.event.findMany({
				where,
				orderBy: { startDate: "asc" },
				take: limit ? Number.parseInt(limit) : 5,
			});

			return {
				data: data.map((e) => ({
					id: e.id,
					title: e.title,
					startDate: e.startDate.toISOString(),
					location: e.location,
					eventType: e.eventType,
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
				filter: t.Optional(t.String()), // today/upcoming
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							title: t.String(),
							startDate: t.String(),
							location: t.Nullable(t.String()),
							eventType: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/diagram-jumlah-document",
		async ({ query }) => {
			const { idDesa } = query;
			const data = await prisma.document.groupBy({
				where: { villageId: idDesa },
				by: ["category"],
				_count: {
					_all: true,
				},
			});

			return {
				data: data.map((d) => ({
					category: d.category,
					count: d._count._all,
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							category: t.String(),
							count: t.Number(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/diagram-progres-kegiatan",
		async ({ query }) => {
			const { idDesa } = query;
			const data = await prisma.activity.groupBy({
				where: { villageId: idDesa },
				by: ["status"],
				_avg: {
					progress: true,
				},
				_count: {
					_all: true,
				},
			});

			return {
				data: data.map((d) => ({
					status: d.status,
					avgProgress: d._avg.progress || 0,
					count: d._count._all,
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							status: t.String(),
							avgProgress: t.Number(),
							count: t.Number(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/latest-discussion",
		async ({ query }) => {
			const { idDesa, limit } = query;
			const data = await prisma.discussion.findMany({
				where: { villageId: idDesa },
				orderBy: { createdAt: "desc" },
				take: limit ? Number.parseInt(limit) : 5,
				include: {
					sender: {
						select: { name: true, image: true },
					},
					division: {
						select: { name: true },
					},
				},
			});

			return {
				data: data.map((d) => ({
					id: d.id,
					message: d.message,
					senderName: d.sender.name || "Anonymous",
					senderImage: d.sender.image,
					divisionName: d.division?.name || "General",
					createdAt: d.createdAt.toISOString(),
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							message: t.String(),
							senderName: t.String(),
							senderImage: t.Nullable(t.String()),
							divisionName: t.String(),
							createdAt: t.String(),
						}),
					),
				}),
			},
		},
	);
