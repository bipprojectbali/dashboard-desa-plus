import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";
import { resolveAllowedFeatures } from "../utils/permission";

export const myPermissions = new Elysia({ prefix: "/my-permissions" })
	.use(apiMiddleware)
	.get("/", async ({ user }) => {
		if (!user) return { allowed: [] as string[] };

		try {
			const records = await prisma.rolePermission.findMany({
				where: { role: user.role },
				select: { feature: true, allowed: true },
			});
			return { allowed: resolveAllowedFeatures(user.role, records) };
		} catch (err) {
			// P2021 (tabel belum ada) atau error DB lain — pakai default role
			logger.warn(
				{ err, role: user.role },
				"[PERMISSION] Failed to read role permissions, using defaults",
			);
			return { allowed: resolveAllowedFeatures(user.role, []) };
		}
	});
