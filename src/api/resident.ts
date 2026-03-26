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
				const [religion, gender, occupation, ageGroups] = await Promise.all([
					prisma.resident.groupBy({
						by: ["religion"],
						_count: { _all: true },
					}),
					prisma.resident.groupBy({
						by: ["gender"],
						_count: { _all: true },
					}),
					prisma.resident.groupBy({
						by: ["occupation"],
						_count: { _all: true },
						orderBy: { _count: { occupation: "desc" } },
						take: 10,
					}),
					// Group by age ranges (simplified calculation)
					prisma.$queryRaw<any[]>`
						SELECT 
							CASE 
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 0 AND 16 THEN '0-16'
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 17 AND 25 THEN '17-25'
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 26 AND 35 THEN '26-35'
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 36 AND 45 THEN '36-45'
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 46 AND 55 THEN '46-55'
								WHEN date_part('year', age(now(), "birthDate")) BETWEEN 56 AND 65 THEN '56-65'
								ELSE '65+' 
							END as range,
							COUNT(*) as count
						FROM resident
						GROUP BY range
						ORDER BY range ASC
					`,
				]);
				return { data: { religion, gender, occupation, ageGroups } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch demographics");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: {
				summary:
					"Get demographics including religion, gender, occupation and age",
			},
		},
	);
