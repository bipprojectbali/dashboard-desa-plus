import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

// Data UMKM lokal dari DB sendiri.
// Berbeda dari data UMKM external yang diambil dari Desa API
// (VITE_DESA_API_URL/api/umkm/...) — data ini dikelola langsung oleh perangkat desa.
export const umkm = new Elysia({
	prefix: "/umkm",
})
	.get(
		"/lokal",
		async ({ query, set }) => {
			try {
				const take = Math.min(Number(query.limit ?? 20), 100);
				const skip = Number(query.offset ?? 0);

				const [items, total] = await Promise.all([
					prisma.umkm.findMany({
						orderBy: { createdAt: "desc" },
						take,
						skip,
						include: {
							banjar: {
								select: { id: true, name: true },
							},
						},
					}),
					prisma.umkm.count(),
				]);

				return { data: { items, total, limit: take, offset: skip } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch local UMKM data");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
				banjarId: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary:
					"Get locally managed UMKM data from DB (bukan dari external API)",
			},
		},
	)
	.post(
		"/lokal",
		async ({ body, set }) => {
			try {
				const item = await prisma.umkm.create({
					data: {
						name: body.name,
						owner: body.owner,
						productType: body.productType ?? null,
						description: body.description ?? null,
						banjarId: body.banjarId ?? null,
					},
				});
				return { data: item };
			} catch (error) {
				logger.error({ error }, "Failed to create local UMKM entry");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				owner: t.String({ minLength: 1 }),
				productType: t.Optional(t.String()),
				description: t.Optional(t.String()),
				banjarId: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Add a new locally managed UMKM entry" },
		},
	)
	.put(
		"/lokal/:id",
		async ({ params, body, set }) => {
			try {
				const item = await prisma.umkm.update({
					where: { id: params.id },
					data: {
						name: body.name,
						owner: body.owner,
						productType: body.productType ?? null,
						description: body.description ?? null,
						banjarId: body.banjarId ?? null,
					},
				});
				return { data: item };
			} catch (error) {
				logger.error({ error }, "Failed to update local UMKM entry");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
			body: t.Object({
				name: t.String({ minLength: 1 }),
				owner: t.String({ minLength: 1 }),
				productType: t.Optional(t.String()),
				description: t.Optional(t.String()),
				banjarId: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Update a locally managed UMKM entry" },
		},
	)
	.delete(
		"/lokal/:id",
		async ({ params, set }) => {
			try {
				await prisma.umkm.delete({ where: { id: params.id } });
				return { data: { deleted: true } };
			} catch (error) {
				logger.error({ error }, "Failed to delete local UMKM entry");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Delete a locally managed UMKM entry" },
		},
	)
	.get(
		"/lokal/stats",
		async ({ set }) => {
			try {
				const [total, perBanjar] = await Promise.all([
					prisma.umkm.count(),
					prisma.umkm.groupBy({
						by: ["banjarId"],
						_count: { _all: true },
					}),
				]);
				return { data: { total, perBanjar } };
			} catch (error) {
				logger.error({ error }, "Failed to fetch local UMKM stats");
				set.status = 500;
				return { error: "Internal Server Error" };
			}
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get stats for locally managed UMKM" },
		},
	);
