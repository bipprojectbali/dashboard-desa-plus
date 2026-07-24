import { Elysia, t } from "elysia";
import { CHART } from "../theme";
import { TTL, withCache } from "../utils/cache";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

// Mapping nama rating dari NOC API → warna chart.
// Key harus sama dengan RATING_NAME_MAP di satisfaction-chart.tsx.
const RATING_COLOR_MAP: Record<string, { color: string; order: number }> = {
	"Sangat Baik": { color: CHART.green, order: 0 },
	Baik: { color: CHART.blue, order: 1 },
	"Kurang Baik": { color: CHART.amber, order: 2 },
	"Sangat Kurang Baik": { color: CHART.red, order: 3 },
};

export const dashboard = new Elysia({ prefix: "/dashboard" })
	.get(
		"/budget",
		async () => {
			const data = await prisma.budget.findMany({
				where: { fiscalYear: 2025 },
				orderBy: { category: "asc" },
			});
			return { data };
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							category: t.String(),
							amount: t.Number(),
							percentage: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/sdgs",
		async ({ set }) => {
			try {
				const baseUrl =
					process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
				const data = await withCache(
					"dashboard:sdgs",
					TTL.DASHBOARD,
					async () => {
						const response = await fetch(
							`${baseUrl}/api/landingpage/sdgsdesa/findMany`,
						);
						if (!response.ok) {
							throw new Error(`Desa API error: ${response.status}`);
						}
						const json = await response.json();
						if (!json.success || !Array.isArray(json.data)) {
							throw new Error("Invalid response from Desa API");
						}
						return json.data.map(
							(item: {
								name: string;
								jumlah: string | number;
								image: { link: string };
							}) => ({
								title: item.name,
								score: Number(item.jumlah),
								image: `${baseUrl}${item.image.link}`,
							}),
						);
					},
				);
				return { data };
			} catch (error) {
				logger.error({ error }, "Failed to fetch SDGs from Desa API");
				set.status = 500;
				return { data: [] };
			}
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							title: t.String(),
							score: t.Number(),
							image: t.Nullable(t.String()),
						}),
					),
				}),
				500: t.Object({
					data: t.Array(t.Unknown()),
				}),
			},
		},
	)
	.get(
		"/satisfaction",
		async () => {
			const data = await prisma.satisfactionRating.findMany({
				orderBy: { value: "desc" },
			});
			return { data };
		},
		{
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							category: t.String(),
							value: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/satisfaction-responden",
		async ({ set }) => {
			try {
				// Proxy server-side ke NOC agar tidak kena CORS di browser (staging).
				const data = await withCache(
					"dashboard:satisfaction:responden",
					TTL.DASHBOARD,
					async () => {
						const baseUrl =
							process.env.DESA_API_URL ||
							"https://desa-darmasaba-stg.wibudev.com";
						const response = await fetch(
							`${baseUrl}/api/landingpage/responden/findMany`,
						);
						if (!response.ok) {
							throw new Error(`External API error: ${response.status}`);
						}
						const json = await response.json();
						if (!json.success || !Array.isArray(json.data)) {
							throw new Error("Invalid response from external API");
						}

						// Agregasi: hitung jumlah tiap rating.
						const counts: Record<string, number> = {};
						for (const r of json.data as Array<{
							rating?: { name?: string };
						}>) {
							const name = r.rating?.name;
							if (name) counts[name] = (counts[name] ?? 0) + 1;
						}

						return Object.entries(RATING_COLOR_MAP)
							.filter(([apiName]) => counts[apiName])
							.sort((a, b) => a[1].order - b[1].order)
							.map(([apiName, mapping]) => ({
								apiName,
								value: counts[apiName] ?? 0,
								color: mapping.color,
							}));
					},
				);
				return { success: true, data };
			} catch (error) {
				logger.error({ error }, "Failed to proxy dashboard satisfaction");
				set.status = 500;
				return { success: false, error: "Internal Server Error", data: [] };
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Array(
						t.Object({
							apiName: t.String(),
							value: t.Number(),
							color: t.String(),
						}),
					),
					error: t.Optional(t.String()),
				}),
				500: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Array(t.Unknown()),
				}),
			},
		},
	);
