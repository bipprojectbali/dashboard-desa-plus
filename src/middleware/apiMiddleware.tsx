import type Elysia from "elysia";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/db";
import logger from "@/utils/logger";

function getClientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0];
		if (first) return first.trim();
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return "unknown";
}

export function apiMiddleware(app: Elysia) {
	return app
		.derive(async ({ request }) => {
			const headers = request.headers;

			// First, try to get user from session (Better Auth)
			const userSession = await auth.api.getSession({
				headers,
			});

			if (userSession?.user) {
				const userExists = await prisma.user.findUnique({
					where: { id: userSession.user.id },
					select: { id: true },
				});
				if (!userExists) return { user: null };

				return {
					user: {
						...userSession.user,
						id: userSession.user.id,
						email: userSession.user.email,
						name: userSession.user.name,
						image: userSession.user.image,
						emailVerified: userSession.user.emailVerified,
						role: userSession.user.role || "user",
					},
				};
			}

			// If no session, try API key authentication
			let apiKey = headers.get("x-api-key");

			if (!apiKey) {
				// Also check Authorization header for API key
				const authHeader =
					headers.get("authorization") || headers.get("Authorization");
				if (authHeader?.startsWith("Bearer ")) {
					apiKey = authHeader.substring(7);
				}
			}

			if (!apiKey) {
				return { user: null };
			}

			try {
				// Look up the API key in the database
				const apiKeyRecord = await prisma.apiKey.findFirst({
					where: {
						key: apiKey,
						isActive: true,
					},
					include: {
						user: true, // Include the associated user
					},
				});

				if (!apiKeyRecord) {
					return { user: null };
				}

				// Check if API key has expired
				if (
					apiKeyRecord.expiresAt &&
					new Date(apiKeyRecord.expiresAt) < new Date()
				) {
					logger.info({ keyId: apiKeyRecord.id }, "[AUTH] API key expired");
					return { user: null };
				}

				// Return the associated user data
				return {
					user: {
						id: apiKeyRecord.user.id,
						email: apiKeyRecord.user.email,
						name: apiKeyRecord.user.name,
						image: apiKeyRecord.user.image,
						emailVerified: apiKeyRecord.user.emailVerified,
						role: apiKeyRecord.user.role || "user",
					},
				};
			} catch (err) {
				logger.warn({ err }, "[AUTH] Error verifying API key");
				return { user: null };
			}
		})
		.onBeforeHandle(async ({ user, set, request }) => {
			const url = new URL(request.url);
			if (url.pathname.startsWith("/api/docs")) {
				return;
			}

			// Hanya wall-snapshot yang publik (agregat, tanpa PII). Blanket lama
			// `/api/noc/* GET` membuka data warga (latest-discussion → nama+isi
			// pesan, active-divisions/latest-projects → nama). Konsumen frontend
			// tetap lolos via sesi (credentials:"include"), jadi ini aman.
			if (
				url.pathname === "/api/noc/wall-snapshot" &&
				request.method === "GET"
			) {
				return;
			}

			if (!user) {
				logger.warn(`[AUTH] Unauthorized: ${request.method} ${request.url}`);
				set.status = 401;
				return { message: "Unauthorized" };
			}

			// IP whitelist enforcement
			try {
				const pref = await prisma.keamananPreference.findUnique({
					where: { userId: user.id },
					select: { ipWhitelist: true },
				});
				if (pref?.ipWhitelist) {
					const entries = await prisma.ipWhitelistEntry.findMany({
						where: { userId: user.id },
						select: { ip: true },
					});
					if (entries.length > 0) {
						const clientIp = getClientIp(request);
						const allowed = entries.some((e) => e.ip === clientIp);
						if (!allowed) {
							logger.warn(
								{ userId: user.id, clientIp },
								"[IP_WHITELIST] Access denied — IP not in whitelist",
							);
							set.status = 403;
							return { message: "Akses ditolak: IP tidak diizinkan" };
						}
					}
				}
			} catch (err) {
				logger.error({ err }, "[IP_WHITELIST] Error checking whitelist");
			}
		});
}
