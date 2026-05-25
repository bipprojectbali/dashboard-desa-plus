import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

// Route berbeda dari /api/keamanan-preferences (preferensi user).
// File ini mengelola SecurityReport yang disimpan di DB lokal,
// melengkapi data laporan publik dari external Desa API.
export const keamanan = new Elysia({
	prefix: "/keamanan",
})
	.get(
		"/laporan-lokal",
		async ({ query, set }) => {
			try {
				const take = Math.min(Number(query.limit ?? 20), 100);
				const skip = Number(query.offset ?? 0);

				const [items, total] = await Promise.all([
					prisma.securityReport.findMany({
						orderBy: { createdAt: "desc" },
						take,
						skip,
						select: {
							id: true,
							reportNumber: true,
							title: true,
							description: true,
							location: true,
							reportedBy: true,
							status: true,
							assignedTo: true,
							createdAt: true,
							updatedAt: true,
						},
					}),
					prisma.securityReport.count(),
				]);

				return { data: { items, total, limit: take, offset: skip } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch local security reports");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
				status: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Get local security reports from DB (melengkapi external API)",
			},
		},
	)
	.post(
		"/laporan-lokal",
		async ({ body, set }) => {
			try {
				const reportNumber = `RPT-${Date.now()}`;

				const report = await prisma.securityReport.create({
					data: {
						reportNumber,
						title: body.title,
						description: body.description,
						location: body.location ?? null,
						reportedBy: body.reportedBy,
						status: "BARU",
						assignedTo: body.assignedTo ?? null,
					},
				});

				return { data: report };
			} catch (error) {
				logger.error({ error }, "Failed to create local security report");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				description: t.String({ minLength: 1 }),
				location: t.Optional(t.String()),
				reportedBy: t.String({ minLength: 1 }),
				assignedTo: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Create a new local security report" },
		},
	)
	.patch(
		"/laporan-lokal/:id/status",
		async ({ params, body, set }) => {
			try {
				const report = await prisma.securityReport.update({
					where: { id: params.id },
					data: { status: body.status },
				});
				return { data: report };
			} catch (error) {
				logger.error({ error }, "Failed to update security report status");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				status: t.Union([
					t.Literal("BARU"),
					t.Literal("DIPROSES"),
					t.Literal("SELESAI"),
				]),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Update security report status" },
		},
	)
	.get(
		"/laporan-lokal/stats",
		async ({ set }) => {
			try {
				const [total, baru, diproses, selesai] = await Promise.all([
					prisma.securityReport.count(),
					prisma.securityReport.count({ where: { status: "BARU" } }),
					prisma.securityReport.count({ where: { status: "DIPROSES" } }),
					prisma.securityReport.count({ where: { status: "SELESAI" } }),
				]);
				return { data: { total, baru, diproses, selesai } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch security report stats");
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
						diproses: t.Number(),
						selesai: t.Number(),
					}),
				}),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get stats for local security reports" },
		},
	);
