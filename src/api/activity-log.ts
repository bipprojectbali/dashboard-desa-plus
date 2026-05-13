import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const activityLog = new Elysia({ prefix: "/activity-log" })
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set, user, query }) => {
			try {
				const page = Number(query.page ?? 1);
				const limit = Math.min(Number(query.limit ?? 50), 200);
				const skip = (page - 1) * limit;

				const [logs, total] = await Promise.all([
					prisma.activityLog.findMany({
						where: { userId: user?.id },
						orderBy: { createdAt: "desc" },
						skip,
						take: limit,
						select: {
							id: true,
							action: true,
							detail: true,
							ipAddress: true,
							userAgent: true,
							createdAt: true,
						},
					}),
					prisma.activityLog.count({ where: { userId: user?.id } }),
				]);

				return { data: logs, total, page, limit };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to get activity logs",
				);
				set.status = 500;
				return { error: "Failed to get logs" };
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
			detail: { summary: "Get activity logs for current user" },
		},
	)
	.post(
		"/",
		async ({ body, set, user, request }) => {
			try {
				const pref = await prisma.keamananPreference.findUnique({
					where: { userId: user?.id },
					select: { logAktivitas: true },
				});

				if (pref?.logAktivitas === false) {
					return { data: null };
				}

				const ip =
					request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
					request.headers.get("x-real-ip") ??
					null;

				const log = await prisma.activityLog.create({
					data: {
						userId: user?.id ?? "",
						action: body.action,
						detail: body.detail ?? null,
						ipAddress: ip,
						userAgent: request.headers.get("user-agent"),
					},
				});
				return { data: log };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to create activity log",
				);
				set.status = 500;
				return { error: "Failed to log activity" };
			}
		},
		{
			body: t.Object({
				action: t.String(),
				detail: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Log an activity for current user" },
		},
	)
	.get(
		"/export",
		async ({ set, user }) => {
			try {
				const logs = await prisma.activityLog.findMany({
					where: { userId: user?.id },
					orderBy: { createdAt: "desc" },
					take: 1000,
					select: {
						action: true,
						detail: true,
						ipAddress: true,
						userAgent: true,
						createdAt: true,
					},
				});

				const header = "Waktu,Aksi,Detail,IP,User Agent\n";
				const rows = logs
					.map((l) =>
						[
							new Date(l.createdAt).toISOString(),
							`"${l.action}"`,
							`"${(l.detail ?? "").replace(/"/g, '""')}"`,
							l.ipAddress ?? "",
							`"${(l.userAgent ?? "").replace(/"/g, '""')}"`,
						].join(","),
					)
					.join("\n");

				const csv = header + rows;

				return new Response(csv, {
					headers: {
						"Content-Type": "text/csv; charset=utf-8",
						"Content-Disposition": `attachment; filename="activity-log-${new Date().toISOString().slice(0, 10)}.csv"`,
					},
				});
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to export activity logs",
				);
				set.status = 500;
				return { error: "Failed to export" };
			}
		},
		{
			detail: { summary: "Export activity logs as CSV" },
		},
	);
