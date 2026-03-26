import Elysia from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const event = new Elysia({
	prefix: "/event",
})
	.get(
		"/",
		async ({ set }) => {
			try {
				const events = await prisma.event.findMany({
					orderBy: { startDate: "asc" },
					take: 20,
				});
				return { data: events };
			} catch (error) {
				logger.error({ error }, "Failed to fetch events");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get upcoming events" },
		},
	)
	.get(
		"/today",
		async ({ set }) => {
			try {
				const start = new Date();
				start.setHours(0, 0, 0, 0);
				const end = new Date();
				end.setHours(23, 59, 59, 999);

				const events = await prisma.event.findMany({
					where: {
						startDate: {
							gte: start,
							lte: end,
						},
					},
				});
				return { data: events };
			} catch (error) {
				logger.error({ error }, "Failed to fetch today's events");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get events for today" },
		},
	);
