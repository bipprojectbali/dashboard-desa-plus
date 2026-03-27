import {
	ComplaintCategory,
	ComplaintStatus,
	EventType,
	Priority,
	PrismaClient,
} from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Complaints
 * Creates sample citizen complaints for testing
 */
export async function seedComplaints(adminId: string) {
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

	console.log("✅ Complaints seeded successfully");
}

/**
 * Seed Service Letters
 * Creates sample administrative letter requests
 */
export async function seedServiceLetters(adminId: string) {
	console.log("Seeding Service Letters...");

	const serviceLetters = [
		{
			letterNumber: "SKT-2025-001",
			letterType: "KTP",
			applicantName: "I Wayan Sudarsana",
			applicantNik: "5103010101700001",
			applicantAddress: "Jl. Raya Darmasaba No. 1",
			purpose: "Pembuatan KTP baru",
			status: "SELESAI",
			processedBy: adminId,
			completedAt: new Date(),
		},
		{
			letterNumber: "SKT-2025-002",
			letterType: "KK",
			applicantName: "Ni Made Arianti",
			applicantNik: "5103010101850002",
			applicantAddress: "Gg. Manesa No. 5",
			purpose: "Perubahan data KK",
			status: "DIPROSES",
			processedBy: adminId,
		},
		{
			letterNumber: "SKT-2025-003",
			letterType: "DOMISILI",
			applicantName: "I Ketut Arsana",
			applicantNik: "5103010101900003",
			applicantAddress: "Jl. Cabe No. 10",
			purpose: "Surat keterangan domisili",
			status: "BARU",
		},
	];

	for (const letter of serviceLetters) {
		await prisma.serviceLetter.upsert({
			where: { letterNumber: letter.letterNumber },
			update: letter,
			create: letter,
		});
	}

	console.log("✅ Service Letters seeded successfully");
}

/**
 * Seed Events
 * Creates sample village events and meetings
 */
export async function seedEvents(adminId: string) {
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

	console.log("✅ Events seeded successfully");
}

/**
 * Seed Innovation Ideas
 * Creates sample citizen innovation submissions
 */
export async function seedInnovationIdeas(adminId: string) {
	console.log("Seeding Innovation Ideas...");

	const innovationIdeas = [
		{
			title: "Sistem Informasi Desa Digital",
			description: "Platform digital untuk layanan administrasi desa",
			category: "Teknologi",
			submitterName: "I Made Wijaya",
			submitterContact: "081234567890",
			status: "DIKAJI",
			reviewedBy: adminId,
			notes: "Perlu kajian lebih lanjut tentang anggaran",
		},
		{
			title: "Program Bank Sampah",
			description: "Pengelolaan sampah berbasis bank sampah",
			category: "Lingkungan",
			submitterName: "Ni Putu Sari",
			submitterContact: "081234567891",
			status: "BARU",
		},
	];

	for (const idea of innovationIdeas) {
		await prisma.innovationIdea.create({
			data: idea,
		});
	}

	console.log("✅ Innovation Ideas seeded successfully");
}
