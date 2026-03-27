import "dotenv/config";
import { hash } from "bcryptjs";
import { generateId } from "better-auth";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Admin User
 * Creates or updates the admin user account
 */
export async function seedAdminUser() {
	const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
	const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

	console.log(`Checking admin user: ${adminEmail}`);

	const existingUser = await prisma.user.findUnique({
		where: { email: adminEmail },
	});

	if (existingUser) {
		if (existingUser.role !== "admin") {
			await prisma.user.update({
				where: { email: adminEmail },
				data: { role: "admin" },
			});
			console.log("Updated existing user to admin role.");
		}
		return existingUser.id;
	}

	const hashedPassword = await hash(adminPassword, 12);
	const userId = generateId();

	await prisma.user.create({
		data: {
			id: userId,
			email: adminEmail,
			name: "Admin Desa Darmasaba",
			role: "admin",
			emailVerified: true,
			accounts: {
				create: {
					id: generateId(),
					accountId: userId,
					providerId: "credential",
					password: hashedPassword,
				},
			},
		},
	});

	console.log(`✅ Admin user created: ${adminEmail}`);
	return userId;
}

/**
 * Seed Demo Users
 * Creates demo users for testing (user, moderator roles)
 */
export async function seedDemoUsers() {
	const demoUsers = [
		{
			email: "demo1@example.com",
			name: "Demo User 1",
			password: "demo123",
			role: "user",
		},
		{
			email: "demo2@example.com",
			name: "Demo User 2",
			password: "demo123",
			role: "user",
		},
		{
			email: "moderator@example.com",
			name: "Moderator Desa",
			password: "demo123",
			role: "moderator",
		},
	];

	console.log("Seeding Demo Users...");

	for (const demo of demoUsers) {
		const existingUser = await prisma.user.findUnique({
			where: { email: demo.email },
		});

		if (existingUser) {
			console.log(`⏭️  Demo user exists: ${demo.email}`);
			continue;
		}

		const hashedPassword = await hash(demo.password, 12);
		const userId = generateId();

		await prisma.user.create({
			data: {
				id: userId,
				email: demo.email,
				name: demo.name,
				role: demo.role,
				emailVerified: true,
				accounts: {
					create: {
						id: generateId(),
						accountId: userId,
						providerId: "credential",
						password: hashedPassword,
					},
				},
			},
		});

		console.log(`✅ Demo user created: ${demo.email}`);
	}
}
