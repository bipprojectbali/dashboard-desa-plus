import {
	ComplaintCategory,
	ComplaintStatus,
	EventType,
	Priority,
	PrismaClient,
} from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Get Complaint IDs
 * Helper function to retrieve complaint IDs for other seeders
 */
export async function getComplaintIds(): Promise<string[]> {
	const complaints = await prisma.complaint.findMany();
	return complaints.map((c) => c.id);
}

/**
 * Seed Complaints
 * Creates sample citizen complaints spread across 7 months for trend visualization
 */
export async function seedComplaints(adminId: string) {
	console.log("Seeding Complaints...");

	const now = new Date();

	const complaints = [
		// Recent complaints (this month)
		{
			complaintNumber: `COMP-20260327-001`,
			title: "Lampu Jalan Mati",
			description:
				"Lampu jalan di depan Balai Banjar Manesa mati sejak 3 hari lalu.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.BARU,
			priority: Priority.SEDANG,
			location: "Banjar Manesa",
			reporterId: adminId,
			createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
		},
		{
			complaintNumber: `COMP-20260325-002`,
			title: "Sampah Menumpuk",
			description: "Tumpukan sampah di area pasar Darmasaba belum diangkut.",
			category: ComplaintCategory.KETERTIBAN_UMUM,
			status: ComplaintStatus.DIPROSES,
			priority: Priority.TINGGI,
			location: "Pasar Darmasaba",
			assignedTo: adminId,
			createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
		},
		{
			complaintNumber: `COMP-20260320-003`,
			title: "Jalan Rusak",
			description: "Jalan di Banjar Cabe rusak dan berlubang.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.TINGGI,
			location: "Banjar Cabe",
			assignedTo: adminId,
			resolvedBy: adminId,
			resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
			createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
		},
		// Last month (February 2026)
		{
			complaintNumber: `COMP-20260215-004`,
			title: "Saluran Air Tersumbat",
			description: "Saluran air di depan rumah warga tersumbat sampah.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.SEDANG,
			location: "Banjar Darmasaba",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
		},
		{
			complaintNumber: `COMP-20260210-005`,
			title: "Parkir Liar",
			description: "Parkir liar di depan pasar mengganggu lalu lintas.",
			category: ComplaintCategory.KETERTIBAN_UMUM,
			status: ComplaintStatus.SELESAI,
			priority: Priority.RENDAH,
			location: "Pasar Darmasaba",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
		},
		// January 2026
		{
			complaintNumber: `COMP-20260120-006`,
			title: "Penerangan Jalan Umum Rusak",
			description: "5 titik lampu jalan di Jl. Raya Darmasaba tidak menyala.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.TINGGI,
			location: "Jl. Raya Darmasaba",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
		},
		{
			complaintNumber: `COMP-20260115-007`,
			title: "Pelayanan Administrasi Lambat",
			description: "Proses pembuatan surat keterangan lambat.",
			category: ComplaintCategory.ADMINISTRASI,
			status: ComplaintStatus.SELESAI,
			priority: Priority.SEDANG,
			location: "Kantor Desa",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
		},
		// December 2025
		{
			complaintNumber: `COMP-20251210-008`,
			title: "Jembatan Rusak Ringan",
			description: "Pagar jembatan di Banjar Penenjoan rusak.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.SEDANG,
			location: "Banjar Penenjoan",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000), // 110 days ago
		},
		{
			complaintNumber: `COMP-20251205-009`,
			title: "Suara Bising Kegiatan Malam",
			description: "Kegiatan karaoke malam hari mengganggu ketenangan.",
			category: ComplaintCategory.KETERTIBAN_UMUM,
			status: ComplaintStatus.SELESAI,
			priority: Priority.RENDAH,
			location: "Banjar Baler Pasar",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 115 * 24 * 60 * 60 * 1000), // 115 days ago
		},
		// November 2025
		{
			complaintNumber: `COMP-20251115-010`,
			title: "Genangan Air Saat Hujan",
			description: "Jalan utama tergenang air saat hujan deras.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.TINGGI,
			location: "Jl. Raya Cabe",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 135 * 24 * 60 * 60 * 1000), // 135 days ago
		},
		// October 2025
		{
			complaintNumber: `COMP-20251020-011`,
			title: "Pungli Pelayanan KTP",
			description: "Ada oknum yang meminta biaya tambahan untuk KTP.",
			category: ComplaintCategory.ADMINISTRASI,
			status: ComplaintStatus.SELESAI,
			priority: Priority.DARURAT,
			location: "Kantor Desa",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 160 * 24 * 60 * 60 * 1000), // 160 days ago
		},
		// September 2025
		{
			complaintNumber: `COMP-20250915-012`,
			title: "Tanah Longsor",
			description: "Tanah longsor di tepi jalan Banjar Bucu.",
			category: ComplaintCategory.INFRASTRUKTUR,
			status: ComplaintStatus.SELESAI,
			priority: Priority.DARURAT,
			location: "Banjar Bucu",
			assignedTo: adminId,
			resolvedBy: adminId,
			createdAt: new Date(now.getTime() - 195 * 24 * 60 * 60 * 1000), // 195 days ago
		},
	];

	for (const comp of complaints) {
		await prisma.complaint.upsert({
			where: { complaintNumber: comp.complaintNumber },
			update: comp,
			create: comp,
		});
	}

	console.log(
		"✅ Complaints seeded successfully (12 complaints across 7 months)",
	);
}

