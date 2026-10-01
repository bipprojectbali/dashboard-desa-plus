import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import logger from "../utils/logger";
import {
	loadAllowedFeatures,
	resolveAllowedFeatures,
} from "../utils/permission";

export const myPermissions = new Elysia({ prefix: "/my-permissions" })
	.use(apiMiddleware)
	.get("/", async ({ user }) => {
		if (!user) return { allowed: [] as string[] };

		try {
			return { allowed: await loadAllowedFeatures(user.role) };
		} catch (err) {
			// P2021 (tabel belum ada) atau error DB lain — pakai default role
			logger.warn(
				{ err, role: user.role },
				"[PERMISSION] Failed to read role permissions, using defaults",
			);
			return { allowed: resolveAllowedFeatures(user.role, []) };
		}
	});
