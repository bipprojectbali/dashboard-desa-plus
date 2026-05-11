import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

const prefShape = t.Object({
	izinExportData: t.Boolean(),
	requireApprovalPerubahan: t.Boolean(),
});

export const aksesPreferences = new Elysia({
	prefix: "/akses-preferences",
})
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set, user }) => {
			try {
				const pref = await prisma.aksesPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id },
					update: {},
				});
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to get akses preferences",
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
			detail: { summary: "Get akses preferences for current user" },
		},
	)
	.put(
		"/",
		async ({ body, set, user }) => {
			try {
				const pref = await prisma.aksesPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id, ...body },
					update: body,
				});
				logger.info({ userId: user?.id }, "Akses preferences updated");
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to update akses preferences",
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
			detail: { summary: "Save akses preferences for current user" },
		},
	);
