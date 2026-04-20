import { Elysia, t } from "elysia";
import { desaExternalClient } from "@/utils/desa-external-client";

// In-memory cache for demografi data
const demografiCache = {
	data: {} as Record<string, any>,
	lastSyncedAt: null as string | null,
};

/**
 * Demografi API Routes
 * Proxy endpoints to fetch data from external Desa API
 * Avoids CORS issues by routing through backend
 */
export const demografi = new Elysia({ prefix: "/demografi" })
	// Get dashboard summary
	.get(
		"/summary",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kependudukan/dashboard/summary",
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Summary error:", error);
				return { success: false, error: "Failed to fetch summary data" };
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

	// Get banjar data
	.get(
		"/banjar",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kependudukan/databanjar/find-many" as any,
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Banjar error:", error);
				return { success: false, error: "Failed to fetch banjar data" };
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

	// Get age distribution
	.get(
		"/age",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kependudukan/distribusiumur/find-many" as any,
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Age error:", error);
				return { success: false, error: "Failed to fetch age data" };
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

	// Get occupation data
	.get(
		"/occupation",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/ekonomi/demografipekerjaan/find-many" as any,
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Occupation error:", error);
				return { success: false, error: "Failed to fetch occupation data" };
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

	// Get religion distribution
	.get(
		"/religion",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kependudukan/distribusiagama/find-many" as any,
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Religion error:", error);
				return { success: false, error: "Failed to fetch religion data" };
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

	// Get births data
	.get(
		"/births",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kesehatan/kelahiran/findMany",
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Births error:", error);
				return { success: false, error: "Failed to fetch births data" };
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

	// Get deaths data
	.get(
		"/deaths",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kesehatan/kematian/findMany",
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Deaths error:", error);
				return { success: false, error: "Failed to fetch deaths data" };
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

	// Get migration data
	.get(
		"/migration",
		async () => {
			try {
				const response = await desaExternalClient.GET(
					"/api/kependudukan/migrasipenduduk/find-many" as any,
				);

				if (response.error) {
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Migration error:", error);
				return { success: false, error: "Failed to fetch migration data" };
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

	// Get sector data
	.get(
		"/sectors",
		async () => {
			try {
				console.log("[Demografi API] Fetching sectors from external API...");
				const response = await desaExternalClient.GET(
					"/api/ekonomi/sektourunggulandesa/find-many" as any,
				);

				if (response.error) {
					console.error("[Demografi API] External sectors error:", response.error);
					return { success: false, error: response.error };
				}

				// Log sample of data to help debugging
				const data = response.data?.data || [];
				console.log(`[Demografi API] Sectors fetched successfully: ${Array.isArray(data) ? data.length : 0} items`);

				return {
					success: true,
					data: data,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Sectors error:", error);
				return { success: false, error: "Failed to fetch sector data" };
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

	// Sync all demografi data
	.post(
		"/sync",
		async () => {
			try {
				console.log("[Demografi API] Starting sync...");

				// Fetch all data in parallel
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
				] = await Promise.all([
					desaExternalClient.GET("/api/kependudukan/dashboard/summary"),
					desaExternalClient.GET("/api/kependudukan/databanjar/find-many" as any),
					desaExternalClient.GET("/api/kependudukan/distribusiumur/find-many" as any),
					desaExternalClient.GET("/api/ekonomi/demografipekerjaan/find-many" as any),
					desaExternalClient.GET("/api/kependudukan/distribusiagama/find-many" as any),
					desaExternalClient.GET("/api/kesehatan/kelahiran/findMany"),
					desaExternalClient.GET("/api/kesehatan/kematian/findMany"),
					desaExternalClient.GET("/api/kependudukan/migrasipenduduk/find-many" as any),
					desaExternalClient.GET("/api/ekonomi/sektourunggulandesa/find-many" as any),
				]);

				// Check for errors
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

				if (errors.length > 0) {
					console.warn("[Demografi API] Some endpoints failed:", errors);
				}

				// Cache the data
				demografiCache.data = {
					summary: summary.data?.data || null,
					banjar: banjar.data?.data || null,
					age: age.data?.data || null,
					occupation: occupation.data?.data || null,
					religion: religion.data?.data || null,
					births: births.data?.data || null,
					deaths: deaths.data?.data || null,
					migration: migration.data?.data || null,
					sectors: sectors.data?.data || null,
				};

				demografiCache.lastSyncedAt = new Date().toISOString();

				console.log(
					"[Demografi API] Sync completed at:",
					demografiCache.lastSyncedAt,
				);

				return {
					success: true,
					message: "Sinkronisasi data demografi berhasil",
					lastSyncedAt: demografiCache.lastSyncedAt,
					errors: errors.length > 0 ? errors : undefined,
				};
			} catch (error) {
				console.error("[Demografi API] Sync error:", error);
				return {
					success: false,
					error: "Gagal melakukan sinkronisasi data demografi",
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

	// Get last sync time
	.get(
		"/last-sync",
		() => {
			return {
				lastSyncedAt: demografiCache.lastSyncedAt,
			};
		},
		{
			response: {
				200: t.Object({
					lastSyncedAt: t.Nullable(t.String()),
				}),
			},
		},
	)

	// Get detailed APBDes data by ID
	.get(
		"/apbdes/:id",
		async ({ params: { id } }) => {
			try {
				console.log(`[Demografi API] Fetching APBDes detail for ID: ${id}`);
				const response = await desaExternalClient.GET(
					`/api/landingpage/apbdes/${id}` as any,
				);

				if (response.error) {
					console.error("[Demografi API] APBDes detail error:", response.error);
					return { success: false, error: response.error };
				}

				return {
					success: true,
					data: response.data || null,
				};
			} catch (error) {
				console.error("[Demografi API] APBDes detail error:", error);
				return { success: false, error: "Failed to fetch APBDes detail data" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					data: t.Any(),
					error: t.Optional(t.String()),
				}),
			},
		},
	);
