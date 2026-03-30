import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

// Import all seeders
import { seedAdminUser, seedApiKeys, seedDemoUsers } from "./seeders/seed-auth";
import { seedDashboardMetrics } from "./seeders/seed-dashboard-metrics";
import {
	getBanjarIds,
	seedBanjars,
	seedResidents,
} from "./seeders/seed-demographics";
import {
	seedDiscussions,
	seedDivisionMetrics,
	seedDocuments,
} from "./seeders/seed-discussions";
import {
	getDivisionIds,
	seedActivities,
	seedDivisions,
} from "./seeders/seed-division-performance";
import { seedPhase2 } from "./seeders/seed-phase2";
import {
	getComplaintIds,
	seedComplaints,
	seedComplaintUpdates,
	seedEvents,
	seedInnovationIdeas,
	seedServiceLetters,
} from "./seeders/seed-public-services";

const prisma = new PrismaClient();

/**
 * Check if seed has already been run
 * Returns true if core data already exists
 */
export async function hasExistingData(): Promise<boolean> {
	// Check for core entities that should always exist after seeding
	const [userCount, banjarCount, divisionCount] = await Promise.all([
		prisma.user.count(),
		prisma.banjar.count(),
		prisma.division.count(),
	]);

	// If we have more than 1 user (admin), 6 banjars, and 4 divisions, assume seeded
	return userCount > 1 && banjarCount >= 6 && divisionCount >= 4;
}

/**
 * Run All Seeders
 * Executes all seeder functions in the correct order
 */
export async function runSeed() {
	console.log("🌱 Starting seed...\n");

	// Check if data already exists
	const existingData = await hasExistingData();
	if (existingData) {
		console.log(
			"⏭️  Existing data detected. Skipping seed to prevent duplicates.\n",
		);
		console.log("💡 To re-seed, either:");
		console.log("   1. Run: bun x prisma migrate reset (resets database)");
		console.log("   2. Manually delete data from tables\n");
		console.log("✅ Seed skipped successfully!\n");
		return;
	}

	// 1. Seed Authentication (Admin & Demo Users)
	console.log("📁 [1/7] Authentication & Users");
	const adminId = await seedAdminUser();
	await seedDemoUsers();
	await seedApiKeys(adminId);
	console.log();

	// 2. Seed Demographics (Banjars & Residents)
	console.log("📁 [2/7] Demographics & Population");
	await seedBanjars();
	const banjarIds = await getBanjarIds();
	await seedResidents(banjarIds);
	console.log();

	// 3. Seed Division Performance (Divisions & Activities)
	console.log("📁 [3/7] Division Performance");
	const divisions = await seedDivisions();
	const divisionIds = divisions.map((d) => d.id);
	await seedActivities(divisionIds);
	await seedDivisionMetrics(divisionIds);
	console.log();

	// 4. Seed Public Services (Complaints, Service Letters, Events, Innovation)
	console.log("📁 [4/7] Public Services");
	await seedComplaints(adminId);
	await seedServiceLetters(adminId);
	await seedEvents(adminId);
	await seedInnovationIdeas(adminId);
	const complaintIds = await getComplaintIds();
	await seedComplaintUpdates(complaintIds, adminId);
	console.log();

	// 5. Seed Documents & Discussions
	console.log("📁 [5/7] Documents & Discussions");
	await seedDocuments(divisionIds, adminId);
	await seedDiscussions(divisionIds, adminId);
	console.log();

	// 6. Seed Dashboard Metrics (Budget, SDGs, Satisfaction)
	console.log("📁 [6/7] Dashboard Metrics");
	await seedDashboardMetrics();
	console.log();

	// 7. Seed Phase 2+ Features (UMKM, Posyandu, Security, etc.)
	console.log("📁 [7/7] Phase 2+ Features");
	await seedPhase2(banjarIds, adminId);
	console.log();

	console.log("✅ Seed finished successfully!\n");
}

/**
 * Run Specific Seeder
 * Allows running individual seeders by name
 */
export async function runSpecificSeeder(name: string) {
	console.log(`🌱 Running specific seeder: ${name}\n`);

	// Check if data already exists for specific seeder
	const existingData = await hasExistingData();
	if (existingData && name !== "auth") {
		console.log(
			"⚠️  Warning: Existing data detected for this seeder category.\n",
		);
		console.log("💡 To re-seed, either:");
		console.log("   1. Run: bun x prisma migrate reset (resets database)");
		console.log("   2. Manually delete data from tables\n");
		console.log("✅ Seeder skipped to prevent duplicates!\n");
		return;
	}

	switch (name) {
		case "auth":
		case "users": {
			console.log("📁 Authentication & Users");
			const adminId = await seedAdminUser();
			await seedDemoUsers();
			await seedApiKeys(adminId);
			break;
		}

		case "demographics":
		case "population": {
			console.log("📁 Demographics & Population");
			await seedBanjars();
			const banjarIds = await getBanjarIds();
			await seedResidents(banjarIds);
			break;
		}

		case "divisions":
		case "performance": {
			console.log("📁 Division Performance");
			const divisions = await seedDivisions();
			const divisionIds = divisions.map((d) => d.id);
			await seedActivities(divisionIds);
			await seedDivisionMetrics(divisionIds);
			break;
		}

		case "complaints":
		case "services":
		case "public": {
			console.log("📁 Public Services");
			const pubAdminId = await seedAdminUser();
			await seedComplaints(pubAdminId);
			await seedServiceLetters(pubAdminId);
			await seedEvents(pubAdminId);
			await seedInnovationIdeas(pubAdminId);
			const compIds = await getComplaintIds();
			await seedComplaintUpdates(compIds, pubAdminId);
			break;
		}

		case "documents":
		case "discussions": {
			console.log("📁 Documents & Discussions");
			const docAdminId = await seedAdminUser();
			const divs = await seedDivisions();
			const divIds = divs.map((d) => d.id);
			await seedDocuments(divIds, docAdminId);
			await seedDiscussions(divIds, docAdminId);
			break;
		}

		case "dashboard":
		case "metrics":
			console.log("📁 Dashboard Metrics");
			await seedDashboardMetrics();
			break;

		case "phase2":
		case "features": {
			console.log("📁 Phase 2+ Features");
			const p2AdminId = await seedAdminUser();
			await seedBanjars();
			const p2BanjarIds = await getBanjarIds();
			await seedPhase2(p2BanjarIds, p2AdminId);
			break;
		}

		default:
			console.error(`❌ Unknown seeder: ${name}`);
			console.log(
				"Available seeders: auth, demographics, divisions, complaints, documents, dashboard, phase2",
			);
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
