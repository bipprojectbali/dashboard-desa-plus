import { afterAll, describe, expect, it } from "bun:test";
import { prisma } from "@/utils/db";
import { assertTestDatabase } from "./test-database";

assertTestDatabase();

const EMAIL = `db-integration-${Date.now()}@database-test.test.local`; // test-only

afterAll(async () => {
	await prisma.user.deleteMany({ where: { email: EMAIL } });
	await prisma.$disconnect();
});

describe("Database Integration", () => {
	it("should connect to the database and query users", async () => {
		const count = await prisma.user.count();
		expect(typeof count).toBe("number");
	});

	it("should create and find a user by email", async () => {
		await prisma.user.create({ data: { email: EMAIL, name: "DB Test" } });
		const user = await prisma.user.findUnique({ where: { email: EMAIL } });
		expect(user?.email).toBe(EMAIL);
	});
});
