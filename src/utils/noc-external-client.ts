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

// Hilangkan suffix /docs/json jika ada di URL
const cleanBaseUrl = externalBaseUrl.replace("/docs/json", "");

export const nocExternalClient = createClient<paths>({
	baseUrl: cleanBaseUrl,
});
