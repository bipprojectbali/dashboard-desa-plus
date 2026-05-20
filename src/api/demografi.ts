import { Elysia, t } from "elysia";
import { desaExternalClient } from "@/utils/desa-external-client";

function extractError(err: unknown): string {
	if (!err) return "Unknown error";
	if (typeof err === "string") return err;
	const e = err as Record<string, unknown>;
	return String(e.error || e.message || JSON.stringify(err));
}

// In-memory cache for demografi data
export const demografiCache = {
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
				if (demografiCache.data.summary) {
					return {
						success: true,
						data: demografiCache.data.summary,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kependudukan/dashboard/summary",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Summary error:", error);
				return {
					success: false,
					error: "Failed to fetch summary data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get banjar data
	.get(
		"/banjar",
		async () => {
			try {
				if (demografiCache.data.banjar) {
					return {
						success: true,
						data: demografiCache.data.banjar,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kependudukan/databanjar/find-many",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Banjar error:", error);
				return {
					success: false,
					error: "Failed to fetch banjar data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get age distribution
	.get(
		"/age",
		async () => {
			try {
				if (demografiCache.data.age) {
					return {
						success: true,
						data: demografiCache.data.age,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kependudukan/distribusiumur/find-many",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Age error:", error);
				return {
					success: false,
					error: "Failed to fetch age data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get occupation data
	.get(
		"/occupation",
		async () => {
			try {
				if (demografiCache.data.occupation) {
					return {
						success: true,
						data: demografiCache.data.occupation,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/ekonomi/demografipekerjaan/find-many",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Occupation error:", error);
				return {
					success: false,
					error: "Failed to fetch occupation data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get religion distribution
	.get(
		"/religion",
		async () => {
			try {
				if (demografiCache.data.religion) {
					return {
						success: true,
						data: demografiCache.data.religion,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kependudukan/distribusiagama/find-many",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Religion error:", error);
				return {
					success: false,
					error: "Failed to fetch religion data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get births data
	.get(
		"/births",
		async () => {
			try {
				if (demografiCache.data.births) {
					return {
						success: true,
						data: demografiCache.data.births,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kesehatan/kelahiran/findMany",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Births error:", error);
				return {
					success: false,
					error: "Failed to fetch births data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get deaths data
	.get(
		"/deaths",
		async () => {
			try {
				if (demografiCache.data.deaths) {
					return {
						success: true,
						data: demografiCache.data.deaths,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kesehatan/kematian/findMany",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Deaths error:", error);
				return {
					success: false,
					error: "Failed to fetch deaths data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get migration data
	.get(
		"/migration",
		async () => {
			try {
				if (demografiCache.data.migration) {
					return {
						success: true,
						data: demografiCache.data.migration,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				const response = await desaExternalClient.GET(
					"/api/kependudukan/migrasipenduduk/find-many",
				);

				if (response.error) {
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data?.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Migration error:", error);
				return {
					success: false,
					error: "Failed to fetch migration data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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

	// Get sector data
	.get(
		"/sectors",
		async () => {
			try {
				if (demografiCache.data.sectors) {
					return {
						success: true,
						data: demografiCache.data.sectors,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				console.log("[Demografi API] Fetching sectors from external API...");
				const response = await desaExternalClient.GET(
					"/api/ekonomi/sektourunggulandesa/find-many",
				);

				if (response.error) {
					console.error(
						"[Demografi API] External sectors error:",
						response.error,
					);
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				// Log sample of data to help debugging
				const data = response.data?.data || [];
				console.log(
					`[Demografi API] Sectors fetched successfully: ${Array.isArray(data) ? data.length : 0} items`,
				);

				return {
					success: true,
					data: data,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] Sectors error:", error);
				return {
					success: false,
					error: "Failed to fetch sector data",
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
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
				if (apbdes.error) errors.push("apbdes");

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
					apbdes: apbdes.data?.data || apbdes.data || null,
				};

				demografiCache.lastSyncedAt = new Date().toISOString();

				console.log(
					"[Demografi API] Sync completed at:",
					demografiCache.lastSyncedAt,
				);

				return {
					success: true,
					message: "Sinkronisasi data desa berhasil",
					lastSyncedAt: demografiCache.lastSyncedAt,
					errors: errors.length > 0 ? errors : undefined,
				};
			} catch (error) {
				console.error("[Demografi API] Sync error:", error);
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
				// Use cache if it matches the ID and exists
				if (
					demografiCache.data.apbdes &&
					(demografiCache.data.apbdes.id === id || id === "cmk-apbdes-001")
				) {
					console.log("[Demografi API] Returning cached APBDes detail");
					return {
						success: true,
						data: demografiCache.data.apbdes,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				console.log(`[Demografi API] Fetching APBDes detail for ID: ${id}`);
				const response = await desaExternalClient.GET(
					"/api/landingpage/apbdes/{id}",
					{ params: { path: { id } } },
				);

				if (response.error) {
					console.error("[Demografi API] APBDes detail error:", response.error);
					return {
						success: false,
						error: extractError(response.error),
						data: null,
						lastSyncedAt: demografiCache.lastSyncedAt,
					};
				}

				return {
					success: true,
					data: response.data || null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
			} catch (error) {
				console.error("[Demografi API] APBDes detail error:", error);
				return {
					success: false,
					error: extractError(error),
					data: null,
					lastSyncedAt: demografiCache.lastSyncedAt,
				};
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
					lastSyncedAt: t.Nullable(t.String()),
					error: t.Optional(t.String()),
				}),
			},
		},
	);
