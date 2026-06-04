import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const adminFaqApi = new Elysia({ prefix: "/admin/faq" })
	.use(apiMiddleware)

	.get("/", async ({ set, user }) => {
		if (!user || user.role !== "admin") {
			set.status = 401;
			return { error: "Unauthorized" };
		}
		try {
			const faqs = await prisma.faq.findMany({
				orderBy: [{ category: "asc" }, { order: "asc" }],
			});
			return { data: faqs };
		} catch (error) {
			// P2021 = table not found (migration belum diapply)
			if ((error as { code?: string })?.code === "P2021") {
				return { data: [] };
			}
			logger.error({ error }, "Failed to fetch admin FAQs");
			set.status = 500;
			return { error: "Gagal memuat FAQ" };
		}
	})

	.post(
		"/",
		async ({ body, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}
			try {
				const maxOrder = await prisma.faq.aggregate({
					where: { category: body.category },
					_max: { order: true },
				});
				const faq = await prisma.faq.create({
					data: {
						question: body.question,
						answer: body.answer,
						category: body.category,
						order: (maxOrder._max.order ?? -1) + 1,
						isPublished: body.isPublished ?? true,
					},
				});
				return { data: faq };
			} catch (error) {
				logger.error({ error }, "Failed to create FAQ");
				set.status = 500;
				return { error: "Gagal membuat FAQ" };
			}
		},
		{
			body: t.Object({
				question: t.String({ minLength: 1 }),
				answer: t.String({ minLength: 1 }),
				category: t.String({ minLength: 1 }),
				isPublished: t.Optional(t.Boolean()),
			}),
		},
	)

	.put(
		"/:id",
		async ({ params, body, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}
			try {
				const faq = await prisma.faq.update({
					where: { id: params.id },
					data: {
						question: body.question,
						answer: body.answer,
						category: body.category,
						isPublished: body.isPublished,
					},
				});
				return { data: faq };
			} catch (error) {
				logger.error({ error, id: params.id }, "Failed to update FAQ");
				set.status = 500;
				return { error: "Gagal memperbarui FAQ" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				question: t.String({ minLength: 1 }),
				answer: t.String({ minLength: 1 }),
				category: t.String({ minLength: 1 }),
				isPublished: t.Boolean(),
			}),
		},
	)

	.patch(
		"/:id/toggle",
		async ({ params, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}
			try {
				const current = await prisma.faq.findUnique({
					where: { id: params.id },
					select: { isPublished: true },
				});
				if (!current) {
					set.status = 404;
					return { error: "FAQ tidak ditemukan" };
				}
				const faq = await prisma.faq.update({
					where: { id: params.id },
					data: { isPublished: !current.isPublished },
				});
				return { data: faq };
			} catch (error) {
				logger.error({ error, id: params.id }, "Failed to toggle FAQ");
				set.status = 500;
				return { error: "Gagal mengubah status FAQ" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
		},
	)

	.delete(
		"/:id",
		async ({ params, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}
			try {
				await prisma.faq.delete({ where: { id: params.id } });
				return { success: true };
			} catch (error) {
				logger.error({ error, id: params.id }, "Failed to delete FAQ");
				set.status = 500;
				return { error: "Gagal menghapus FAQ" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
		},
	)

	.put(
		"/reorder",
		async ({ body, set, user }) => {
			if (!user || user.role !== "admin") {
				set.status = 401;
				return { error: "Unauthorized" };
			}
			try {
				await prisma.$transaction(
					body.items.map(({ id, order }) =>
						prisma.faq.update({ where: { id }, data: { order } }),
					),
				);
				return { success: true };
			} catch (error) {
				logger.error({ error }, "Failed to reorder FAQs");
				set.status = 500;
				return { error: "Gagal menyimpan urutan FAQ" };
			}
		},
		{
			body: t.Object({
				items: t.Array(t.Object({ id: t.String(), order: t.Number() })),
			}),
		},
	);
