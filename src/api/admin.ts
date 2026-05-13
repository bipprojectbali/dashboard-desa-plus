import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

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
		async ({ body, set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			if (user.id === body.id) {
				set.status = 400;
				return { error: "Cannot change your own role" };
			}
			const updated = await prisma.user.update({
				where: { id: body.id },
				data: { role: body.role },
				select: { id: true, name: true, email: true, role: true },
			});
			logger.info(
				{ adminId: user.id, targetId: body.id, newRole: body.role },
				"User role updated",
			);
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
		async ({ body, set, user }) => {
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
			return { success: true };
		},
		{
			body: t.Object({ id: t.String() }),
			detail: { summary: "Delete user (admin only)" },
		},
	);
