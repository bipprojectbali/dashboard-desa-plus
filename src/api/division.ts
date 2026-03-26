import Elysia, { t } from "elysia";
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
				return { data: divisions };
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
		async ({ set }) => {
			try {
				const activities = await prisma.activity.findMany({
					include: {
						division: {
							select: { name: true, color: true },
						},
					},
					orderBy: { createdAt: "desc" },
					take: 10,
				});
				return { data: activities };
			} catch (error) {
				logger.error({ error }, "Failed to fetch activities");
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
			detail: { summary: "Get recent activities" },
		},
	)
	.get(
		"/metrics",
		async ({ set }) => {
			try {
				const metrics = await prisma.divisionMetric.findMany({
					include: { division: true },
				});
				return { data: metrics };
			} catch (error) {
				logger.error({ error }, "Failed to fetch division metrics");
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
			detail: { summary: "Get division performance metrics" },
		},
	);
