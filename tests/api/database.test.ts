import { describe, expect, it } from "bun:test";
import { prisma } from "@/utils/db";

describe("Database Integration", () => {
	it("should connect to the database and query users", async () => {
		// Try to count users to verify connection
		const count = await prisma.user.count();
		expect(typeof count).toBe("number");
	});

	it("should be able to find a user by email (if exists)", async () => {
		const adminEmail =
			process.env.ADMIN_EMAIL || "kurosakiblackangel@gmail.com";
		const user = await prisma.user.findUnique({
			where: { email: adminEmail },
		});

		// We don't fail if user doesn't exist, but if it does, it should match
		if (user) {
			expect(user.email).toBe(adminEmail);
		}
	});
});
