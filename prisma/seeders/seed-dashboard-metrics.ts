import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Budget (APBDes)
 * Creates village budget allocation data
 */
export async function seedBudget() {
	console.log("Seeding Budget...");

	const budgets = [
		{ category: "Belanja", amount: 70, percentage: 70, color: "#3B82F6" },
		{ category: "Pangan", amount: 45, percentage: 45, color: "#22C55E" },
		{ category: "Pembiayaan", amount: 55, percentage: 55, color: "#FACC15" },
		{ category: "Pendapatan", amount: 90, percentage: 90, color: "#3B82F6" },
	];

	for (const budget of budgets) {
		await prisma.budget.upsert({
			where: {
				category_fiscalYear: {
					category: budget.category,
					fiscalYear: 2025,
				},
			},
			update: budget,
			create: { ...budget, fiscalYear: 2025 },
		});
	}

	console.log("✅ Budget seeded successfully");
}

/**
 * Seed SDGs Scores
 * Creates Sustainable Development Goals scores for dashboard
 */
export async function seedSdgsScores() {
	console.log("Seeding SDGs Scores...");

	const sdgs = [
		{
			title: "Desa Berenergi Bersih dan Terbarukan",
			score: 99.64,
			image: "SDGS-7.png",
		},
		{
			title: "Desa Damai Berkeadilan",
			score: 78.65,
			image: "SDGS-16.png",
		},
		{
			title: "Desa Sehat dan Sejahtera",
			score: 77.37,
			image: "SDGS-3.png",
		},
		{
			title: "Desa Tanpa Kemiskinan",
			score: 52.62,
			image: "SDGS-1.png",
		},
	];

	for (const sdg of sdgs) {
		await prisma.sdgsScore.upsert({
			where: { title: sdg.title },
			update: sdg,
			create: sdg,
		});
	}

	console.log("✅ SDGs Scores seeded successfully");
}

/**
 * Seed Satisfaction Ratings
 * Creates public satisfaction survey data
 */
export async function seedSatisfactionRatings() {
	console.log("Seeding Satisfaction Ratings...");

	const satisfactions = [
		{ category: "Sangat Puas", value: 25, color: "#4E5BA6" },
		{ category: "Puas", value: 25, color: "#F4C542" },
		{ category: "Cukup", value: 25, color: "#8CC63F" },
		{ category: "Kurang", value: 25, color: "#E57373" },
	];

	for (const sat of satisfactions) {
		await prisma.satisfactionRating.upsert({
			where: { category: sat.category },
			update: sat,
			create: sat,
		});
	}

	console.log("✅ Satisfaction Ratings seeded successfully");
}

/**
 * Seed All Dashboard Metrics
 * Main function to run all dashboard metrics seeders
 */
export async function seedDashboardMetrics() {
	await seedBudget();
	await seedSdgsScores();
	await seedSatisfactionRatings();
}
