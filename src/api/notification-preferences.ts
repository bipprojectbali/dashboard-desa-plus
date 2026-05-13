import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

const prefShape = t.Object({
	laporanHarian: t.Boolean(),
	alertSistem: t.Boolean(),
	updateKeamanan: t.Boolean(),
	newsletterBulan: t.Boolean(),
	alertKritis: t.Boolean(),
	aktivitasTim: t.Boolean(),
	komentarMention: t.Boolean(),
	bunyiNotifikasi: t.Boolean(),
	tresholdMemori: t.Boolean(),
	tresholdCpu: t.Boolean(),
	tresholdDisk: t.Boolean(),
});

export const notificationPreferences = new Elysia({
	prefix: "/notification-preferences",
})
	.use(apiMiddleware)
	.get(
		"/",
		async ({ set, user }) => {
			try {
				const pref = await prisma.notificationPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id },
					update: {},
				});
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to get notification preferences",
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
			detail: { summary: "Get notification preferences for current user" },
		},
	)
	.put(
		"/",
		async ({ body, set, user }) => {
			try {
				const pref = await prisma.notificationPreference.upsert({
					where: { userId: user?.id },
					create: { userId: user?.id, ...body },
					update: body,
				});
				logger.info({ userId: user?.id }, "Notification preferences updated");
				return { data: pref };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to update notification preferences",
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
			detail: { summary: "Save notification preferences for current user" },
		},
	);
