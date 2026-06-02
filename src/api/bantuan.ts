import Elysia from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const bantuanApi = new Elysia({ prefix: "/bantuan" }).get(
	"/faq",
	async ({ set }) => {
		try {
			const faqs = await prisma.faq.findMany({
				where: { isPublished: true },
				orderBy: [{ category: "asc" }, { order: "asc" }],
				select: {
					id: true,
					question: true,
					answer: true,
					category: true,
					order: true,
				},
			});
			return { data: faqs };
		} catch (error) {
			logger.error({ error }, "Failed to fetch public FAQs");
			set.status = 500;
			return { error: "Gagal memuat FAQ" };
		}
	},
);
