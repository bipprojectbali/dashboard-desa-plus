import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";
import { computeSystemStats } from "../utils/system-health";

export const systemStatsRoutes = new Elysia()
	.use(apiMiddleware)
	.get("/system/stats", async ({ user }) => {
		const health = await computeSystemStats();

		const failed: string[] = [];
		if (!health.db.ok) failed.push("db");
		if (!health.desaApi.ok) failed.push("desa-api");
		if (!health.nocApi.ok) failed.push("noc-api");

		// Log ke ActivityLog jika ada komponen yang gagal (skip jika DB down)
		if (failed.length > 0 && user?.id && health.db.ok) {
			try {
				await prisma.activityLog.create({
					data: {
						userId: user.id,
						action: "health-check-failed",
						detail: JSON.stringify({ failed }),
					},
				});
			} catch (e) {
				logger.warn(
					{ e },
					"Failed to write health check failure to ActivityLog",
				);
			}
		}

		return { data: health };
	});
