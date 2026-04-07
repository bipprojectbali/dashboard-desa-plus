import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed UMKM (Usaha Mikro, Kecil, dan Menengah)
 * Creates sample local businesses for each banjar
 */
export async function seedUmkm(banjarIds: string[]) {
	console.log("Seeding UMKM...");

	const umkms = [
		{
			banjarId: banjarIds[0] || null,
			name: "Kerajinan Anyaman Darmasaba",
			owner: "Ni Wayan Rajin",
			productType: "Kerajinan Tangan",
			description: "Produksi anyasan bambu dan rotan",
		},
		{
			banjarId: banjarIds[1] || null,
			name: "Warung Makan Manesa",
			owner: "Made Sari",
			productType: "Kuliner",
			description: "Makanan tradisional Bali",
		},
		{
			banjarId: banjarIds[2] || null,
			name: "Bengkel Cabe Motor",
			owner: "Ketut Arsana",
			productType: "Jasa",
			description: "Servis motor dan jual sparepart",
		},
		{
			banjarId: banjarIds[3] || null,
			name: "Produksi Keripik Pisang Penenjoan",
			owner: "Putu Suartika",
			productType: "Makanan Ringan",
			description: "Keripik pisang dengan berbagai varian rasa",
		},
	];

	for (const umkm of umkms) {
		await prisma.umkm.create({
			data: umkm,
		});
	}

	console.log("✅ UMKM seeded successfully");
}

/**
 * Seed Posyandu (Community Health Post)
 * Creates health service schedules and programs
 */
export async function seedPosyandu(userId: string) {
	console.log("Seeding Posyandu...");

	const posyandus = [
		{
			name: "Posyandu Mawar",
			location: "Banjar Darmasaba",
			schedule: "Setiap tanggal 15",
			type: "Ibu dan Anak",
			coordinatorId: userId,
		},
		{
			name: "Posyandu Melati",
			location: "Banjar Manesa",
			schedule: "Setiap tanggal 20",
			type: "Ibu dan Anak",
			coordinatorId: userId,
		},
		{
			name: "Posyandu Lansia Sejahtera",
			location: "Balai Desa",
			schedule: "Setiap tanggal 25",
			type: "Lansia",
			coordinatorId: userId,
		},
	];

	for (const posyandu of posyandus) {
		await prisma.posyandu.create({
			data: posyandu,
		});
	}

	console.log("✅ Posyandu seeded successfully");
}

/**
 * Seed Security Reports
 * Creates sample security incident reports
 */
export async function seedSecurityReports(userId: string) {
	console.log("Seeding Security Reports...");

	const securityReports = [
		{
			reportNumber: "SEC-2025-001",
			title: "Pencurian Kendaraan",
			description: "Laporan kehilangan motor di area pasar",
			location: "Pasar Darmasaba",
			reportedBy: "I Wayan Aman",
			status: "DIPROSES",
			assignedTo: userId,
		},
		{
			reportNumber: "SEC-2025-002",
			title: "Gangguan Ketertiban",
			description: "Keributan di jalan utama pada malam hari",
			location: "Jl. Raya Darmasaba",
			reportedBy: "Made Tertib",
			status: "SELESAI",
			assignedTo: userId,
		},
	];

	for (const report of securityReports) {
		await prisma.securityReport.upsert({
			where: { reportNumber: report.reportNumber },
			update: report,
			create: report,
		});
	}

	console.log("✅ Security Reports seeded successfully");
}

/**
 * Seed Employment Records
 * Creates employment history for residents
 */
export async function seedEmploymentRecords() {
	console.log("Seeding Employment Records...");

	// Get residents first
	const residents = await prisma.resident.findMany({
		take: 2,
	});

	if (residents.length === 0) {
		console.log("⏭️  No residents found, skipping employment records");
		return;
	}

	const employmentRecords = residents.map((resident) => ({
		residentId: resident.id,
		companyName: `PT. Desa Makmur ${resident.name.split(" ")[0]}`,
		position: "Staff",
		startDate: new Date("2020-01-01"),
		endDate: null,
		isActive: true,
	}));

	for (const record of employmentRecords) {
		await prisma.employmentRecord.create({
			data: record,
		});
	}

	console.log("✅ Employment Records seeded successfully");
}

/**
 * Seed Population Dynamics
 * Creates population change records (births, deaths, migration)
 */
export async function seedPopulationDynamics(userId: string) {
	console.log("Seeding Population Dynamics...");

	const populationDynamics = [
		{
			type: "KELAHIRAN",
			residentName: "Anak Baru Darmasaba",
			eventDate: new Date("2025-01-15"),
			description: "Kelahiran bayi laki-laki",
			documentedBy: userId,
		},
		{
			type: "KEMATIAN",
			residentName: "Almarhum Warga Desa",
			eventDate: new Date("2025-02-20"),
			description: "Meninggal dunia karena sakit",
			documentedBy: userId,
		},
		{
			type: "KEDATANGAN",
			residentName: "Pendatang Baru",
			eventDate: new Date("2025-03-01"),
			description: "Pindah masuk dari desa lain",
			documentedBy: userId,
		},
	];

	for (const dynamic of populationDynamics) {
		await prisma.populationDynamic.create({
			data: dynamic,
		});
	}

	console.log("✅ Population Dynamics seeded successfully");
}

/**
 * Seed Budget Transactions
 * Creates sample financial transactions
 */
export async function seedBudgetTransactions(userId: string) {
	console.log("Seeding Budget Transactions...");

	const transactions = [
		{
			transactionNumber: "TRX-2025-001",
			type: "PENGELUARAN",
			category: "Infrastruktur",
			amount: 50000000,
			description: "Pembangunan jalan desa",
			date: new Date("2025-01-10"),
			createdBy: userId,
		},
		{
			transactionNumber: "TRX-2025-002",
			type: "PENDAPATAN",
			category: "Dana Desa",
			amount: 500000000,
			description: "Penyaluran dana desa Q1",
			date: new Date("2025-01-05"),
			createdBy: userId,
		},
	];

	for (const transaction of transactions) {
		await prisma.budgetTransaction.create({
			data: transaction,
		});
	}

	console.log("✅ Budget Transactions seeded successfully");
}

/**
 * Seed All Phase 2 Data
 * Main function to run all Phase 2 seeders
 */
export async function seedPhase2(banjarIds: string[], userId: string) {
	await seedUmkm(banjarIds);
	await seedPosyandu(userId);
	await seedSecurityReports(userId);
	await seedEmploymentRecords();
	await seedPopulationDynamics(userId);
	await seedBudgetTransactions(userId);
}
