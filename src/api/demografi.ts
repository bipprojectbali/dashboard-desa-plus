import { Elysia, t } from "elysia";
import { cache, TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";
import { desaExternalClient } from "@/utils/desa-external-client";
import { apiMiddleware } from "../middleware/apiMiddleware";

function extractError(err: unknown): string {
	if (!err) return "Unknown error";
	if (typeof err === "string") return err;
	const e = err as Record<string, unknown>;
	return String(e.error || e.message || JSON.stringify(err));
}

let lastSyncedAt: string | null = null;

export const demografi = new Elysia({ prefix: "/demografi" })
	.use(apiMiddleware)
	.get(
		"/summary",
		async () => {
			try {
				const data = await withCache(
					"demografi:summary",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kependudukan/dashboard/summary",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Summary error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/banjar",
		async () => {
			try {
				const data = await withCache(
					"demografi:banjar",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kependudukan/databanjar/find-many",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Banjar error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/age",
		async () => {
			try {
				const data = await withCache(
					"demografi:age",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kependudukan/distribusiumur/find-many",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Age error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/occupation",
		async () => {
			try {
				const data = await withCache(
					"demografi:occupation",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/ekonomi/demografipekerjaan/find-many",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Occupation error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/religion",
		async () => {
			try {
				const data = await withCache(
					"demografi:religion",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kependudukan/distribusiagama/find-many",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Religion error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/births",
		async () => {
			try {
				const data = await withCache(
					"demografi:births",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kesehatan/kelahiran/findMany",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Births error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/deaths",
		async () => {
			try {
				const data = await withCache(
					"demografi:deaths",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kesehatan/kematian/findMany",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Deaths error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/migration",
		async () => {
			try {
				const data = await withCache(
					"demografi:migration",
					TTL.DEMOGRAFI,
					async () => {
						const response = await desaExternalClient.GET(
							"/api/kependudukan/migrasipenduduk/find-many",
						);
						if (response.error) throw new Error(extractError(response.error));
						return response.data?.data ?? null;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Migration error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get(
		"/sectors",
		async () => {
			try {
				const data = await withCache(
					"demografi:sectors",
					TTL.DEMOGRAFI,
					async () => {
						console.log(
							"[Demografi API] Fetching sectors from external API...",
						);
						const response = await desaExternalClient.GET(
							"/api/ekonomi/sektourunggulandesa/find-many",
						);
						if (response.error) {
							console.error(
								"[Demografi API] External sectors error:",
								response.error,
							);
							throw new Error(extractError(response.error));
						}
						const items = response.data?.data || [];
						console.log(
							`[Demografi API] Sectors fetched successfully: ${Array.isArray(items) ? items.length : 0} items`,
						);
						return items;
					},
				);
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] Sectors error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.post(
		"/sync",
		async ({ request, user }) => {
			const syncStart = Date.now();
			try {
				console.log("[Demografi API] Starting sync...");

				const [
					summary,
					banjar,
					age,
					occupation,
					religion,
					births,
					deaths,
					migration,
					sectors,
					apbdes,
				] = await Promise.all([
					desaExternalClient.GET("/api/kependudukan/dashboard/summary"),
					desaExternalClient.GET("/api/kependudukan/databanjar/find-many"),
					desaExternalClient.GET("/api/kependudukan/distribusiumur/find-many"),
					desaExternalClient.GET("/api/ekonomi/demografipekerjaan/find-many"),
					desaExternalClient.GET("/api/kependudukan/distribusiagama/find-many"),
					desaExternalClient.GET("/api/kesehatan/kelahiran/findMany"),
					desaExternalClient.GET("/api/kesehatan/kematian/findMany"),
					desaExternalClient.GET("/api/kependudukan/migrasipenduduk/find-many"),
					desaExternalClient.GET("/api/ekonomi/sektourunggulandesa/find-many"),
					desaExternalClient.GET("/api/landingpage/apbdes/{id}", {
						params: { path: { id: "cmk-apbdes-001" } },
					}),
				]);

				const errors = [];
				if (summary.error) errors.push("summary");
				if (banjar.error) errors.push("banjar");
				if (age.error) errors.push("age");
				if (occupation.error) errors.push("occupation");
				if (religion.error) errors.push("religion");
				if (births.error) errors.push("births");
				if (deaths.error) errors.push("deaths");
				if (migration.error) errors.push("migration");
				if (sectors.error) errors.push("sectors");
				if (apbdes.error) errors.push("apbdes");

				if (errors.length > 0) {
					console.warn("[Demografi API] Some endpoints failed:", errors);
				}

				// Populate cache for each key with TTL
				if (!summary.error && summary.data?.data != null)
					cache.set("demografi:summary", summary.data.data, TTL.DEMOGRAFI);
				if (!banjar.error && banjar.data?.data != null)
					cache.set("demografi:banjar", banjar.data.data, TTL.DEMOGRAFI);
				if (!age.error && age.data?.data != null)
					cache.set("demografi:age", age.data.data, TTL.DEMOGRAFI);
				if (!occupation.error && occupation.data?.data != null)
					cache.set(
						"demografi:occupation",
						occupation.data.data,
						TTL.DEMOGRAFI,
					);
				if (!religion.error && religion.data?.data != null)
					cache.set("demografi:religion", religion.data.data, TTL.DEMOGRAFI);
				if (!births.error && births.data?.data != null)
					cache.set("demografi:births", births.data.data, TTL.DEMOGRAFI);
				if (!deaths.error && deaths.data?.data != null)
					cache.set("demografi:deaths", deaths.data.data, TTL.DEMOGRAFI);
				if (!migration.error && migration.data?.data != null)
					cache.set("demografi:migration", migration.data.data, TTL.DEMOGRAFI);
				if (!sectors.error && sectors.data?.data != null)
					cache.set("demografi:sectors", sectors.data.data, TTL.DEMOGRAFI);
				const apbdesData = apbdes.data?.data || apbdes.data || null;
				if (!apbdes.error && apbdesData != null)
					cache.set("apbdes:cmk-apbdes-001", apbdesData, TTL.APBDES);

				lastSyncedAt = new Date().toISOString();
				console.log("[Demografi API] Sync completed at:", lastSyncedAt);

				const durationMs = Date.now() - syncStart;
				const syncLogPromise = prisma.syncLog.create({
					data: {
						type: "demografi",
						status: errors.length > 0 ? "partial" : "success",
						triggeredBy: "manual",
						durationMs,
						errorMessage:
							errors.length > 0 ? `Gagal: ${errors.join(", ")}` : null,
					},
				});

				if (user?.id) {
					await Promise.all([
						prisma.activityLog.create({
							data: {
								userId: user.id,
								action: "demografi-sync",
								detail: JSON.stringify({
									errors: errors.length > 0 ? errors : null,
								}),
								ipAddress:
									request.headers.get("x-forwarded-for") ??
									request.headers.get("x-real-ip") ??
									null,
								userAgent: request.headers.get("user-agent") ?? null,
							},
						}),
						syncLogPromise,
					]);
				} else {
					await syncLogPromise;
				}

				return {
					success: true,
					message: "Sinkronisasi data desa berhasil",
					lastSyncedAt,
					errors: errors.length > 0 ? errors : undefined,
				};
			} catch (error) {
				console.error("[Demografi API] Sync error:", error);
				await prisma.syncLog.create({
					data: {
						type: "demografi",
						status: "error",
						triggeredBy: "manual",
						durationMs: Date.now() - syncStart,
						errorMessage:
							(error as Error)?.message?.substring(0, 500) ?? "Unknown error",
					},
				});
				return {
					success: false,
					error: "Gagal melakukan sinkronisasi data desa",
					lastSyncedAt: null,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.Optional(t.String()),
					lastSyncedAt: t.Nullable(t.String()),
					errors: t.Optional(t.Array(t.String())),
					error: t.Optional(t.String()),
				}),
			},
		},
	)

	.get("/last-sync", () => ({ lastSyncedAt }), {
		response: {
			200: t.Object({
				lastSyncedAt: t.Nullable(t.String()),
			}),
		},
	})

	.get(
		"/apbdes/:id",
		async ({ params: { id } }) => {
			try {
				const data = await withCache(`apbdes:${id}`, TTL.APBDES, async () => {
					console.log(`[Demografi API] Fetching APBDes detail for ID: ${id}`);
					const response = await desaExternalClient.GET(
						"/api/landingpage/apbdes/{id}",
						{ params: { path: { id } } },
					);
					if (response.error) {
						console.error(
							"[Demografi API] APBDes detail error:",
							response.error,
						);
						throw new Error(extractError(response.error));
					}
					return response.data ?? null;
				});
				return { success: true, data, lastSyncedAt };
			} catch (error) {
				console.error("[Demografi API] APBDes detail error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt,
				};
			}
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	);
