import { Prisma } from "generated/prisma";
import { Elysia, t } from "elysia";
import { prisma } from "@/utils/db";

export const sosial = new Elysia({ prefix: "/sosial" })
	.get("/banjars", async () => {
		try {
			const data = await prisma.banjar.findMany({
				select: { id: true, name: true },
				orderBy: { name: "asc" },
			});
			return { success: true, data };
		} catch (error) {
			console.error("[Sosial API] Banjars error:", error);
			return { success: false, error: "Gagal memuat data banjar", data: null };
		}
	})
	.get(
		"/health-records",
		async ({ query }) => {
			try {
				const { banjarId, tahun, page = 1, limit = 20 } = query;

				const where: Prisma.HealthRecordWhereInput = {};

				if (banjarId) {
					where.resident = { banjarId };
				}

				if (tahun) {
					const year = Number.parseInt(tahun, 10);
					where.createdAt = {
						gte: new Date(`${year}-01-01`),
						lt: new Date(`${year + 1}-01-01`),
					};
				}

				const [data, total] = await Promise.all([
					prisma.healthRecord.findMany({
						where,
						include: {
							resident: {
								select: {
									name: true,
									banjar: { select: { name: true } },
								},
							},
						},
						orderBy: { createdAt: "desc" },
						skip: (page - 1) * limit,
						take: limit,
					}),
					prisma.healthRecord.count({ where }),
				]);

				return {
					success: true,
					data,
					pagination: {
						total,
						page,
						limit,
						totalPages: Math.ceil(total / limit),
					},
				};
			} catch (error) {
				console.error("[Sosial API] Health records error:", error);
				return {
					success: false,
					error: "Gagal memuat data rekam medis",
					data: null,
					pagination: null,
				};
			}
		},
		{
			query: t.Object({
				banjarId: t.Optional(t.String()),
				tahun: t.Optional(t.String()),
				page: t.Optional(t.Number({ minimum: 1 })),
				limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
			}),
		},
	);
