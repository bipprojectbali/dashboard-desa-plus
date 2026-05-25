import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import { VITE_PUBLIC_URL } from "../utils/env";
import logger from "../utils/logger";

const EXPIRY_HOURS = 48;

export const invitationRoutes = new Elysia({ prefix: "/invitation" })
	.use(apiMiddleware)
	.post(
		"/",
		async ({ body, set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			try {
				const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
				const inv = await prisma.invitation.create({
					data: {
						email: body.email || null,
						role: body.role ?? "user",
						invitedById: user.id,
						expiresAt,
					},
				});
				const baseUrl = VITE_PUBLIC_URL || "";
				const link = `${baseUrl}/signup?invite=${inv.token}`;
				logger.info(
					{ adminId: user.id, invitationId: inv.id, role: inv.role },
					"Invitation created",
				);
				return {
					data: {
						id: inv.id,
						token: inv.token,
						link,
						role: inv.role,
						expiresAt: inv.expiresAt,
					},
				};
			} catch (error) {
				logger.error({ error }, "Failed to create invitation");
				set.status = 500;
				return { error: "Failed to create invitation" };
			}
		},
		{
			body: t.Object({
				email: t.Optional(t.String()),
				role: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				403: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Generate an invitation link (admin only)" },
		},
	)
	.get(
		"/list",
		async ({ query, set, user }) => {
			if (user?.role !== "admin") {
				set.status = 403;
				return { error: "Forbidden" };
			}
			const page = Math.max(1, Number(query.page ?? 1));
			const limit = Math.min(Math.max(1, Number(query.limit ?? 5)), 100);
			const skip = (page - 1) * limit;

			const [invitations, total] = await Promise.all([
				prisma.invitation.findMany({
					where: { invitedById: user.id },
					orderBy: { createdAt: "desc" },
					take: limit,
					skip,
					select: {
						id: true,
						token: true,
						email: true,
						role: true,
						expiresAt: true,
						usedAt: true,
						createdAt: true,
					},
				}),
				prisma.invitation.count({ where: { invitedById: user.id } }),
			]);

			const baseUrl = VITE_PUBLIC_URL || "";
			return {
				data: invitations.map((inv) => ({
					...inv,
					link: `${baseUrl}/signup?invite=${inv.token}`,
					expired: new Date(inv.expiresAt) < new Date(),
					used: !!inv.usedAt,
				})),
				total,
				page,
				limit,
			};
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					data: t.Any(),
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
				}),
				403: t.Object({ error: t.String() }),
			},
			detail: {
				summary:
					"List invitations created by this admin (paginated, default 5 per page)",
			},
		},
	)
	.get(
		"/:token/validate",
		async ({ params, set }) => {
			const inv = await prisma.invitation.findUnique({
				where: { token: params.token },
			});
			if (!inv) {
				set.status = 404;
				return { error: "Undangan tidak ditemukan" };
			}
			if (inv.usedAt) {
				set.status = 400;
				return { error: "Undangan sudah digunakan" };
			}
			if (new Date(inv.expiresAt) < new Date()) {
				set.status = 400;
				return { error: "Undangan sudah kadaluarsa" };
			}
			return {
				data: { email: inv.email, role: inv.role, expiresAt: inv.expiresAt },
			};
		},
		{
			params: t.Object({ token: t.String() }),
			response: {
				200: t.Object({ data: t.Any() }),
				400: t.Object({ error: t.String() }),
				404: t.Object({ error: t.String() }),
			},
			detail: { summary: "Validate an invitation token (public)" },
		},
	)
	.post(
		"/:token/accept",
		async ({ params, set }) => {
			const inv = await prisma.invitation.findUnique({
				where: { token: params.token },
			});
			if (!inv || inv.usedAt || new Date(inv.expiresAt) < new Date()) {
				set.status = 400;
				return { error: "Undangan tidak valid atau sudah kadaluarsa" };
			}
			await prisma.invitation.update({
				where: { token: params.token },
				data: { usedAt: new Date() },
			});
			return { data: { role: inv.role } };
		},
		{
			params: t.Object({ token: t.String() }),
			response: {
				200: t.Object({ data: t.Any() }),
				400: t.Object({ error: t.String() }),
			},
			detail: { summary: "Mark invitation as used after signup" },
		},
	);
