import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

const prefShape = t.Object({
	bahasa: t.String(),
	zonaWaktu: t.String(),
	formatTanggal: t.String(),
	refreshOtomatis: t.Boolean(),
	intervalRefresh: t.String(),
	tampilkanGrid: t.Boolean(),
	animasiTransisi: t.Boolean(),
});

export const umumPreferences = new Elysia({
	prefix: "/umum-preferences",
})
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set, user }) => {
			try {
				// Non-admin users always inherit preferences from admin (global defaults)
				if (user?.role !== "admin") {
					const adminUser = await prisma.user.findFirst({
						where: { role: "admin" },
						select: { id: true },
					});
					if (adminUser) {
						const adminPref = await prisma.umumPreference.findUnique({
							where: { userId: adminUser.id },
						});
						if (adminPref) return { data: adminPref };
					}
					// No admin prefs saved yet — return hardcoded defaults
					return {
						data: {
							bahasa: "id",
							zonaWaktu: "Asia/Jakarta",
							formatTanggal: "DD/MM/YYYY",
							refreshOtomatis: true,
							intervalRefresh: "1",
							tampilkanGrid: true,
							animasiTransisi: true,
						},
					};
				}

				const userExists = await prisma.user.findUnique({
					where: { id: user?.id },
					select: { id: true },
				});
				if (!userExists) {
					return {
						data: {
							bahasa: "id",
							zonaWaktu: "Asia/Jakarta",
							formatTanggal: "DD/MM/YYYY",
							refreshOtomatis: true,
							intervalRefresh: "1",
							tampilkanGrid: true,
							animasiTransisi: true,
						},
					};
				}
				const pref = await prisma.umumPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id },
					update: {},
				});
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to get umum preferences",
				);
				set.status = 500;
				return { error: "Failed to get preferences" };
			}
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get umum preferences for current user" },
		},
	)
	.put(
		"/",
		async ({ body, set, user }) => {
			try {
				const userExists = await prisma.user.findUnique({
					where: { id: user?.id },
					select: { id: true },
				});
				if (!userExists) {
					set.status = 400;
					return { error: "User tidak ditemukan" };
				}
				const pref = await prisma.umumPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id, ...body },
					update: body,
				});
				logger.info({ userId: user?.id }, "Umum preferences updated");
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to update umum preferences",
				);
				set.status = 500;
				return { error: "Failed to save preferences" };
			}
		},
		{
			body: prefShape,
			response: {
				200: t.Object({ data: t.Any() }),
				400: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Save umum preferences for current user" },
		},
	);
