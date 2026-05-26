import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const ipWhitelist = new Elysia({ prefix: "/ip-whitelist" })
	.use(apiMiddleware)
	.get(
		"/",
		async ({ user, set }) => {
			try {
				const entries = await prisma.ipWhitelistEntry.findMany({
					where: { userId: user?.id ?? "" },
					orderBy: { createdAt: "asc" },
					select: { id: true, ip: true, label: true, createdAt: true },
				});
				return { data: entries };
			} catch (error) {
				logger.error({ error, userId: user?.id }, "Failed to get IP whitelist");
				set.status = 500;
				return { error: "Gagal mengambil daftar IP" };
			}
		},
		{
			response: {
				200: t.Object({ data: t.Any() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Get IP whitelist entries for current user" },
		},
	)
	.post(
		"/",
		async ({ body, user, set }) => {
			const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
			const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
			if (!ipv4Regex.test(body.ip) && !ipv6Regex.test(body.ip)) {
				set.status = 400;
				return { error: "Format IP tidak valid" };
			}
			try {
				const entry = await prisma.ipWhitelistEntry.create({
					data: {
						userId: user?.id ?? "",
						ip: body.ip,
						label: body.label ?? null,
					},
					select: { id: true, ip: true, label: true, createdAt: true },
				});
				logger.info(
					{ userId: user?.id, ip: body.ip },
					"IP whitelist entry added",
				);
				return { data: entry };
			} catch (error: unknown) {
				if (
					typeof error === "object" &&
					error !== null &&
					"code" in error &&
					(error as { code: string }).code === "P2002"
				) {
					set.status = 409;
					return { error: "IP sudah ada di whitelist" };
				}
				logger.error({ error, userId: user?.id }, "Failed to add IP whitelist");
				set.status = 500;
				return { error: "Gagal menambahkan IP" };
			}
		},
		{
			body: t.Object({
				ip: t.String({ minLength: 1 }),
				label: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({ data: t.Any() }),
				400: t.Object({ error: t.String() }),
				409: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Add IP to whitelist" },
		},
	)
	.delete(
		"/:id",
		async ({ params, user, set }) => {
			try {
				const entry = await prisma.ipWhitelistEntry.findFirst({
					where: { id: params.id, userId: user?.id ?? "" },
				});
				if (!entry) {
					set.status = 404;
					return { error: "Entry tidak ditemukan" };
				}
				await prisma.ipWhitelistEntry.delete({ where: { id: params.id } });
				logger.info(
					{ userId: user?.id, ip: entry.ip },
					"IP whitelist entry removed",
				);
				return { data: { deleted: true } };
			} catch (error) {
				logger.error(
					{ error, userId: user?.id },
					"Failed to delete IP whitelist",
				);
				set.status = 500;
				return { error: "Gagal menghapus IP" };
			}
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: t.Object({ data: t.Any() }),
				404: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: { summary: "Remove IP from whitelist" },
		},
	);
