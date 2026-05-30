import { Elysia, t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";

export const syncLog = new Elysia({ prefix: "/admin/sync" })
	.use(apiMiddleware)
	.get(
		"/logs",
		async ({ query, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}

			const { type, limit } = query;
			const take = limit ? Math.min(Number.parseInt(limit, 10), 200) : 50;

			const logs = await prisma.syncLog.findMany({
				where: type ? { type } : undefined,
				orderBy: { startedAt: "desc" },
				take,
			});

			return {
				data: logs.map((l) => ({
					id: l.id,
					type: l.type,
					status: l.status,
					triggeredBy: l.triggeredBy,
					durationMs: l.durationMs,
					recordsAffected: l.recordsAffected,
					errorMessage: l.errorMessage,
					startedAt: l.startedAt.toISOString(),
				})),
			};
		},
		{
			query: t.Object({
				type: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
		},
	);
