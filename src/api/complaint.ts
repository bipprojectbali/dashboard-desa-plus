import Elysia from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const complaint = new Elysia({
	prefix: "/complaint",
})
	.get(
		"/stats",
		async ({ set }) => {
			try {
				const [total, baru, proses, selesai] = await Promise.all([
					prisma.complaint.count(),
					prisma.complaint.count({ where: { status: "BARU" } }),
					prisma.complaint.count({ where: { status: "DIPROSES" } }),
					prisma.complaint.count({ where: { status: "SELESAI" } }),
				]);
				return { data: { total, baru, proses, selesai } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch complaint stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get complaint statistics" },
		},
	)
	.get(
		"/recent",
		async ({ set }) => {
			try {
				const recent = await prisma.complaint.findMany({
					orderBy: { createdAt: "desc" },
					take: 10,
				});
				return { data: recent };
			} catch (error) {
				logger.error({ error }, "Failed to fetch recent complaints");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get recent complaints" },
		},
	)
	.get(
		"/service-stats",
		async ({ set }) => {
			try {
				const serviceStats = await prisma.serviceLetter.groupBy({
					by: ["letterType"],
					_count: { _all: true },
				});
				return { data: serviceStats };
			} catch (error) {
				logger.error({ error }, "Failed to fetch service stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get service letter statistics by type" },
		},
	)
	.get(
		"/innovation-ideas",
		async ({ set }) => {
			try {
				const ideas = await prisma.innovationIdea.findMany({
					orderBy: { createdAt: "desc" },
					take: 5,
				});
				return { data: ideas };
			} catch (error) {
				logger.error({ error }, "Failed to fetch innovation ideas");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			detail: { summary: "Get recent innovation ideas" },
		},
	);
