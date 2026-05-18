import createClient from "openapi-fetch";
import type { paths } from "../../generated/desa-external";
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

export const desaExternalClient = createClient<paths>({
	baseUrl: cleanBaseUrl,
});
