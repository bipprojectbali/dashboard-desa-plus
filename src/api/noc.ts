import { $ } from "bun";
import { Elysia, t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import { desaExternalClient } from "../utils/desa-external-client";
import { nocExternalClient } from "../utils/noc-external-client";

export const noc = new Elysia({ prefix: "/noc" })
	.use(apiMiddleware)
	.post(
		"/sync",
		async ({ set, user }) => {
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

			try {
				console.log("[NOC Sync] Starting sync script...");
				// Jalankan script sinkronisasi
				// Hapus .quiet() agar kita bisa melihat log jika terjadi error di console server
				const result = await $`bun run sync:noc`;
				console.log(
					"[NOC Sync] Sync script completed. Output:",
					result.stdout?.toString(),
				);

				return {
					success: true,
					message: "Sinkronisasi berhasil diselesaikan",
					lastSyncedAt: new Date().toISOString(),
				};
			} catch (error) {
				console.error("[NOC Sync] Script Error:", error);
				const errorMessage =
					(error as any)?.stderr ||
					(error as any)?.message ||
					JSON.stringify(error);
				console.error("[NOC Sync] Error Details:", errorMessage);
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
		async ({ query }) => {
			const { idDesa, limit } = query;
			const data = await prisma.division.findMany({
				where: { villageId: idDesa },
				include: {
					_count: {
						select: { activities: true },
					},
				},
				orderBy: {
					activities: {
						_count: "desc",
					},
				},
				take: limit ? Number.parseInt(limit) : 5,
			});

			return {
				data: data.map((d) => ({
					id: d.id,
					name: d.name,
					activityCount: d._count.activities,
					color: d.color,
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
					data: t.Array(
						t.Object({
							id: t.String(),
							name: t.String(),
							activityCount: t.Number(),
							color: t.String(),
						}),
					),
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
		"/upcoming-events",
		async ({ query }) => {
			const { idDesa, limit, filter } = query;
			const now = new Date();
			const where: any = { villageId: idDesa };

			if (filter === "today") {
				const startOfDay = new Date(now.setHours(0, 0, 0, 0));
				const endOfDay = new Date(now.setHours(23, 59, 59, 999));
				where.startDate = {
					gte: startOfDay,
					lte: endOfDay,
				};
			} else {
				where.startDate = {
					gte: now,
				};
			}

			const data = await prisma.event.findMany({
				where,
				orderBy: { startDate: "asc" },
				take: limit ? Number.parseInt(limit) : 5,
			});

			return {
				data: data.map((e) => ({
					id: e.id,
					title: e.title,
					startDate: e.startDate.toISOString(),
					location: e.location,
					eventType: e.eventType,
				})),
			};
		},
		{
			query: t.Object({
				idDesa: t.String(),
				limit: t.Optional(t.String()),
				filter: t.Optional(t.String()), // today/upcoming
			}),
			response: {
				200: t.Object({
					data: t.Array(
						t.Object({
							id: t.String(),
							title: t.String(),
							startDate: t.String(),
							location: t.Nullable(t.String()),
							eventType: t.String(),
						}),
					),
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
		async ({ query }) => {
			const { idDesa } = query;

			try {
				// 1. Coba tarik data dari External Desa Website API
				const client = desaExternalClient as any;
				const { data: extData, error } = await client.GET(
					"/api/landingpage/apbdes/" + idDesa,
				);

				if (!error && extData) {
					console.log(
						"[APBDes] Raw data from external API:",
						JSON.stringify(extData, null, 2),
					);

					const externalData = extData as any;
					const apbdesData = externalData.data || externalData;

					// Check if data has items array (new structure)
					if (apbdesData.items && Array.isArray(apbdesData.items)) {
						console.log(
							"[APBDes] Processing items array:",
							apbdesData.items.length,
							"items",
						);

						// Group by tipe (pendapatan, belanja, pembiayaan)
						const groupedByType: Record<
							string,
							{ totalAnggaran: number; totalRealisasi: number; count: number }
						> = {};

						for (const item of apbdesData.items) {
							const tipe = item.tipe?.toLowerCase() || "lainnya";
							const anggaran = item.anggaran || 0;
							const realisasi = item.totalRealisasi || 0;

							if (!groupedByType[tipe]) {
								groupedByType[tipe] = {
									totalAnggaran: 0,
									totalRealisasi: 0,
									count: 0,
								};
							}
							groupedByType[tipe].totalAnggaran += anggaran;
							groupedByType[tipe].totalRealisasi += realisasi;
							groupedByType[tipe].count += 1;
						}

						// Color mapping for APBDes types
						const colorMap: Record<string, string> = {
							pendapatan: "#10B981", // Green
							belanja: "#3B82F6", // Blue
							pembiayaan: "#F59E0B", // Amber
							lainnya: "#6B7280", // Gray
						};

						// Transform to chart format with realisasi data
						const chartData = Object.entries(groupedByType).map(
							([tipe, stats]) => {
								const persentaseRealisasi =
									stats.totalAnggaran > 0
										? (stats.totalRealisasi / stats.totalAnggaran) * 100
										: 0;

								return {
									category: tipe.charAt(0).toUpperCase() + tipe.slice(1),
									anggaran: stats.totalAnggaran,
									realisasi: stats.totalRealisasi,
									percentage: persentaseRealisasi,
									color: colorMap[tipe] || "#6B7280",
								};
							},
						);

						console.log("[APBDes] Transformed chart data:", chartData);

						return {
							success: true,
							message: `Berhasil mendapatkan data APBDes ${apbdesData.name || ""} (${apbdesData.tahun || ""})`,
							data: chartData,
						};
					}

					// Fallback: If it's already an array, use it directly
					if (Array.isArray(apbdesData)) {
						return {
							success: true,
							message: "Berhasil mendapatkan data APBDes dari website desa",
							data: apbdesData.map((item: any) => ({
								category: item.category || item.name || item.label || "Unknown",
								anggaran:
									item.anggaran || item.amount || item.value || item.total || 0,
								realisasi: item.realisasi || 0,
								percentage: item.percentage || item.percent || 0,
								color: item.color || "#3B82F6",
							})),
						};
					}

					// Fallback: If it's an object with specific fields
					const colorMapFallback: Record<string, string> = {
						pendapatan: "#10B981",
						belanja: "#3B82F6",
						pembiayaan: "#F59E0B",
						surplus: "#92cc76",
						defisit: "#ED6665",
					};

					const transformedData = Object.entries(apbdesData).map(
						([key, value]) => ({
							category: key.charAt(0).toUpperCase() + key.slice(1),
							anggaran: typeof value === "number" ? value : 0,
							realisasi: 0,
							percentage: typeof value === "number" ? value : 0,
							color: colorMapFallback[key.toLowerCase()] || "#3B82F6",
						}),
					);

					return {
						success: true,
						message: "Berhasil mendapatkan data APBDes dari website desa",
						data: transformedData,
					};
				}
			} catch (err) {
				console.error("Failed to fetch APBDes from external Desa API:", err);
			}

			// Return empty array if external API fails
			return {
				success: false,
				message: "Gagal mengambil data APBDes dari website desa",
				data: [],
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
							category: t.String(),
							anggaran: t.Number(),
							realisasi: t.Number(),
							percentage: t.Number(),
							color: t.String(),
						}),
					),
				}),
			},
		},
	)
	.get(
		"/latest-discussion",
		async ({ query }) => {
			const { idDesa, limit } = query;
			const data = await prisma.discussion.findMany({
				where: { villageId: idDesa },
				orderBy: { createdAt: "desc" },
				take: limit ? Number.parseInt(limit) : 5,
				include: {
					sender: {
						select: { name: true, image: true },
					},
					division: {
						select: { name: true },
					},
				},
			});

			return {
				data: data.map((d) => ({
					id: d.id,
					message: d.message,
					senderName: d.sender.name || "Anonymous",
					senderImage: d.sender.image,
					divisionName: d.division?.name || "General",
					createdAt: d.createdAt.toISOString(),
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
	// Jenna MCP External API Proxy (to avoid CORS issues)
	.get(
		"/jenna/surat-perminggu",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/surat-perminggu",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const data = await response.json();
				return {
					success: true,
					data,
				};
			} catch (error) {
				console.error("[Jenna MCP] Failed to fetch surat perminggu:", error);
				return {
					success: false,
					error: "Failed to fetch surat perminggu",
					jumlah: 0,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Optional(t.Any()),
					error: t.Optional(t.String()),
					jumlah: t.Optional(t.Number()),
				}),
			},
		},
	)
	.get(
		"/jenna/pengaduan-count",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pengaduan-count",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const data = await response.json();
				return {
					success: true,
					data,
				};
			} catch (error) {
				console.error("[Jenna MCP] Failed to fetch pengaduan count:", error);
				return {
					success: false,
					error: "Failed to fetch pengaduan count",
					antrian: 0,
					diterima: 0,
					dikerjakan: 0,
					ditolak: 0,
					selesai: 0,
					aktif: 0,
					total: 0,
				};
			}
		},
		{
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Optional(t.Any()),
					error: t.Optional(t.String()),
					antrian: t.Optional(t.Number()),
					diterima: t.Optional(t.Number()),
					dikerjakan: t.Optional(t.Number()),
					ditolak: t.Optional(t.Number()),
					selesai: t.Optional(t.Number()),
					aktif: t.Optional(t.Number()),
					total: t.Optional(t.Number()),
				}),
			},
		},
	)
	.get(
		"/pengajuan-history",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pengajuan-history",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const externalData = await response.json();
				console.log("[NOC] Pengajuan history from external API:", externalData);

				// External API returns array directly: [{ label: "November", total: 0 }, ...]
				if (Array.isArray(externalData)) {
					return externalData;
				}

				// Fallback if response structure is different
				return [];
			} catch (error) {
				console.error("[NOC] Failed to fetch pengajuan history:", error);
				// Return empty array on error
				return [];
			}
		},
		{
			response: {
				200: t.Array(
					t.Object({
						label: t.String(),
						total: t.Number(),
					}),
				),
			},
		},
	)
	.get(
		"/pengaduan-count",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pengaduan-count",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const externalData = await response.json();
				console.log("[NOC] Pengaduan count from external API:", externalData);

				// External API returns data directly: { antrian, diterima, dikerjakan, ditolak, selesai, aktif, total }
				if (externalData && typeof externalData === "object") {
					return {
						antrian: externalData.antrian ?? 0,
						diterima: externalData.diterima ?? 0,
						dikerjakan: externalData.dikerjakan ?? 0,
						ditolak: externalData.ditolak ?? 0,
						selesai: externalData.selesai ?? 0,
						aktif: externalData.aktif ?? 0,
						total: externalData.total ?? 0,
					};
				}

				// Fallback
				return {
					antrian: 0,
					diterima: 0,
					dikerjakan: 0,
					ditolak: 0,
					selesai: 0,
					aktif: 0,
					total: 0,
				};
			} catch (error) {
				console.error("[NOC] Failed to fetch pengaduan count:", error);
				// Return zero counts on error
				return {
					antrian: 0,
					diterima: 0,
					dikerjakan: 0,
					ditolak: 0,
					selesai: 0,
					aktif: 0,
					total: 0,
				};
			}
		},
		{
			response: {
				200: t.Object({
					antrian: t.Number(),
					diterima: t.Number(),
					dikerjakan: t.Number(),
					ditolak: t.Number(),
					selesai: t.Number(),
					aktif: t.Number(),
					total: t.Number(),
				}),
			},
		},
	)
	.get(
		"/pelayanan-perjenis",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pelayanan-perjenis",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const externalData = await response.json();
				console.log(
					"[NOC] Pelayanan per jenis from external API:",
					externalData,
				);

				// External API returns array directly: [{ jenis: "...", jumlah: 0 }, ...]
				if (Array.isArray(externalData)) {
					return externalData;
				}

				// Fallback
				return [];
			} catch (error) {
				console.error("[NOC] Failed to fetch pelayanan per jenis:", error);
				// Return empty array on error
				return [];
			}
		},
		{
			response: {
				200: t.Array(
					t.Object({
						jenis: t.String(),
						jumlah: t.Number(),
					}),
				),
			},
		},
	)
	.get(
		"/pengajuan-terbaru",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pengajuan-terbaru",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const externalData = await response.json();
				console.log("[NOC] Pengajuan terbaru from external API:", externalData);

				// External API returns array directly: [{ jenis, status, namaWarga, durasi }, ...]
				if (Array.isArray(externalData)) {
					return externalData;
				}

				// Fallback
				return [];
			} catch (error) {
				console.error("[NOC] Failed to fetch pengajuan terbaru:", error);
				// Return empty array on error
				return [];
			}
		},
		{
			response: {
				200: t.Array(
					t.Object({
						jenis: t.String(),
						status: t.String(),
						namaWarga: t.String(),
						durasi: t.String(),
					}),
				),
			},
		},
	)
	.get(
		"/pengaduan-history",
		async () => {
			try {
				const response = await fetch(
					"https://cld-dkr-prod-jenna-mcp.wibudev.com/api/noc/pengaduan-history",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJob3N0Iiwic3ViIjoiYmlwIiwicGF5bG9hZCI6IntcIm5hbWVcIjpcIm5vYyBkZXNhK1wiLFwiZGVzY3JpcHRpb25cIjpcInVudHVrIGRhc2hib2FyZCBub2MgZGVzYStcIixcImV4cGlyZWRBdFwiOlwiMjAzMC0xMi0zMVwifSIsImV4cCI6MTkyNDkwNTYwMCwiaWF0IjoxNzc1NTMzMDc0fQ.Ta3pxlwF3oM6Ve0KWhfvL6zbQiXE6D6I09dXMdogJXs",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`External API error: ${response.status}`);
				}

				const externalData = await response.json();
				console.log("[NOC] Pengaduan history from external API:", externalData);

				// External API returns array directly: [{ label: "November", total: 25 }, ...]
				if (Array.isArray(externalData)) {
					return externalData;
				}

				// Fallback
				return [];
			} catch (error) {
				console.error("[NOC] Failed to fetch pengaduan history:", error);
				// Return empty array on error
				return [];
			}
		},
		{
			response: {
				200: t.Array(
					t.Object({
						label: t.String(),
						total: t.Number(),
					}),
				),
			},
		},
	);
