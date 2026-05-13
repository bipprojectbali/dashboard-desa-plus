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
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Save umum preferences for current user" },
		},
	);
