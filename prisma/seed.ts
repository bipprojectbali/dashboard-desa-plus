import "dotenv/config";
import { prisma } from "@/utils/db";

async function seedAdminUser() {
	// Load environment variables
	const adminEmail = process.env.ADMIN_EMAIL;

	if (!adminEmail) {
		console.log(
			"No ADMIN_EMAIL environment variable found. Skipping admin role assignment.",
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
			console.log(
				`No user found with email ${adminEmail}. Skipping admin role assignment.`,
			);
		}
	} catch (error) {
		console.error("Error seeding admin user:", error);
		throw error;
	}
}

async function main() {
	console.log("Seeding database...");

	await seedAdminUser();

	console.log("Database seeding completed.");
}

main().catch((error) => {
	console.error("Error during seeding:", error);
	process.exit(1);
});
