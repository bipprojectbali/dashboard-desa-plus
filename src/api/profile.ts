import Elysia, { t } from "elysia";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

interface AuthenticatedUser {
	id: string;
	email: string;
	name?: string | null;
}

export const profile = new Elysia({
	prefix: "/profile",
}).post(
	"/update",
	async ({
		body,
		set,
		user,
	}: {
		body: { name?: string; image?: string };
		set: any;
		user?: AuthenticatedUser;
	}) => {
		try {
			if (!user) {
				set.status = 401;
				return { error: "Unauthorized" };
			}

			const { name, image } = body;

			const updatedUser = await prisma.user.update({
				where: { id: user.id },
				data: {
					name: name || undefined,
					image: image || undefined,
				},
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					role: true,
				},
			});

			logger.info({ userId: user.id }, "Profile updated successfully");

			return { user: updatedUser };
		} catch (error) {
			logger.error({ error, userId: user?.id }, "Failed to update profile");
			set.status = 500;
			return { error: "Failed to update profile" };
		}
	},
	{
		body: t.Object({
			name: t.Optional(t.String()),
			image: t.Optional(t.String()),
		}),
		response: {
			200: t.Object({
				user: t.Object({
					id: t.String(),
					name: t.Any(),
					email: t.String(),
					image: t.Any(),
					role: t.Any(),
				}),
			}),
			401: t.Object({ error: t.String() }),
			500: t.Object({ error: t.String() }),
		},

		detail: {
			summary: "Update user profile",
			description: "Update the authenticated user's name or profile image",
		},
	},
);
