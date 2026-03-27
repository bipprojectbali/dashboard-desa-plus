import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

// Import all seeders
import { seedAdminUser, seedDemoUsers } from "./seeders/seed-auth";
import { seedBanjars, seedResidents, getBanjarIds } from "./seeders/seed-demographics";
import { seedDivisions, seedActivities, getDivisionIds } from "./seeders/seed-division-performance";
import {
	seedComplaints,
	seedServiceLetters,
	seedEvents,
	seedInnovationIdeas,
} from "./seeders/seed-public-services";
import { seedDashboardMetrics } from "./seeders/seed-dashboard-metrics";

const prisma = new PrismaClient();

/**
 * Run All Seeders
 * Executes all seeder functions in the correct order
 */
export async function runSeed() {
	console.log("🌱 Starting seed...\n");

	// 1. Seed Authentication (Admin & Demo Users)
	console.log("📁 [1/6] Authentication & Users");
	const adminId = await seedAdminUser();
	await seedDemoUsers();
	console.log();

	// 2. Seed Demographics (Banjars & Residents)
	console.log("📁 [2/6] Demographics & Population");
	await seedBanjars();
	const banjarIds = await getBanjarIds();
	await seedResidents(banjarIds);
	console.log();

	// 3. Seed Division Performance (Divisions & Activities)
	console.log("📁 [3/6] Division Performance");
	const divisions = await seedDivisions();
	const divisionIds = divisions.map((d) => d.id);
	await seedActivities(divisionIds);
	console.log();

	// 4. Seed Public Services (Complaints, Service Letters, Events, Innovation)
	console.log("📁 [4/6] Public Services");
	await seedComplaints(adminId);
	await seedServiceLetters(adminId);
	await seedEvents(adminId);
	await seedInnovationIdeas(adminId);
	console.log();

	// 5. Seed Dashboard Metrics (Budget, SDGs, Satisfaction)
	console.log("📁 [5/6] Dashboard Metrics");
	await seedDashboardMetrics();
	console.log();

	console.log("✅ Seed finished successfully!\n");
}

/**
 * Run Specific Seeder
 * Allows running individual seeders by name
 */
export async function runSpecificSeeder(name: string) {
	console.log(`🌱 Running specific seeder: ${name}\n`);

	switch (name) {
		case "auth":
		case "users":
			console.log("📁 Authentication & Users");
			await seedAdminUser();
			await seedDemoUsers();
			break;

		case "demographics":
		case "population":
			console.log("📁 Demographics & Population");
			await seedBanjars();
			const banjarIds = await getBanjarIds();
			await seedResidents(banjarIds);
			break;

		case "divisions":
		case "performance":
			console.log("📁 Division Performance");
			const divisions = await seedDivisions();
			const divisionIds = divisions.map((d) => d.id);
			await seedActivities(divisionIds);
			break;

		case "complaints":
		case "services":
		case "public":
			console.log("📁 Public Services");
			const adminId = await seedAdminUser();
			await seedComplaints(adminId);
			await seedServiceLetters(adminId);
			await seedEvents(adminId);
			await seedInnovationIdeas(adminId);
			break;

		case "dashboard":
		case "metrics":
			console.log("📁 Dashboard Metrics");
			await seedDashboardMetrics();
			break;

		default:
			console.error(`❌ Unknown seeder: ${name}`);
			console.log("Available seeders: auth, demographics, divisions, complaints, dashboard");
			process.exit(1);
	}

	console.log("\n✅ Seeder finished successfully!\n");
}

// Main execution
if (import.meta.main) {
	const args = process.argv.slice(2);
	const seederName = args[0];

	if (seederName) {
		// Run specific seeder
		runSpecificSeeder(seederName)
			.catch((e) => {
				console.error("❌ Seeder error:", e);
				process.exit(1);
			})
			.finally(async () => {
				await prisma.$disconnect();
			});
	} else {
		// Run all seeders
		runSeed()
			.catch((e) => {
				console.error("❌ Seed error:", e);
				process.exit(1);
			})
			.finally(async () => {
				await prisma.$disconnect();
			});
	}
}
