import { Elysia, t } from "elysia";
import type { Prisma } from "generated/prisma";
import { cache, TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";
import { desaExternalClient } from "@/utils/desa-external-client";
import { getEnv } from "@/utils/env";
import logger from "@/utils/logger";

// Base URL Desa API untuk endpoint yang belum ada di generated types
// (dipakai proxy plain-fetch server-side agar bebas CORS).
const DESA_API_URL = getEnv(
	"DESA_API_URL",
	"https://desa-darmasaba-stg.wibudev.com",
).replace(/\/+$/, "");

export const sosial = new Elysia({ prefix: "/sosial" })
	.get(
		"/kesehatan/stats",
		async ({ set }) => {
			try {
				const data = await withCache(
					"sosial:kesehatan:stats",
					TTL.SOSIAL,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kesehatan/ringkasankesehatan/stats",
						);
						if (response.error) throw new Error(String(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial kesehatan stats");
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
		"/posyandu/find-many",
		async ({ set }) => {
			try {
				const data = await withCache(
					"sosial:posyandu:list",
					TTL.SOSIAL,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kesehatan/posyandu/find-many",
						);
						if (response.error) throw new Error(String(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial posyandu list");
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
		"/pendidikan/stats",
		async ({ set }) => {
			try {
				const data = await withCache(
					"sosial:pendidikan:stats",
					TTL.SOSIAL,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/pendidikan/ringkasan/stats",
						);
						if (response.error) throw new Error(String(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial pendidikan stats");
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
		"/event-budaya/find-upcoming",
		async ({ set }) => {
			try {
				const data = await withCache(
					"sosial:event-budaya:upcoming",
					TTL.SOSIAL,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/desa/eventbudaya/find-upcoming",
						);
						if (response.error) throw new Error(String(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial event budaya");
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
	)
	.get(
		"/kesehatan/riwayat-warga",
		async ({ set }) => {
			try {
				// Proxy ke Desa API. Endpoint tunggal mengembalikan banjarList +
				// ibuHamil + balita + penyakit sekaligus; browser tidak bisa fetch
				// langsung karena Desa API tak mengirim header CORS, jadi diambil
				// server-side lalu diteruskan apa adanya.
				const data = await withCache(
					"sosial:kesehatan:riwayat-warga",
					TTL.SOSIAL,
					async () => {
						const r = await fetch(
							`${DESA_API_URL}/api/kesehatan/riwayatwarga/find-many?limit=200`,
						);
						if (!r.ok) throw new Error(`Desa API HTTP ${r.status}`);
						const json = await r.json();
						if (!json.success) {
							throw new Error(
								json.message ?? "Desa API returned success=false",
							);
						}
						return {
							banjarList: Array.isArray(json.banjarList) ? json.banjarList : [],
							ibuHamil: json.ibuHamil?.data ?? [],
							balita: json.balita?.data ?? [],
							penyakit: json.penyakit?.data ?? [],
						};
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial riwayat warga");
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
		"/beasiswa/stats",
		async ({ set }) => {
			try {
				const data = await withCache(
					"sosial:beasiswa:stats",
					TTL.SOSIAL,
					async () => {
						const r = await fetch(
							`${DESA_API_URL}/api/pendidikan/beasiswa/beasiswapendaftar/findMany?limit=500`,
						);
						if (!r.ok) throw new Error(`Desa API HTTP ${r.status}`);
						const json = await r.json();
						if (!json.success) {
							throw new Error(
								json.message ?? "Desa API returned success=false",
							);
						}

						const rows: Array<{ jenisKelamin?: string; createdAt?: string }> =
							Array.isArray(json.data) ? json.data : [];

						const lakiLaki = rows.filter(
							(row) => row.jenisKelamin === "LAKI_LAKI",
						).length;
						const perempuan = rows.filter(
							(row) => row.jenisKelamin === "PEREMPUAN",
						).length;

						// Periode dari tahun createdAt terbesar di halaman ini.
						// ?limit=500 aman selama pendaftar < 500 (saat ini: 45).
						// Jika suatu saat melebihi, breakdown L/P bisa undercount,
						// tapi total (penerima) tetap akurat dari field pagination.
						const years = rows
							.map((row) =>
								row.createdAt ? new Date(row.createdAt).getFullYear() : null,
							)
							.filter((y): y is number => y !== null);
						const periode =
							years.length > 0 ? String(Math.max(...years)) : null;

						return {
							total: json.total ?? rows.length,
							lakiLaki,
							perempuan,
							periode,
						};
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy sosial beasiswa stats");
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
			const deleted = cache.deleteByPrefix("sosial:");
			return { deleted };
		},
		{
			response: { 200: t.Object({ deleted: t.Number() }) },
			detail: { summary: "Invalidate sosial cache entries" },
		},
	);
