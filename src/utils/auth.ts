import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma";
import logger from "./logger";

const baseUrl = process.env.VITE_PUBLIC_URL;
const prisma = new PrismaClient();

if (!baseUrl) {
	logger.error("VITE_PUBLIC_URL is not defined");
	throw new Error("VITE_PUBLIC_URL is not defined");
}

// logger.info('Initializing Better Auth with Prisma adapter');
export const auth = betterAuth({
	baseURL: baseUrl,
	basePath: "/api/auth",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "CLIENT_ID_MISSING",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "CLIENT_SECRET_MISSING",
			enabled: true,
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
	secret: process.env.BETTER_AUTH_SECRET,
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
		expiresIn: 60 * 60 * 24 * 7, // 7 days
	},
	advanced: {
		cookiePrefix: "bun-react",
	},
});
