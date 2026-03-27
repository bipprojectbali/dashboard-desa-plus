import {
	ActivityStatus,
	Priority,
	PrismaClient,
} from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Divisions
 * Creates 4 main village divisions/departments
 */
export async function seedDivisions() {
	const divisions = [
		{
			name: "Pemerintahan",
			description: "Urusan administrasi dan tata kelola desa",
			color: "#1E3A5F",
		},
		{
			name: "Pembangunan",
			description: "Infrastruktur dan sarana prasarana desa",
			color: "#2E7D32",
		},
		{
			name: "Pemberdayaan",
			description: "Pemberdayaan ekonomi dan masyarakat",
			color: "#EF6C00",
		},
		{
			name: "Kesejahteraan",
			description: "Kesehatan, pendidikan, dan sosial",
			color: "#C62828",
		},
	];

	console.log("Seeding Divisions...");
	const createdDivisions = [];
	for (const div of divisions) {
		const d = await prisma.division.upsert({
			where: { name: div.name },
			update: div,
			create: div,
		});
		createdDivisions.push(d);
	}
	console.log("✅ Divisions seeded successfully");
	return createdDivisions;
}

/**
 * Get all Division IDs
 * Helper function to retrieve division IDs for other seeders
 */
export async function getDivisionIds(): Promise<string[]> {
	const divisions = await prisma.division.findMany();
	return divisions.map((d) => d.id);
}

/**
 * Seed Activities
 * Creates sample activities for each division
 */
export async function seedActivities(divisionIds: string[]) {
	console.log("Seeding Activities...");

	const activities = [
		{
			title: "Rapat Koordinasi 2025",
			description: "Penyusunan rencana kerja tahunan",
			divisionId: divisionIds[0] || "",
			progress: 100,
			status: ActivityStatus.SELESAI,
			priority: Priority.TINGGI,
		},
		{
			title: "Pemutakhiran Indeks Desa",
			description: "Pendataan SDG's Desa 2025",
			divisionId: divisionIds[0] || "",
			progress: 65,
			status: ActivityStatus.BERJALAN,
			priority: Priority.SEDANG,
		},
		{
			title: "Pembangunan Jalan Banjar Cabe",
			description: "Pengaspalan jalan utama",
			divisionId: divisionIds[1] || divisionIds[0] || "",
			progress: 40,
			status: ActivityStatus.BERJALAN,
			priority: Priority.DARURAT,
		},
	];

	for (const act of activities) {
		await prisma.activity.create({
			data: act,
		});
	}

	console.log("✅ Activities seeded successfully");
}
