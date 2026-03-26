import Elysia from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const resident = new Elysia({
	prefix: "/resident",
})
	.get(
		"/stats",
		async ({ set }) => {
			try {
				const [total, heads, poor] = await Promise.all([
					prisma.resident.count(),
					prisma.resident.count({ where: { isHeadOfHousehold: true } }),
					prisma.resident.count({ where: { isPoor: true } }),
				]);
				return { data: { total, heads, poor } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch resident stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get resident statistics" },
		},
	)
	.get(
		"/banjar-stats",
		async ({ set }) => {
			try {
				const banjarStats = await prisma.banjar.findMany({
					select: {
						id: true,
						name: true,
						totalPopulation: true,
						totalKK: true,
						totalPoor: true,
					},
				});
				return { data: banjarStats };
			} catch (error) {
				logger.error({ error }, "Failed to fetch banjar stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get population data per banjar" },
		},
	)
	.get(
		"/demographics",
		async ({ set }) => {
			try {
				const [religion, gender] = await Promise.all([
					prisma.resident.groupBy({
						by: ["religion"],
						_count: { _all: true },
					}),
					prisma.resident.groupBy({
						by: ["gender"],
						_count: { _all: true },
					}),
				]);
				return { data: { religion, gender } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch demographics");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get religious and gender demographics" },
		},
	);
