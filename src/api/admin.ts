import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { cache } from "../utils/cache";
import { prisma } from "../utils/db";
import logger from "../utils/logger";
import {
	DEFAULT_PERMISSIONS,
	FEATURES,
	ROLES,
	seedDefaultPermissions,
} from "../utils/permission";

export const adminApi = new Elysia({ prefix: "/admin" })
	.use(apiMiddleware)
	.get(
		"/users",
		async ({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
					createdAt: true,
					emailVerified: true,
				},
				orderBy: { createdAt: "desc" },
			});
			return { users };
		},
		{
			detail: { summary: "List all users (admin only)" },
		},
	)
	.get(
		"/stats",
		async ({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const [userCount, adminCount] = await Promise.all([
				prisma.user.count(),
				prisma.user.count({ where: { role: "admin" } }),
			]);
			const pkg = (await Bun.file("package.json").json()) as {
				version: string;
				name: string;
			};
			return {
				userCount,
				adminCount,
				version: pkg.version,
				appName: pkg.name,
				environment: process.env.NODE_ENV || "development",
			};
		},
		{
			detail: { summary: "Admin system stats" },
		},
	)
	.get(
		"/user-stats",
		async ({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const [total, adminCount] = await Promise.all([
				prisma.user.count(),
				prisma.user.count({ where: { role: "admin" } }),
			]);
			const userCount = total - adminCount;
			return {
				data: {
					total,
					roles: [
						{
							role: "admin",
							label: "Administrator",
							count: adminCount,
							color: "red",
						},
						{
							role: "user",
							label: "Pengguna",
							count: userCount,
							color: "blue",
						},
					],
				},
			};
		},
		{
			detail: { summary: "User count per role (admin only)" },
		},
	)
	.post(
		"/users/update-role",
		async ({ body, set, user, request }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			if (user.id === body.id) {
				set.status = 400;
				return { error: "Cannot change your own role" };
			}
			const target = await prisma.user.findUnique({
				where: { id: body.id },
				select: { role: true },
			});
			const updated = await prisma.user.update({
				where: { id: body.id },
				data: { role: body.role },
				select: { id: true, name: true, email: true, role: true },
			});
			logger.info(
				{ adminId: user.id, targetId: body.id, newRole: body.role },
				"User role updated",
			);
			await prisma.activityLog.create({
				data: {
					userId: user.id,
					action: "update-role",
					detail: JSON.stringify({
						targetId: body.id,
						oldRole: target?.role,
						newRole: body.role,
					}),
					ipAddress:
						request.headers.get("x-forwarded-for") ??
						request.headers.get("x-real-ip") ??
						null,
					userAgent: request.headers.get("user-agent") ?? null,
				},
			});
			return { user: updated };
		},
		{
			body: t.Object({ id: t.String(), role: t.String() }),
			detail: { summary: "Update user role (admin only)" },
		},
	)
	.post(
		"/users/verify",
		async ({ body, set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			await prisma.user.update({
				where: { id: body.id },
				data: { emailVerified: body.verified },
			});
			logger.info(
				{ adminId: user.id, targetId: body.id, verified: body.verified },
				"User email verification updated",
			);
			return { success: true };
		},
		{
			body: t.Object({ id: t.String(), verified: t.Boolean() }),
			detail: { summary: "Set user email verification (admin only)" },
		},
	)
	.post(
		"/users/delete",
		async ({ body, set, user, request }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			if (user.id === body.id) {
				set.status = 400;
				return { error: "Cannot delete your own account" };
			}
			await prisma.user.delete({ where: { id: body.id } });
			logger.info(
				{ adminId: user.id, deletedId: body.id },
				"User deleted by admin",
			);
			await prisma.activityLog.create({
				data: {
					userId: user.id,
					action: "delete-user",
					detail: JSON.stringify({ targetId: body.id }),
					ipAddress:
						request.headers.get("x-forwarded-for") ??
						request.headers.get("x-real-ip") ??
						null,
					userAgent: request.headers.get("user-agent") ?? null,
				},
			});
			return { success: true };
		},
		{
			body: t.Object({ id: t.String() }),
			detail: { summary: "Delete user (admin only)" },
		},
	)
	.get(
		"/activity-logs",
		async ({ query, user, set }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const page = Math.max(1, Number(query.page ?? 1));
			const limit = 50;
			const skip = (page - 1) * limit;

			const where = {
				...(query.userId ? { userId: query.userId } : {}),
				...(query.action ? { action: { in: query.action.split(",") } } : {}),
				...(query.from || query.to
					? {
							createdAt: {
								...(query.from ? { gte: new Date(query.from) } : {}),
								...(query.to ? { lte: new Date(query.to) } : {}),
							},
						}
					: {}),
			};

			const [logs, total] = await Promise.all([
				prisma.activityLog.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: "desc" },
					include: { user: { select: { name: true, email: true } } },
				}),
				prisma.activityLog.count({ where }),
			]);

			return { data: logs, total, page, limit };
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				userId: t.Optional(t.String()),
				action: t.Optional(t.String()),
				from: t.Optional(t.String()),
				to: t.Optional(t.String()),
			}),
			detail: { summary: "List all activity logs (admin only)" },
		},
	)
	.get(
		"/cache/stats",
		({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			return cache.stats();
		},
		{ detail: { summary: "Get in-memory cache stats (admin only)" } },
	)
	.delete(
		"/cache/flush",
		({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const flushed = cache.flush();
			return { flushed };
		},
		{ detail: { summary: "Flush all in-memory cache entries (admin only)" } },
	)
	.post(
		"/cache/invalidate",
		({ set, user, body }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const deleted = cache.deleteByPrefix(`${body.prefix}:`);
			return { deleted };
		},
		{
			body: t.Object({ prefix: t.String({ minLength: 1 }) }),
			detail: {
				summary:
					"Invalidate cache entries by prefix (admin only). prefix: keamanan | sosial | bumdes | umkm | apbdes | demografi",
			},
		},
	)
	.get(
		"/activity-logs/export",
		async ({ query, user, set }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}

			const where = {
				...(query.userId ? { userId: query.userId } : {}),
				...(query.action ? { action: { in: query.action.split(",") } } : {}),
				...(query.from || query.to
					? {
							createdAt: {
								...(query.from ? { gte: new Date(query.from) } : {}),
								...(query.to ? { lte: new Date(query.to) } : {}),
							},
						}
					: {}),
			};

			const logs = await prisma.activityLog.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: 5000,
				include: { user: { select: { name: true, email: true } } },
			});

			const { buildPdfTable } = await import("../utils/pdf-table");

			const buffer = await buildPdfTable({
				title: "Audit Log Sistem",
				columns: [
					{ header: "Waktu", key: "createdAt", width: 100 },
					{ header: "User", key: "name", width: 90 },
					{ header: "Email", key: "email", width: 110 },
					{ header: "Action", key: "action", width: 80 },
					{ header: "Detail", key: "detail", width: 85 },
					{ header: "IP Address", key: "ip", width: 50 },
				],
				rows: logs.map((l) => ({
					createdAt: new Date(l.createdAt).toLocaleString("id-ID"),
					name: l.user?.name ?? "-",
					email: l.user?.email ?? "-",
					action: l.action,
					detail: l.detail ?? "-",
					ip: l.ipAddress ?? "-",
				})),
			});

			const ab = buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			) as ArrayBuffer;
			const date = new Date().toISOString().split("T")[0];
			return new Response(ab, {
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="audit-log-${date}.pdf"`,
				},
			});
		},
		{
			query: t.Object({
				userId: t.Optional(t.String()),
				action: t.Optional(t.String()),
				from: t.Optional(t.String()),
				to: t.Optional(t.String()),
			}),
			detail: { summary: "Export activity logs as PDF (admin only)" },
		},
	)
	.get(
		"/roles/permissions",
		async ({ set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}

			try {
				await seedDefaultPermissions();
			} catch (e) {
				if ((e as { code?: string })?.code !== "P2021") throw e;
			}

			let records: { role: string; feature: string; allowed: boolean }[] = [];
			try {
				records = await prisma.rolePermission.findMany({
					select: { role: true, feature: true, allowed: true },
					orderBy: [{ role: "asc" }, { feature: "asc" }],
				});
			} catch (e) {
				// P2021 = tabel belum ada (migration pending) — return empty matrix
				if ((e as { code?: string })?.code !== "P2021") throw e;
			}

			// Build matrix — fallback ke DEFAULT_PERMISSIONS jika records kosong (P2021)
			const useDefaults = records.length === 0;
			const matrix: Record<string, Record<string, boolean>> = {};
			for (const r of ROLES) {
				matrix[r] = {};
				for (const f of FEATURES) {
					matrix[r][f.key] = useDefaults
						? (DEFAULT_PERMISSIONS[
								r as keyof typeof DEFAULT_PERMISSIONS
							]?.includes(f.key) ?? false)
						: false;
				}
			}
			for (const rec of records) {
				if (matrix[rec.role]) {
					matrix[rec.role][rec.feature] = rec.allowed;
				}
			}

			return { matrix, features: FEATURES, roles: ROLES };
		},
		{ detail: { summary: "Get role permission matrix (admin only)" } },
	)
	.put(
		"/roles/permissions",
		async ({ body, set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}

			try {
				const ops = body.permissions.map(({ role, feature, allowed }) =>
					prisma.rolePermission.upsert({
						where: { role_feature: { role, feature } },
						create: { role, feature, allowed },
						update: { allowed },
					}),
				);
				await prisma.$transaction(ops);
			} catch (e) {
				if ((e as { code?: string })?.code === "P2021") {
					set.status = 503;
					return {
						error:
							"Tabel permission belum siap. Deploy ulang untuk menerapkan migration.",
					};
				}
				throw e;
			}

			return { success: true, updated: body.permissions.length };
		},
		{
			body: t.Object({
				permissions: t.Array(
					t.Object({
						role: t.String(),
						feature: t.String(),
						allowed: t.Boolean(),
					}),
				),
			}),
			detail: { summary: "Update role permission matrix (admin only)" },
		},
	);
