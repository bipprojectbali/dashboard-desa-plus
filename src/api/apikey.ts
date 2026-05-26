/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

export const apikey = new Elysia({
	prefix: "/apikey",
})
	.get(
		"/",
		async (ctx) => {
			const { set, user } = ctx as any;
			try {
				// logger.info({ userId: user?.id }, 'Fetching API keys');

				if (!user) {
					set.status = 401;
					return { error: "Unauthorized" };
				}

				const apiKeys = await prisma.apiKey.findMany({
					where: { userId: user.id },
					select: {
						id: true,
						name: true,
						key: true,
						isActive: true,
						expiresAt: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				logger.info(
					{ count: apiKeys.length, userId: user?.id },
					"Fetched API keys",
				);

				return { apiKeys };
			} catch (error) {
				logger.error({ error }, "Failed to fetch API keys");
				set.status = 500;
				return { error: "Failed to fetch API keys" };
			}
		},
		{
			response: {
				200: t.Object({
					apiKeys: t.Array(
						t.Object({
							id: t.String(),
							name: t.String(),
							key: t.String(),
							isActive: t.Boolean(),
							expiresAt: t.Union([t.String(), t.Null(), t.Any()]),
							createdAt: t.Any(),
							updatedAt: t.Any(),
						}),
					),
				}),
				401: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Get all API keys",
				description: "Get all API keys",
			},
		},
	)
	.post(
		"/",
		async (ctx) => {
			const { body, set, user, request } = ctx as any;
			try {
				const { name, expiresAt } = body;

				if (!user) {
					set.status = 401;
					return { error: "Unauthorized" };
				}

				// Generate a unique API key
				const apiKeyValue = `sk-${nanoid(32)}`;

				const newApiKey = await prisma.apiKey.create({
					data: {
						name,
						key: apiKeyValue,
						userId: user.id,
						isActive: true,
						expiresAt: expiresAt ? new Date(expiresAt) : null,
					},
					select: {
						id: true,
						name: true,
						key: true,
						isActive: true,
						expiresAt: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				await prisma.activityLog.create({
					data: {
						userId: user.id,
						action: "create-api-key",
						detail: JSON.stringify({ apiKeyId: newApiKey.id, name }),
						ipAddress:
							request.headers.get("x-forwarded-for") ??
							request.headers.get("x-real-ip") ??
							null,
						userAgent: request.headers.get("user-agent") ?? null,
					},
				});

				return { apiKey: newApiKey };
			} catch (error) {
				set.status = 500;
				logger.error({ error }, "Failed to create API key");
				return { error: "Failed to create API key" };
			}
		},
		{
			body: t.Object({
				name: t.String(),
				expiresAt: t.Optional(t.String()), // ISO date string
			}),
			response: {
				200: t.Object({
					apiKey: t.Object({
						id: t.String(),
						name: t.String(),
						key: t.String(),
						isActive: t.Boolean(),
						expiresAt: t.Union([t.String(), t.Null(), t.Any()]),
						createdAt: t.Any(),
						updatedAt: t.Any(),
					}),
				}),
				401: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Create a new API key",
				description: "Create a new API key",
			},
		},
	)
	.post(
		"/update",
		async (ctx) => {
			const { body, set, user } = ctx as any;
			try {
				const { id, isActive, expiresAt } = body;

				logger.info(
					{ id, isActive, expiresAt, userId: user?.id },
					"Patch API key called",
				);

				if (!user) {
					set.status = 401;
					logger.error(
						{ id, isActive, expiresAt, userId: user?.id },
						"Unauthorized",
					);
					return { error: "Unauthorized" };
				}

				// Verify that the API key belongs to the user
				const apiKey = await prisma.apiKey.findUnique({
					where: { id },
				});

				logger.debug({ apiKey }, "Found API key");

				if (!apiKey || apiKey.userId !== user.id) {
					set.status = 403;
					logger.error({ id, apiKey, userId: user?.id }, "Forbidden");
					return { error: "Forbidden" };
				}

				const updatedApiKey = await prisma.apiKey.update({
					where: { id },
					data: {
						isActive,
						expiresAt:
							expiresAt !== undefined
								? expiresAt
									? new Date(expiresAt)
									: null
								: undefined,
					},
					select: {
						id: true,
						name: true,
						key: true,
						isActive: true,
						expiresAt: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				logger.info({ apiKeyId: updatedApiKey.id }, "Updated API key");

				return { apiKey: updatedApiKey };
			} catch (error) {
				logger.error({ error }, "Error updating API key");
				set.status = 500;
				return { error: "Failed to update API key" };
			}
		},
		{
			body: t.Object({
				id: t.String(),
				isActive: t.Boolean(),
				expiresAt: t.Optional(t.Union([t.String(), t.Null()])), // ISO date string or null
			}),
			response: {
				200: t.Object({
					apiKey: t.Object({
						id: t.String(),
						name: t.String(),
						key: t.String(),
						isActive: t.Boolean(),
						expiresAt: t.Union([t.String(), t.Null(), t.Any()]),
						createdAt: t.Any(),
						updatedAt: t.Any(),
					}),
				}),
				401: t.Object({ error: t.String() }),
				403: t.Object({ error: t.String() }),
				500: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Update an API key",
				description: "Update an API key",
			},
		},
	)
	.post(
		"/delete",
		async (ctx) => {
			const { body, set, user, request } = ctx as any;
			try {
				const { id } = body;

				logger.info({ id, userId: user?.id }, "Deleting API key");

				if (!user) {
					set.status = 401;
					return { error: "Unauthorized" };
				}

				// Verify that the API key belongs to the user
				const apiKey = await prisma.apiKey.findUnique({
					where: { id },
				});

				if (!apiKey || apiKey.userId !== user.id) {
					set.status = 403;
					logger.warn(
						{ id, userId: user?.id },
						"Attempt to delete API key from another user",
					);
					return { error: "Forbidden" };
				}

				await prisma.apiKey.delete({
					where: { id },
				});

				logger.info({ id }, "Deleted API key");

				await prisma.activityLog.create({
					data: {
						userId: user.id,
						action: "delete-api-key",
						detail: JSON.stringify({ apiKeyId: id, name: apiKey.name }),
						ipAddress:
							request.headers.get("x-forwarded-for") ??
							request.headers.get("x-real-ip") ??
							null,
						userAgent: request.headers.get("user-agent") ?? null,
					},
				});

				return { success: true };
			} catch (error) {
				logger.error({ error }, "Failed to delete API key");
				set.status = 500;
				return { error: "Failed to delete API key" };
			}
		},
		{
			body: t.Object({
				id: t.String(),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
				}),
				500: t.Object({ error: t.String() }),
				403: t.Object({ error: t.String() }),
				401: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Delete an API key",
				description: "Delete an API key",
			},
		},
	);
