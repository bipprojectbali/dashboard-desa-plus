import { getEnv } from "./env";

/**
 * Platform External Client — server-only.
 * Menarik data live dari Desa Platform (desa-platform-stg.wibudev.com) untuk
 * card pengaduan & surat dashboard (Fase 2). Auth = Bearer token.
 * TANPA prefix VITE_: dipanggil server-side, token tak boleh ter-bundle ke FE.
 * Platform tak expose OpenAPI (`/docs/json` 404) → raw fetch, bukan openapi-fetch.
 */
const PLATFORM_BASE_URL = getEnv(
	"PLATFORM_API_URL",
	"https://desa-platform-stg.wibudev.com",
);
const PLATFORM_TOKEN = getEnv("PLATFORM_API_TOKEN", "");

export interface PlatformListResponse<T> {
	data: T[];
	total?: number;
	page?: number;
	limit?: number;
}

/**
 * GET ke Platform API, validasi bentuk `{ data: [...] }`.
 * Throw pada non-2xx atau payload invalid — pemanggil bungkus withCache
 * (fn throw ⇒ tak ter-cache) + outer catch → empty-state.
 */
export async function platformFetch<T = unknown>(
	path: string,
): Promise<PlatformListResponse<T>> {
	const response = await fetch(`${PLATFORM_BASE_URL}${path}`, {
		headers: {
			Authorization: `Bearer ${PLATFORM_TOKEN}`,
			Accept: "application/json",
		},
	});
	if (!response.ok) throw new Error(`Platform API error: ${response.status}`);
	const json = (await response.json()) as PlatformListResponse<T>;
	if (!json || !Array.isArray(json.data))
		throw new Error("Invalid response from Platform API");
	return json;
}
