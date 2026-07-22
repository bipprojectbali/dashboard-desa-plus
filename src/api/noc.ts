import { $ } from "bun";
import { Elysia, t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { cache, TTL, withCache } from "../utils/cache";
import { prisma } from "../utils/db";
import { desaExternalClient } from "../utils/desa-external-client";
import { getEnv } from "../utils/env";
import { nocExternalClient } from "../utils/noc-external-client";
import { type ApbdesEntryRaw, mapApbdesList } from "./transforms/apbdes";
import {
	mapDiscussions,
	type NocDiscussionRaw,
} from "./transforms/noc-discussions";
import {
	DIVISION_COLOR_FALLBACK,
	DIVISION_COLOR_MAP,
	mapActiveDivisions,
	type NocDivisionRaw,
} from "./transforms/noc-divisions";
import { mapUpcomingEvents, type NocEventRaw } from "./transforms/noc-events";
import { buildWallSnapshot, isWallAuthorized } from "./wall-snapshot";

const APBDES_ID = getEnv("DESA_APBDES_ID", "cmk-apbdes-001");
const DEFAULT_VILLAGE_ID = getEnv("NOC_VILLAGE_ID", "desa1");

export const noc = new Elysia({ prefix: "/noc" })
	.use(apiMiddleware)
	.post(
		"/sync",
		async ({ set, user, request }) => {
			console.log(
				"[NOC Sync] Sync request received. User:",
				user?.email || "Unknown",
			);

			if (!user || user.role !== "admin") {
				console.log(
					"[NOC Sync] Unauthorized - User role:",
					user?.role || "No user",
				);
				set.status = 401;
				return { error: "Unauthorized" };
			}

			const syncStart = Date.now();
			try {
				console.log("[NOC Sync] Starting sync script...");
				// Hapus .quiet() agar kita bisa melihat log jika terjadi error di console server
				const result = await $`bun run sync:noc`;
				console.log(
					"[NOC Sync] Sync script completed. Output:",
					result.stdout?.toString(),
				);

				const durationMs = Date.now() - syncStart;
				const lastSyncedAt = new Date().toISOString();
				await Promise.all([
					prisma.activityLog.create({
						data: {
							userId: user.id,
							action: "noc-sync",
							detail: JSON.stringify({ success: true }),
							ipAddress:
								request.headers.get("x-forwarded-for") ??
								request.headers.get("x-real-ip") ??
								null,
							userAgent: request.headers.get("user-agent") ?? null,
						},
					}),
					prisma.syncLog.create({
						data: {
							type: "noc",
							status: "success",
							triggeredBy: "manual",
							durationMs,
						},
					}),
				]);

				return {
					success: true,
					message: "Sinkronisasi berhasil diselesaikan",
					lastSyncedAt,
				};
			} catch (error) {
				console.error("[NOC Sync] Script Error:", error);
				const errorMessage =
					(error as any)?.stderr ||
					(error as any)?.message ||
					JSON.stringify(error);
				console.error("[NOC Sync] Error Details:", errorMessage);
				await prisma.syncLog.create({
					data: {
						type: "noc",
						status: "error",
						triggeredBy: "manual",
						durationMs: Date.now() - syncStart,
						errorMessage: errorMessage.toString().substring(0, 500),
					},
				});
				return {
					success: false,
					error: `Sinkronisasi gagal: ${errorMessage.substring(0, 200)}`,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.Optional(t.String()),
					error: t.Optional(t.String()),
					lastSyncedAt: t.Optional(t.String()),
				}),
				401: t.Object({ error: t.String() }),
			},
		},
	)
	.get(
		"/last-sync",
		async ({ query }) => {
			const { idDesa } = query;
			const latest = await prisma.division.findFirst({
				where: { villageId: idDesa },
				select: { lastSyncedAt: true },
				orderBy: { lastSyncedAt: "desc" },
			});

			return { lastSyncedAt: latest?.lastSyncedAt?.toISOString() || null };
		},
		{
			query: t.Object({ idDesa: t.String() }),
			response: {
				200: t.Object({
					lastSyncedAt: t.Nullable(t.String()),
				}),
			},
		},
	)
	.get(
		"/active-divisions",
		async ({ query, set }) => {
			const idDesa = query.idDesa || DEFAULT_VILLAGE_ID;
			const { limit } = query;
			try {
				const data = await withCache(
					`dashboard:active-divisions:${idDesa}`,
					TTL.DASHBOARD,
					async () => {
						const { data: extData, error } = await nocExternalClient.GET(
							"/api/noc/active-divisions",
							{ params: { query: { idDesa, limit } } },
						);
						if (error || !extData) throw new Error("NOC API error");
						const res = extData as any;
						const divisi: NocDivisionRaw[] = res?.data?.divisi;
						if (!Array.isArray(divisi)) throw new Error("Invalid NOC response");
						return mapActiveDivisions(divisi);
					},
				);
				return { data };
			} catch (error) {
				console.error("[NOC] Failed to fetch active-divisions:", error);
				set.status = 500;
				return { data: [] };
			}
		},
		{
			query: t.Object({
				idDesa: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							name: t.String(),
							activityCount: t.Number(),
							color: t.String(),
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
		"/latest-projects",
		async ({ query }) => {
			const { idDesa, limit } = query;

			try {
				// 1. Coba tarik data live dari NOC External API
				const { data: extData, error } = await nocExternalClient.GET(
					"/api/noc/latest-projects",
					{
						params: { query: { idDesa, limit } },
					},
				);

				if (!error && extData && (extData as any).success) {
					const res = extData as any;
					const projects = res.data?.projects || [];

					return {
						success: true,
						data: projects.map((p: any) => ({
							id: p.id,
							title: p.title,
							status:
								p.status === 2 || p.status === "2" ? "SELESAI" : "BERJALAN",
							progress: p.progress || (p.status === 2 ? 100 : 50),
							divisionName: p.group || "Umum",
							createdAt: p.updatedAt || p.createdAt || new Date().toISOString(),
						})),
					};
				}
			} catch (err) {
				console.error("Failed to fetch latest projects from NOC External", err);
			}

			// 2. Fallback ke database lokal jika external gagal
			const data = await prisma.activity.findMany({
				where: { villageId: idDesa },
				orderBy: { createdAt: "desc" },
				take: limit ? Number.parseInt(limit) : 5,
				include: { division: true },
			});

			return {
				success: true,
				data: data.map((a) => ({
					id: a.id,
					title: a.title,
					status: a.status,
					progress: a.progress,
					divisionName: a.division.name,
					createdAt: a.createdAt.toISOString(),
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					success: t.Optional(t.Boolean()),
					data: t.Array(
						t.Object({
							id: t.String(),
							title: t.String(),
							status: t.String(),
							progress: t.Number(),
							divisionName: t.String(),
							createdAt: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/export-activities",
		async ({ query }) => {
			const { idDesa } = query;

			const [activities, divisions, docStats, actStats, discussions] =
				await Promise.all([
					// 1. Program kegiatan
					prisma.activity.findMany({
						where: { villageId: idDesa },
						orderBy: { createdAt: "desc" },
						include: { division: { select: { name: true } } },
					}),
					// 2. Divisi teraktif — sama persis dengan /api/division/ (tanpa filter villageId)
					prisma.division.findMany({
						include: { _count: { select: { activities: true } } },
					}),
					// 3. Jumlah dokumen per tipe
					prisma.document.groupBy({
						where: { villageId: idDesa },
						by: ["type"],
						_count: { _all: true },
					}),
					// 4. Progres kegiatan per status
					prisma.activity.groupBy({
						where: { villageId: idDesa },
						by: ["status"],
						_count: { _all: true },
					}),
					// 5. Diskusi terbaru
					prisma.discussion.findMany({
						where: { villageId: idDesa },
						orderBy: { createdAt: "desc" },
						take: 20,
						include: {
							sender: { select: { name: true } },
							division: { select: { name: true } },
						},
					}),
				]);

			const { buildPdfReport } = await import("../utils/pdf-table");

			const totalAktivitas = actStats.reduce(
				(sum, s) => sum + s._count._all,
				0,
			);

			const buffer = await buildPdfReport({
				title: "Laporan Kinerja Divisi",
				sections: [
					{
						heading: "Program Kegiatan Terbaru",
						columns: [
							{ header: "Judul Kegiatan", key: "title", width: 190 },
							{ header: "Divisi", key: "division", width: 110 },
							{ header: "Status", key: "status", width: 75 },
							{ header: "Progress", key: "progress", width: 60 },
							{ header: "Tanggal", key: "createdAt", width: 80 },
						],
						rows: activities.map((a) => ({
							title: a.title,
							division: a.division.name,
							status: a.status,
							progress: `${a.progress}%`,
							createdAt: new Date(a.createdAt).toLocaleDateString("id-ID"),
						})),
					},
					{
						heading: "Divisi Teraktif",
						columns: [
							{ header: "Nama Divisi", key: "name", width: 350 },
							{ header: "Jumlah Kegiatan", key: "count", width: 165 },
						],
						rows: divisions
							.map((d) => ({
								name: d.name,
								count: d.externalActivityCount ?? d._count.activities,
							}))
							.sort((a, b) => Number(b.count) - Number(a.count)),
					},
					{
						heading: "Progres Kegiatan",
						columns: [
							{ header: "Status", key: "status", width: 200 },
							{ header: "Jumlah", key: "count", width: 100 },
							{ header: "Persentase", key: "pct", width: 215 },
						],
						rows: actStats.map((s) => ({
							status: s.status,
							count: s._count._all,
							pct:
								totalAktivitas > 0
									? `${((s._count._all / totalAktivitas) * 100).toFixed(1)}%`
									: "0%",
						})),
					},
					{
						heading: "Jumlah Dokumen per Tipe",
						columns: [
							{ header: "Tipe Dokumen", key: "type", width: 350 },
							{ header: "Jumlah", key: "count", width: 165 },
						],
						rows: docStats.map((d) => ({
							type: d.type,
							count: d._count._all,
						})),
					},
					{
						heading: "Diskusi Terbaru",
						columns: [
							{ header: "Pesan", key: "message", width: 200 },
							{ header: "Pengirim", key: "sender", width: 110 },
							{ header: "Divisi", key: "division", width: 100 },
							{ header: "Tanggal", key: "date", width: 105 },
						],
						rows: discussions.map((d) => ({
							message: d.message,
							sender: d.sender.name ?? "-",
							division: d.division?.name ?? "-",
							date: new Date(d.createdAt).toLocaleDateString("id-ID"),
						})),
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
					"Content-Disposition": `attachment; filename="kinerja-divisi-${new Date().toISOString().slice(0, 10)}.pdf"`,
				},
			});
		},
		{
			query: t.Object({ idDesa: t.String() }),
			detail: { summary: "Export kinerja divisi report as PDF" },
		},
	)
	.get(
		"/upcoming-events",
		async ({ query, set }) => {
			const idDesa = query.idDesa || DEFAULT_VILLAGE_ID;
			const { limit, filter } = query;
			try {
				const data = await withCache(
					`dashboard:upcoming-events:${idDesa}:${filter ?? "all"}`,
					TTL.DASHBOARD,
					async () => {
						const { data: extData, error } = await nocExternalClient.GET(
							"/api/noc/upcoming-events",
							{ params: { query: { idDesa, limit, filter } } },
						);
						if (error || !extData) throw new Error("NOC API error");
						const res = extData as any;
						const list: NocEventRaw[] =
							res?.data?.upcoming ?? res?.data?.events ?? res?.data?.today;
						if (!Array.isArray(list)) throw new Error("Invalid NOC response");
						return mapUpcomingEvents(list);
					},
				);
				return { data };
			} catch (error) {
				console.error("[NOC] Failed to fetch upcoming-events:", error);
				set.status = 500;
				return { data: [] };
			}
		},
		{
			query: t.Object({
				idDesa: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				filter: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							title: t.String(),
							startDate: t.String(),
							time: t.String(),
							divisi: t.Nullable(t.String()),
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
		"/diagram-jumlah-document",
		async ({ query }) => {
			const { idDesa } = query;

			try {
				// Coba tarik data dari NOC External API (sesuai permintaan user)
				const { data: extData, error } = await nocExternalClient.GET(
					"/api/noc/diagram-jumlah-document",
					{
						params: { query: { idDesa } },
					},
				);

				if (!error && extData && (extData as any).success) {
					return extData as any;
				}
			} catch (err) {
				console.error("Failed to fetch document stats from NOC External", err);
			}

			// Fallback ke local database (tabel DocumentStat yang baru)
			const stats = await prisma.documentStat.findMany({
				where: { villageId: idDesa },
			});

			if (stats.length > 0) {
				return {
					success: true,
					message: "Berhasil mendapatkan jumlah document dari database",
					data: stats.map((s) => ({
						label: s.label,
						value: s.value,
						color: s.color,
					})),
				};
			}

			// Fallback terakhir: groupBy Document (model lama)
			const data = await prisma.document.groupBy({
				where: { villageId: idDesa },
				by: ["type"],
				_count: {
					_all: true,
				},
			});

			const colorMap: Record<string, string> = {
				Gambar: "#fac858",
				Dokumen: "#92cc76",
				PDF: "#3B82F6",
				Excel: "#10B981",
			};

			return {
				success: true,
				message: "Berhasil mendapatkan jumlah document",
				data: data.map((d) => ({
					label: d.type,
					value: d._count._all,
					color: colorMap[d.type] || "#6B7280",
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
					data: t.Array(
						t.Object({
							label: t.String(),
							value: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/diagram-progres-kegiatan",
		async ({ query }) => {
			const { idDesa } = query;

			try {
				// 1. Coba tarik data live dari NOC External API
				const { data: extData, error } = await nocExternalClient.GET(
					"/api/noc/diagram-progres-kegiatan",
					{
						params: { query: { idDesa } },
					},
				);

				if (!error && extData && (extData as any).success) {
					return extData as any;
				}
			} catch (err) {
				console.error(
					"Failed to fetch activity progress from NOC External",
					err,
				);
			}

			// 2. Fallback ke database lokal jika external gagal
			const data = await prisma.activity.groupBy({
				where: { villageId: idDesa },
				by: ["status"],
				_avg: {
					progress: true,
				},
				_count: {
					_all: true,
				},
			});

			const total = data.reduce((acc, curr) => acc + curr._count._all, 0);
			const statusMap: Record<
				string,
				{ label: string; color: string; order: number }
			> = {
				TERTUNDA: { label: "Segera Dikerjakan", color: "#177AD5", order: 0 },
				BERJALAN: { label: "Dikerjakan", color: "#fac858", order: 1 },
				SELESAI: { label: "Selesai", color: "#92cc76", order: 2 },
				DIBATALKAN: { label: "Dibatalkan", color: "#ED6665", order: 3 },
			};

			const result = Object.keys(statusMap).map((status) => {
				const found = data.find((d) => d.status === status);
				const count = found?._count._all || 0;
				const percentage = total > 0 ? (count / total) * 100 : 0;
				const statusInfo = statusMap[status]!; // Non-null assertion since we're iterating Object.keys(statusMap)
				return {
					text: `${percentage.toFixed(0)}%`,
					value: percentage,
					color: statusInfo.color,
					label: statusInfo.label, // Extra field for UI mapping
				};
			});

			return {
				success: true,
				message: "Berhasil mendapatkan progres kegiatan dari database lokal",
				data: result,
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
					data: t.Array(
						t.Object({
							text: t.String(),
							value: t.Any(), // Bisa string "100" atau number 0
							color: t.String(),
							label: t.Optional(t.String()),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/apbdes-data",
		async () => {
			try {
				const cached = cache.get<ApbdesEntryRaw[]>("apbdes:all");
				let entries: ApbdesEntryRaw[];

				if (cached) {
					console.log("[APBDes API] Returning cached APBDes data");
					entries = cached;
				} else {
					console.log("[APBDes API] Fetching findMany from Desa API");
					const client = desaExternalClient as any;
					const { data: extData, error } = await client.GET(
						"/api/landingpage/apbdes/findMany",
					);

					if (error || !extData) {
						return {
							success: false,
							message: "Gagal mengambil data APBDes dari website desa",
							years: [],
						};
					}

					entries = (extData.data ?? extData) as ApbdesEntryRaw[];
					cache.set("apbdes:all", entries, TTL.APBDES);
				}

				const years = mapApbdesList(entries);
				return {
					success: true,
					message: "Berhasil mendapatkan data APBDes",
					years,
				};
			} catch (err) {
				console.error("Failed to fetch APBDes from external Desa API:", err);
			}

			return {
				success: false,
				message: "Gagal mengambil data APBDes dari website desa",
				years: [],
			};
		},
		{
			query: t.Object({
				idDesa: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
					years: t.Array(
						t.Object({
							id: t.String(),
							tahun: t.Number(),
							name: t.String(),
							title: t.String(),
							data: t.Array(
								t.Object({
									category: t.String(),
									anggaran: t.Number(),
									realisasi: t.Number(),
									percentage: t.Number(),
									color: t.String(),
								}),
							),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/latest-discussion",
		async ({ query, set }) => {
			const idDesa = query.idDesa || DEFAULT_VILLAGE_ID;
			const { limit } = query;
			try {
				const data = await withCache(
					`dashboard:latest-discussion:${idDesa}`,
					TTL.DASHBOARD,
					async () => {
						const res = await nocExternalClient.GET(
							"/api/noc/latest-discussion",
							{ params: { query: { idDesa, limit } } },
						);
						const raw = (res?.data as any)?.data as NocDiscussionRaw[];
						if (!Array.isArray(raw)) throw new Error("Invalid NOC response");
						return mapDiscussions(raw);
					},
				);
				return { data };
			} catch (error) {
				console.error("[NOC] Failed to fetch latest-discussion:", error);
				set.status = 500;
				return { data: [] };
			}
		},
		{
			query: t.Object({
				idDesa: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							message: t.String(),
							senderName: t.String(),
							senderImage: t.Nullable(t.String()),
							divisionName: t.String(),
							createdAt: t.String(),
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
		"/satisfaction-categories",
		async () => {
			try {
				// Fetch rating categories dari external NOC API
				const externalBaseUrl =
					process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
				const response = await fetch(
					`${externalBaseUrl}/api/landingpage/pilihanratingresponden/findMany`,
				);

				if (!response.ok) {
					throw new Error(`External API responded with ${response.status}`);
				}

				const externalData = await response.json();

				if (externalData.success && externalData.data) {
					return {
						success: true,
						message: "Berhasil mendapatkan kategori rating dari NOC",
						data: externalData.data
							.filter((cat: any) => cat.isActive)
							.map((cat: any) => ({
								id: cat.id,
								name: cat.name,
								isActive: cat.isActive,
							})),
					};
				}

				throw new Error("Invalid response from external API");
			} catch (error) {
				console.error(
					"Failed to fetch satisfaction categories from NOC:",
					error,
				);

				// Fallback: return hardcoded categories jika external API gagal
				return {
					success: true,
					message: "Menggunakan kategori rating default (fallback)",
					fallback: true,
					data: [
						{ id: "fallback-1", name: "Sangat Baik", isActive: true },
						{ id: "fallback-2", name: "Baik", isActive: true },
						{ id: "fallback-3", name: "Kurang Baik", isActive: true },
						{ id: "fallback-4", name: "Sangat Kurang Baik", isActive: true },
					],
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
					fallback: t.Optional(t.Boolean()),
					data: t.Array(
						t.Object({
							id: t.String(),
							name: t.String(),
							isActive: t.Boolean(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/wall-snapshot",
		async ({ query, set }) => {
			// WALL_ACCESS_TOKEN server-only (BUKAN VITE_/BUN_PUBLIC_).
			// Unset ⇒ terbuka; diisi ⇒ wajib ?key=<token>.
			const token = process.env.WALL_ACCESS_TOKEN;
			if (!isWallAuthorized(token, query.key)) {
				set.status = 403;
				return { success: false, error: "Forbidden", data: null };
			}

			const data = await withCache(
				"wall:snapshot",
				TTL.WALL,
				buildWallSnapshot,
			);
			return { success: true, data };
		},
		{
			query: t.Object({ key: t.Optional(t.String()) }),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
				}),
				403: t.Object({
					success: t.Boolean(),
					error: t.String(),
					data: t.Null(),
				}),
			},
			detail: { summary: "Public NOC wall snapshot (no PII)" },
		},
	);
