import { Elysia, t } from "elysia";
import { cache, TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";
import { desaExternalClient } from "@/utils/desa-external-client";
import { getEnv } from "@/utils/env";
import { apiMiddleware } from "../middleware/apiMiddleware";

const APBDES_ID = getEnv("DESA_APBDES_ID", "cmk-apbdes-001");

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
						params: { path: { id: APBDES_ID } },
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
					cache.set(`apbdes:${APBDES_ID}`, apbdesData, TTL.APBDES);

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

	.get("/export", async ({ set }) => {
		try {
			const [summaryRes, banjarRes, ageRes, jobRes, religionRes, sectorsRes] =
				await Promise.allSettled([
					withCache("demografi:summary", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/kependudukan/dashboard/summary",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? null;
					}),
					withCache("demografi:banjar", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/kependudukan/databanjar/find-many",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? null;
					}),
					withCache("demografi:age", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/kependudukan/distribusiumur/find-many",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? null;
					}),
					withCache("demografi:occupation", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/ekonomi/demografipekerjaan/find-many",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? null;
					}),
					withCache("demografi:religion", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/kependudukan/distribusiagama/find-many",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? null;
					}),
					withCache("demografi:sectors", TTL.DEMOGRAFI, async () => {
						const r = await desaExternalClient.GET(
							"/api/ekonomi/sektourunggulandesa/find-many",
						);
						if (r.error) throw new Error(extractError(r.error));
						return r.data?.data ?? [];
					}),
				]);

			const getVal = (res: PromiseSettledResult<unknown>) =>
				res.status === "fulfilled" ? res.value : null;

			const summary = getVal(summaryRes) as Record<string, any> | null;
			const banjar = getVal(banjarRes);
			const age = getVal(ageRes);
			const occupation = getVal(jobRes);
			const religion = getVal(religionRes);
			const sectors = getVal(sectorsRes);

			const s = summary?.summary ?? {};
			const d = summary?.dinamika ?? {};

			const { buildPdfReport } = await import("../utils/pdf-table");
			const buffer = await buildPdfReport({
				title: "Laporan Demografi & Pekerjaan",
				subtitle: `Desa Darmasaba — Diekspor pada: ${new Date().toLocaleString("id-ID")}`,
				sections: [
					{
						heading: "Ringkasan Kependudukan",
						columns: [
							{ header: "Indikator", key: "indikator", width: 300 },
							{ header: "Jumlah", key: "jumlah", width: 215 },
						],
						rows: [
							{
								indikator: "Total Penduduk",
								jumlah: (s.totalPenduduk || summary?.total || 0).toLocaleString(
									"id-ID",
								),
							},
							{
								indikator: "Kepala Keluarga (KK)",
								jumlah: (s.totalKK || summary?.heads || 0).toLocaleString(
									"id-ID",
								),
							},
							{
								indikator: "Keluarga Miskin",
								jumlah: (
									s.totalKemiskinan ||
									summary?.poor ||
									0
								).toLocaleString("id-ID"),
							},
							{ indikator: "Kelahiran", jumlah: String(d.kelahiran ?? 0) },
							{ indikator: "Kematian", jumlah: String(d.kematian ?? 0) },
						],
					},
					{
						heading: "Data Per Banjar",
						columns: [
							{ header: "Nama Banjar", key: "nama", width: 175 },
							{ header: "Penduduk", key: "penduduk", width: 110 },
							{ header: "KK", key: "kk", width: 110 },
							{ header: "Miskin", key: "miskin", width: 120 },
						],
						rows: Array.isArray(banjar)
							? (banjar as any[]).slice(0, 20).map((b) => ({
									nama: b.nama || b.name || "-",
									penduduk: String(b.penduduk || b.totalPopulation || 0),
									kk: String(b.kk || b.totalKK || 0),
									miskin: String(b.miskin || b.totalPoor || 0),
								}))
							: [],
					},
					{
						heading: "Distribusi Kelompok Umur",
						columns: [
							{ header: "Kelompok Umur", key: "kelompok", width: 290 },
							{ header: "Jumlah", key: "jumlah", width: 225 },
						],
						rows: Array.isArray(age)
							? (age as any[]).map((a) => ({
									kelompok:
										a.rentangUmur || a.ageRange || a.kelompokUmur || "-",
									jumlah: String(a.jumlah || a.total || 0),
								}))
							: [],
					},
					{
						heading: "Demografi Pekerjaan",
						columns: [
							{ header: "Jenis Pekerjaan", key: "pekerjaan", width: 290 },
							{ header: "Jumlah", key: "jumlah", width: 225 },
						],
						rows: Array.isArray(occupation)
							? (occupation as any[]).map((j) => ({
									pekerjaan:
										j.pekerjaan || j.namaPekerjaan || j.job || "-",
									jumlah: String(
										j.jumlah ||
											j.total ||
											Number(j.lakiLaki || 0) + Number(j.perempuan || 0) ||
											0,
									),
								}))
							: [],
					},
					{
						heading: "Distribusi Agama",
						columns: [
							{ header: "Agama", key: "agama", width: 290 },
							{ header: "Jumlah", key: "jumlah", width: 225 },
						],
						rows: Array.isArray(religion)
							? (religion as any[]).map((r) => ({
									agama: r.agama || r.religion || r.name || "-",
									jumlah: String(r.jumlah || r.value || r.count || 0),
								}))
							: [],
					},
					{
						heading: "Sektor Unggulan Desa",
						columns: [
							{ header: "Sektor", key: "sektor", width: 290 },
							{ header: "Nilai", key: "nilai", width: 225 },
						],
						rows: Array.isArray(sectors)
							? (sectors as any[]).map((s) => ({
									sektor:
										s.name ||
										s.nama ||
										s.sektor ||
										s.sektorUnggulan ||
										"-",
									nilai: String(s.value ?? s.nilai ?? s.jumlah ?? 0),
								}))
							: [],
					},
				],
			});

			const ab = buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			) as ArrayBuffer;
			return new Response(ab, {
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="laporan-demografi-${new Date().toISOString().slice(0, 10)}.pdf"`,
				},
			});
		} catch (error) {
			console.error("[Demografi API] Export error:", error);
			set.status = 500;
			return { error: "Gagal membuat laporan PDF" };
		}
	})

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
