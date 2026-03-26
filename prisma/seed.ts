import "dotenv/config";
import { hash } from "bcryptjs";
import { generateId } from "better-auth";
import {
	ActivityStatus,
	ComplaintCategory,
	ComplaintStatus,
	EventType,
	Gender,
	Priority,
	PrismaClient,
	Religion,
} from "../generated/prisma";

const prisma = new PrismaClient();

async function seedAdminUser() {
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

	console.log(`Admin user created: ${adminEmail}`);
	return userId;
}

async function seedBanjars() {
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
}

async function seedDivisions() {
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
	return createdDivisions;
}

async function seedResidents(banjarIds: string[]) {
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
}

async function seedActivities(divisionIds: string[]) {
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
}

async function seedComplaints(adminId: string) {
	console.log("Seeding Complaints...");
	const complaints = [
		{
			complaintNumber: `COMP-20250326-001`,
			title: "Lampu Jalan Mati",
			description:
				"Lampu jalan di depan Balai Banjar Manesa mati sejak 3 hari lalu.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.BARU,
			priority: Priority.SEDANG,
			location: "Banjar Manesa",
			reporterId: adminId,
		},
		{
			complaintNumber: `COMP-20250326-002`,
			title: "Sampah Menumpuk",
			description: "Tumpukan sampah di area pasar Darmasaba belum diangkut.",
			category: ComplaintCategory.KETERTIBAN_UMUM,
			status: ComplaintStatus.DIPROSES,
			priority: Priority.TINGGI,
			location: "Pasar Darmasaba",
			assignedTo: adminId,
		},
	];

	for (const comp of complaints) {
		await prisma.complaint.upsert({
			where: { complaintNumber: comp.complaintNumber },
			update: comp,
			create: comp,
		});
	}
}

async function seedEvents(adminId: string) {
	console.log("Seeding Events...");
	const events = [
		{
			title: "Rapat Pleno Desa",
			description: "Pembahasan anggaran belanja desa",
			eventType: EventType.RAPAT,
			startDate: new Date(),
			location: "Balai Desa Darmasaba",
			createdBy: adminId,
		},
		{
			title: "Gotong Royong Kebersihan",
			description: "Kegiatan rutin mingguan",
			eventType: EventType.SOSIAL,
			startDate: new Date(Date.now() + 86400000), // Besok
			location: "Seluruh Banjar",
			createdBy: adminId,
		},
	];

	for (const event of events) {
		await prisma.event.create({
			data: event,
		});
	}
}

export async function runSeed() {
	console.log("Starting seed...");

	const adminId = await seedAdminUser();
	await seedBanjars();
	const banjars = await prisma.banjar.findMany();
	const banjarIds = banjars.map((b) => b.id);

	const divisions = await seedDivisions();
	const divisionIds = divisions.map((d) => d.id);

	await seedResidents(banjarIds);
	await seedActivities(divisionIds);
	await seedComplaints(adminId);
	await seedEvents(adminId);

	console.log("Seed finished successfully!");
}

if (import.meta.main) {
	runSeed()
		.catch((e) => {
			console.error(e);
			process.exit(1);
		})
		.finally(async () => {
			await prisma.$disconnect();
		});
}
