import createClient from "openapi-fetch";
import type { paths } from "../../generated/noc-external";
import { getEnv } from "./env";

/**
 * NOC External Client
 * Digunakan khusus untuk menarik data dari server NOC darmasaba.muku.id
 */
const externalBaseUrl = getEnv(
	"NOC_API_URL",
	"https://darmasaba.muku.id/api/noc",
);

// Hilangkan path dokumentasi dan prefix /api/noc jika ada di URL base,
// karena 'paths' di generated/noc-external.ts sudah menyertakan prefix /api/noc
const cleanBaseUrl = externalBaseUrl
	.replace("/api/noc/docs/json", "")
	.replace("/docs/json", "")
	.replace(/\/api\/noc\/?$/, "");

const nocApiKey = getEnv("NOC_API_KEY", "");

export const nocExternalClient = createClient<paths>({
	baseUrl: cleanBaseUrl,
	headers: {
		"x-api-key": nocApiKey,
	},
});
