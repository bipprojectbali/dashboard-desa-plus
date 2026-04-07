import createClient from "openapi-fetch";
import { getEnv } from "./env";

/**
 * Desa Website External Client
 * Digunakan khusus untuk menarik data dari website Desa Darmasaba
 * Production: https://darmasaba.desa.id
 * Staging: https://desa-darmasaba-stg.wibudev.com
 */
const externalBaseUrl = getEnv(
	"DESA_API_URL",
	"https://desa-darmasaba-stg.wibudev.com",
);

// Clean base URL - remove any trailing slashes
const cleanBaseUrl = externalBaseUrl.replace(/\/+$/, "");

console.log("[Desa API Client] Base URL:", cleanBaseUrl);

// Use generic type for flexible API calls
// Since we don't have the exact schema, we use a flexible approach
type DesaPaths = {
	[path: string]: {
		parameters?: {
			path?: Record<string, string>;
			query?: Record<string, string>;
		};
		responses?: {
			200?: any;
		};
	};
};

export const desaExternalClient = createClient<DesaPaths>({
	baseUrl: cleanBaseUrl,
});
