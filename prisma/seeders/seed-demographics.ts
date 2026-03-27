import { PrismaClient, Gender, Religion } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Banjars (Village Hamlets)
 * Creates 6 banjars in Darmasaba village
 */
export async function seedBanjars() {
	const banjars = [
		{
			name: "Darmasaba",
			code: "DSB",
			totalPopulation: 1200,
			totalKK: 300,
			totalPoor: 45,
		},
		{
			name: "Manesa",
			code: "MNS",
			totalPopulation: 950,
			totalKK: 240,
			totalPoor: 32,
		},
		{
			name: "Cabe",
			code: "CBE",
			totalPopulation: 800,
			totalKK: 200,
			totalPoor: 28,
		},
		{
			name: "Penenjoan",
			code: "PNJ",
			totalPopulation: 1100,
			totalKK: 280,
			totalPoor: 50,
		},
		{
			name: "Baler Pasar",
			code: "BPS",
			totalPopulation: 850,
			totalKK: 210,
			totalPoor: 35,
		},
		{
			name: "Bucu",
			code: "BCU",
			totalPopulation: 734,
			totalKK: 184,
			totalPoor: 24,
		},
	];

	console.log("Seeding Banjars...");
	for (const banjar of banjars) {
		await prisma.banjar.upsert({
			where: { name: banjar.name },
			update: banjar,
			create: banjar,
		});
	}
	console.log("✅ Banjars seeded successfully");
}

/**
 * Get all Banjar IDs
 * Helper function to retrieve banjar IDs for other seeders
 */
export async function getBanjarIds(): Promise<string[]> {
	const banjars = await prisma.banjar.findMany();
	return banjars.map((b) => b.id);
}

/**
 * Seed Residents
 * Creates sample resident data for demographics
 */
export async function seedResidents(banjarIds: string[]) {
	console.log("Seeding Residents...");

	const residents = [
		{
			nik: "5103010101700001",
			kk: "5103010101700000",
			name: "I Wayan Sudarsana",
			birthDate: new Date("1970-05-15"),
			birthPlace: "Badung",
			gender: Gender.LAKI_LAKI,
			religion: Religion.HINDU,
			occupation: "Wiraswasta",
			banjarId: banjarIds[0] || "",
			rt: "001",
			rw: "000",
			address: "Jl. Raya Darmasaba No. 1",
			isHeadOfHousehold: true,
		},
		{
			nik: "5103010101850002",
			kk: "5103010101850000",
			name: "Ni Made Arianti",
			birthDate: new Date("1985-08-20"),
			birthPlace: "Denpasar",
			gender: Gender.PEREMPUAN,
			religion: Religion.HINDU,
			occupation: "Guru",
			banjarId: banjarIds[1] || banjarIds[0] || "",
			rt: "002",
			rw: "000",
			address: "Gg. Manesa No. 5",
			isPoor: true,
		},
	];

	for (const res of residents) {
		await prisma.resident.upsert({
			where: { nik: res.nik },
			update: res,
			create: res,
		});
	}

	console.log("✅ Residents seeded successfully");
}
