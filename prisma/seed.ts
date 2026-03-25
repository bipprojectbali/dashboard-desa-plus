import "dotenv/config";
import { hash } from "bcryptjs";
import { generateId } from "better-auth";
import { prisma } from "@/utils/db";

async function seedAdminUser() {
	// Load environment variables
	const adminEmail = process.env.ADMIN_EMAIL;
	const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

	if (!adminEmail) {
		console.log(
			"No ADMIN_EMAIL environment variable found. Skipping admin user creation.",
		);
		return;
	}

	try {
		// Check if admin user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: adminEmail },
		});

		if (existingUser) {
			// Update existing user to have admin role if they don't already
			if (existingUser.role !== "admin") {
				await prisma.user.update({
					where: { email: adminEmail },
					data: { role: "admin" },
				});
				console.log(`User with email ${adminEmail} updated to admin role.`);
			} else {
				console.log(`User with email ${adminEmail} already has admin role.`);
			}
		} else {
			// Create new admin user
			const hashedPassword = await hash(adminPassword, 12);
			const userId = generateId();

			await prisma.user.create({
				data: {
					id: userId,
					email: adminEmail,
					name: "Admin User",
					role: "admin",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			await prisma.account.create({
				data: {
					id: generateId(),
					userId,
					accountId: userId,
					providerId: "credential",
					password: hashedPassword,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			console.log(`Admin user created with email: ${adminEmail}`);
		}
	} catch (error) {
		console.error("Error seeding admin user:", error);
		throw error;
	}
}

async function seedDemoUsers() {
	const demoUsers = [
		{ email: "demo1@example.com", name: "Demo User 1", role: "user" },
		{ email: "demo2@example.com", name: "Demo User 2", role: "user" },
		{
			email: "moderator@example.com",
			name: "Moderator User",
			role: "moderator",
		},
	];

	for (const userData of demoUsers) {
		try {
			const existingUser = await prisma.user.findUnique({
				where: { email: userData.email },
			});

			if (!existingUser) {
				const userId = generateId();
				const hashedPassword = await hash("demo123", 12);

				await prisma.user.create({
					data: {
						id: userId,
						email: userData.email,
						name: userData.name,
						role: userData.role,
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				});

				await prisma.account.create({
					data: {
						id: generateId(),
						userId,
						accountId: userId,
						providerId: "credential",
						password: hashedPassword,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				});

				console.log(`Demo user created: ${userData.email}`);
			} else {
				console.log(`Demo user already exists: ${userData.email}`);
			}
		} catch (error) {
			console.error(`Error seeding user ${userData.email}:`, error);
		}
	}
}

async function main() {
	console.log("Seeding database...");

	await seedAdminUser();
	await seedDemoUsers();

	console.log("Database seeding completed.");
}

// Only auto-execute when run directly (not when imported)
const isMainModule =
	typeof require !== "undefined"
		? require.main === module
		: import.meta.path.endsWith("seed.ts");

if (isMainModule) {
	main().catch((error) => {
		console.error("Error during seeding:", error);
		process.exit(1);
	});
}

// Export for programmatic use
export { seedAdminUser, seedDemoUsers, main as runSeed };