/**
 * Seed Service Letters
 * Creates sample administrative letter requests with dates spread across 6 months
 */
export async function seedServiceLetters(adminId: string) {
	console.log("Seeding Service Letters...");

	const now = new Date();
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
			completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
			createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (this week!)
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
			createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
		},
		{
			letterNumber: "SKT-2025-003",
			letterType: "DOMISILI",
			applicantName: "I Ketut Arsana",
			applicantNik: "5103010101900003",
			applicantAddress: "Jl. Cabe No. 10",
			purpose: "Surat keterangan domisili",
			status: "BARU",
			createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
		},
		{
			letterNumber: "SKT-2024-004",
			letterType: "USAHA",
			applicantName: "Made Wijaya",
			applicantNik: "5103010101950004",
			applicantAddress: "Jl. Penenjoan No. 15",
			purpose: "Surat keterangan usaha",
			status: "SELESAI",
			processedBy: adminId,
			completedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
			createdAt: new Date(now.getTime() - 130 * 24 * 60 * 60 * 1000), // 130 days ago
		},
		{
			letterNumber: "SKT-2024-005",
			letterType: "KETERANGAN_TIDAK_MAMPU",
			applicantName: "Putu Sari",
			applicantNik: "5103010101980005",
			applicantAddress: "Gg. Bucu No. 8",
			purpose: "Keterangan tidak mampu untuk beasiswa",
			status: "SELESAI",
			processedBy: adminId,
			completedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
			createdAt: new Date(now.getTime() - 160 * 24 * 60 * 60 * 1000), // 160 days ago
		},
	];

	for (const letter of serviceLetters) {
		const existing = await prisma.serviceLetter.findUnique({
			where: { letterNumber: letter.letterNumber },
		});

		if (existing) {
			await prisma.serviceLetter.update({
				where: { letterNumber: letter.letterNumber },
				data: letter,
			});
		} else {
			await prisma.serviceLetter.create({
				data: letter,
			});
		}
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

/**
 * Seed Complaint Updates
 * Creates status update history for complaints
 */
export async function seedComplaintUpdates(
	complaintIds: string[],
	userId: string,
) {
	console.log("Seeding Complaint Updates...");

	if (complaintIds.length === 0) {
		console.log("⏭️  No complaints found, skipping updates");
		return;
	}

	const updates = [
		{
			complaintId: complaintIds[0],
			message: "Laporan diterima, akan segera ditindaklanjuti",
			status: ComplaintStatus.BARU,
			updatedBy: userId,
		},
		{
			complaintId: complaintIds[1],
			message: "Tim kebersihan telah dikirim ke lokasi",
			status: ComplaintStatus.DIPROSES,
			updatedBy: userId,
		},
	];

	for (const update of updates) {
		await prisma.complaintUpdate.create({
			data: update,
		});
	}

	console.log("✅ Complaint Updates seeded successfully");
}
