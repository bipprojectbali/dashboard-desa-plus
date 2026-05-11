import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

const prefShape = t.Object({
	twoFactorAuth: t.Boolean(),
	biometrikLogin: t.Boolean(),
	ipWhitelist: t.Boolean(),
	logAktivitas: t.Boolean(),
});

export const keamananPreferences = new Elysia({
	prefix: "/keamanan-preferences",
})
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set, user }) => {
			try {
				const pref = await prisma.keamananPreference.upsert({
					where: { userId: user!.id },
					create: { userId: user!.id },
					update: {},
				});
				return { data: pref };
			} catch (error) {
				logger.error({ error, userId: user!.id }, "Failed to get keamanan preferences");
				set.status = 500;
				return { error: "Failed to get preferences" };
			}
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get keamanan preferences for current user" },
		},
	)
	.put(
		"/",
		async ({ body, set, user }) => {
			try {
				const pref = await prisma.keamananPreference.upsert({
					where: { userId: user!.id },
					create: { userId: user!.id, ...body },
					update: body,
				});
				logger.info({ userId: user!.id }, "Keamanan preferences updated");
				return { data: pref };
			} catch (error) {
				logger.error({ error, userId: user!.id }, "Failed to update keamanan preferences");
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
			detail: { summary: "Save keamanan preferences for current user" },
		},
	);
