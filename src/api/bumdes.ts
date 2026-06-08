import Elysia, { t } from "elysia";
import { cache, TTL, withCache } from "../utils/cache";
import { desaExternalClient } from "../utils/desa-external-client";
import logger from "../utils/logger";

function extractError(err: unknown): string {
	if (!err) return "Unknown error";
	if (typeof err === "string") return err;
	const e = err as Record<string, unknown>;
	return String(e.error || e.message || JSON.stringify(err));
}

export const bumdes = new Elysia({ prefix: "/bumdes" })
	.get(
		"/kpi",
		async ({ query, set }) => {
			const period = query.period ?? "monthly";
			try {
				const data = await withCache(
					`bumdes:kpi:${period}`,
					TTL.BUMDES,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/umkm/dashboard/kpi",
							{ params: { query: { period } } },
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes kpi");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			query: t.Object({ period: t.Optional(t.String()) }),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.get(
		"/ringkasan-penjualan",
		async ({ query, set }) => {
			const period = query.period ?? "monthly";
			try {
				const data = await withCache(
					`bumdes:ringkasan:${period}`,
					TTL.BUMDES,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/umkm/dashboard/ringkasan-penjualan",
							{ params: { query: { period } } },
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes ringkasan penjualan");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			query: t.Object({ period: t.Optional(t.String()) }),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.get(
		"/top-produk",
		async ({ query, set }) => {
			const period = query.period ?? "monthly";
			try {
				const data = await withCache(
					`bumdes:top-produk:${period}`,
					TTL.BUMDES,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/umkm/dashboard/top-produk",
							{ params: { query: { period } } },
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes top produk");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			query: t.Object({ period: t.Optional(t.String()) }),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.get(
		"/detail-penjualan",
		async ({ query, set }) => {
			const period = query.period ?? "monthly";
			const kategoriId = query.kategoriId ?? "";
			const umkmId = query.umkmId ?? "";
			try {
				const cacheKey = `bumdes:detail:${period}:${kategoriId}:${umkmId}`;
				const data = await withCache(cacheKey, TTL.BUMDES, async () => {
					const response = await desaExternalClient.GET(
						"/api/ekonomi/umkm/dashboard/detail-penjualan",
						{
							params: {
								query: {
									period,
									kategoriId: kategoriId || undefined,
									umkmId: umkmId || undefined,
								},
							},
						},
					);
					if (response.error) throw new Error(extractError(response.error));
					return response.data?.data ?? null;
				});
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes detail penjualan");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			query: t.Object({
				period: t.Optional(t.String()),
				kategoriId: t.Optional(t.String()),
				umkmId: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.get(
		"/kategori",
		async ({ set }) => {
			try {
				const data = await withCache(
					"bumdes:kategori:list",
					TTL.BUMDES,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/kategoriproduk/find-many-all",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes kategori");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.get(
		"/umkm-list",
		async ({ set }) => {
			try {
				const data = await withCache(
					"bumdes:umkm:list",
					TTL.BUMDES,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/umkm/find-many-all",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy bumdes umkm list");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: null };
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
		},
	)
	.post(
		"/cache-invalidate",
		() => {
			const deleted = cache.deleteByPrefix("bumdes:");
			return { deleted };
		},
		{
			response: { 200: t.Object({ deleted: t.Number() }) },
			detail: { summary: "Invalidate bumdes cache entries" },
		},
	);
