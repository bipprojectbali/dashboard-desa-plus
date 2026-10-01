import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";
import { DEFAULT_PERMISSIONS } from "@/utils/permission";
import { assertTestDatabase } from "./test-database";

/**
 * GET /api/my-permissions memakai resolveAllowedFeatures dengan data DB nyata:
 * role "user" punya baris `use-ai-assistant` dari migrasi tetapi fitur lain
 * tanpa baris tetap jatuh ke default; role di luar ROLES ("moderator")
 * memakai default "user". Auth lewat API key (user terverifikasi).
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL_DOMAIN = "my-permissions.test.local"; // test-only

async function createUserWithKey(role: string): Promise<string> {
	const user = await prisma.user.create({
		data: {
			email: `${role}-${RUN_ID}@${EMAIL_DOMAIN}`,
			role,
			emailVerified: true,
		},
	});
	const key = `perm-test-key-${role}-${RUN_ID}`; // test-only
	await prisma.apiKey.create({ data: { name: role, key, userId: user.id } });
	return key;
}

async function getAllowed(apiKey: string): Promise<string[]> {
	const res = await api.handle(
		new Request("http://localhost/api/my-permissions/", {
			headers: { "x-api-key": apiKey },
		}),
	);
	expect(res.status).toBe(200);
	return ((await res.json()) as { allowed: string[] }).allowed;
}

const keys: Record<string, string> = {};

beforeAll(async () => {
	keys.user = await createUserWithKey("user");
	keys.moderator = await createUserWithKey("moderator");
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("GET /api/my-permissions (DB nyata)", () => {
	it("role user: use-ai-assistant + fitur default lain tanpa baris DB", async () => {
		const allowed = await getAllowed(keys.user as string);
		expect([...allowed].sort()).toEqual([...DEFAULT_PERMISSIONS.user].sort());
		expect(allowed).toContain("use-ai-assistant");
		expect(allowed).not.toContain("sync-noc");
	});

	it("role moderator (di luar ROLES) → default user", async () => {
		const allowed = await getAllowed(keys.moderator as string);
		expect([...allowed].sort()).toEqual([...DEFAULT_PERMISSIONS.user].sort());
	});
});
