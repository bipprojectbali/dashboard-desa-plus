import { compare, hash } from "bcryptjs";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma";
import { VITE_PUBLIC_URL } from "./env";

const baseUrl = VITE_PUBLIC_URL;
const prisma = new PrismaClient();

// logger.info('Initializing Better Auth with Prisma adapter');
export const auth = betterAuth({
	baseURL: baseUrl,
	basePath: "/api/auth",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		password: {
			hash: (password) => hash(password, 12),
			verify: ({ hash: hashedPassword, password }) =>
				compare(password, hashedPassword),
		},
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "CLIENT_ID_MISSING",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "CLIENT_SECRET_MISSING",
			enabled: true,
			redirectURI: `${baseUrl}/api/auth/callback/github`,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					if (user.email === process.env.ADMIN_EMAIL) {
						return {
							data: {
								...user,
								role: "admin",
								emailVerified: true,
							},
						};
					}
					// Non-admin users require admin verification before they can access
					return { data: { ...user, emailVerified: false } };
				},
			},
		},
		session: {
			create: {
				after: async (session, context) => {
					try {
						const pref = await prisma.keamananPreference.findUnique({
							where: { userId: session.userId },
							select: { logAktivitas: true },
						});
						if (pref?.logAktivitas === false) return;

						const ip =
							context?.request?.headers
								.get("x-forwarded-for")
								?.split(",")[0]
								?.trim() ??
							context?.request?.headers.get("x-real-ip") ??
							null;

						await prisma.activityLog.create({
							data: {
								userId: session.userId,
								action: "login",
								ipAddress: ip,
								userAgent: context?.request?.headers.get("user-agent") ?? null,
							},
						});
					} catch {
						// non-critical
					}
				},
			},
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
		},
		expiresIn: 60 * 60 * 24 * 30, // 30 days
	},
	advanced: {
		cookiePrefix: "bun-react",
		trustProxy: true,
	},
});
