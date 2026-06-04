import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import {
	type AppRole,
	DEFAULT_PERMISSIONS,
	FEATURES,
} from "../utils/permission";

export const myPermissions = new Elysia({ prefix: "/my-permissions" })
	.use(apiMiddleware)
	.get("/", async ({ user }) => {
		if (!user) return { allowed: [] as string[] };
		if (user.role === "admin") return { allowed: FEATURES.map((f) => f.key) };

		try {
			const records = await prisma.rolePermission.findMany({
				where: { role: user.role, allowed: true },
				select: { feature: true },
			});
			if (records.length > 0) {
				return { allowed: records.map((r) => r.feature) };
			}
			// Tabel kosong atau belum di-seed — gunakan default
			const defaults =
				DEFAULT_PERMISSIONS[user.role as AppRole] ?? DEFAULT_PERMISSIONS.user;
			return { allowed: [...defaults] };
		} catch {
			// P2021 atau error lain — fallback ke defaults
			const defaults =
				DEFAULT_PERMISSIONS[user.role as AppRole] ?? DEFAULT_PERMISSIONS.user;
			return { allowed: [...defaults] };
		}
	});
