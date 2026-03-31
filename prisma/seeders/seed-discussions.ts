import {
	DocumentCategory,
	Priority,
	PrismaClient,
} from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * Seed Documents
 * Creates sample documents for divisions (SK, laporan, dokumentasi)
 */
export async function seedDocuments(divisionIds: string[], userId: string) {
	console.log("Seeding Documents...");

	const documents = [
		{
			title: "SK Kepala Desa No. 1/2025",
			category: DocumentCategory.SURAT_KEPUTUSAN,
			type: "PDF",
			fileUrl: "/documents/sk-kepala-desa-001.pdf",
			fileSize: 245000,
			divisionId: divisionIds[0] || null,
			uploadedBy: userId,
		},
		{
			title: "Laporan Keuangan Q1 2025",
			category: DocumentCategory.LAPORAN_KEUANGAN,
			type: "PDF",
			fileUrl: "/documents/laporan-keuangan-q1-2025.pdf",
			fileSize: 512000,
			divisionId: divisionIds[0] || null,
			uploadedBy: userId,
		},
		{
			title: "Dokumentasi Gotong Royong",
			category: DocumentCategory.DOKUMENTASI,
			type: "Gambar",
			fileUrl: "/images/gotong-royong-2025.jpg",
			fileSize: 1024000,
			divisionId: divisionIds[3] || null,
			uploadedBy: userId,
		},
		{
			title: "Notulensi Rapat Desa",
			category: DocumentCategory.NOTULENSI_RAPAT,
			type: "Dokumen",
			fileUrl: "/documents/notulensi-rapat-desa.pdf",
			fileSize: 128000,
			divisionId: divisionIds[0] || null,
			uploadedBy: userId,
		},
		{
			title: "Data Penduduk 2025",
			category: DocumentCategory.UMUM,
			type: "Excel",
			fileUrl: "/documents/data-penduduk-2025.xlsx",
			fileSize: 350000,
			divisionId: null,
			uploadedBy: userId,
		},
	];

	for (const doc of documents) {
		await prisma.document.create({
			data: doc,
		});
	}

	console.log("✅ Documents seeded successfully");
}

/**
 * Seed Document Stats
 * Creates aggregate document counts matching user request
 */
export async function seedDocumentStats() {
	console.log("Seeding Document Stats...");

	const stats = [
		{
			villageId: "desa1",
			label: "Gambar",
			value: 389,
			color: "#fac858",
		},
		{
			villageId: "desa1",
			label: "Dokumen",
			value: 147,
			color: "#92cc76",
		},
	];

	for (const stat of stats) {
		await prisma.documentStat.upsert({
			where: {
				villageId_label: {
					villageId: stat.villageId,
					label: stat.label,
				},
			},
			update: stat,
			create: stat,
		});
	}

	console.log("✅ Document Stats seeded successfully");
}

/**
 * Seed Discussions
 * Creates sample discussions for divisions and activities
 */
export async function seedDiscussions(divisionIds: string[], userId: string) {
	console.log("Seeding Discussions...");

	const discussions = [
		{
			message: "Mohon update progress pembangunan jalan",
			senderId: userId,
			divisionId: divisionIds[1] || null,
			isResolved: false,
		},
		{
			message: "Baik, akan segera kami tindak lanjuti",
			senderId: userId,
			divisionId: divisionIds[1] || null,
			isResolved: false,
			parentId: null, // Will be set as reply
		},
		{
			message: "Jadwal rapat koordinasi minggu depan?",
			senderId: userId,
			divisionId: divisionIds[0] || null,
			isResolved: true,
		},
		{
			message: "Rapat dijadwalkan hari Senin, 10:00 WITA",
			senderId: userId,
			divisionId: divisionIds[0] || null,
			isResolved: true,
			parentId: null, // Will be set as reply
		},
		{
			message: "Program pemberdayaan UMKM butuh anggaran tambahan",
			senderId: userId,
			divisionId: divisionIds[2] || null,
			isResolved: false,
		},
	];

	// Create parent discussions first
	const parentDiscussions = [];
	for (let i = 0; i < discussions.length; i += 2) {
		const current = discussions[i];
		if (!current) continue;

		const discussion = await prisma.discussion.create({
			data: {
				message: current.message,
				senderId: current.senderId,
				divisionId: current.divisionId,
				isResolved: current.isResolved,
			},
		});
		parentDiscussions.push(discussion);
	}

	// Create replies
	for (let i = 1; i < discussions.length; i += 2) {
		const current = discussions[i];
		if (!current) continue;

		const parentIndex = Math.floor((i - 1) / 2);
		const parent = parentDiscussions[parentIndex];
		if (parent) {
			await prisma.discussion.update({
				where: { id: parent.id },
				data: {
					replies: {
						create: {
							message: current.message,
							senderId: current.senderId,
							isResolved: current.isResolved,
						},
					},
				},
			});
		}
	}

	console.log("✅ Discussions seeded successfully");
}

/**
 * Seed Division Metrics
 * Creates performance metrics for each division
 */
export async function seedDivisionMetrics(divisionIds: string[]) {
	console.log("Seeding Division Metrics...");

	const metrics = [
		{
			divisionId: divisionIds[0] || "",
			period: "2025-Q1",
			activityCount: 12,
			completionRate: 75.5,
			avgProgress: 82.3,
		},
		{
			divisionId: divisionIds[1] || "",
			period: "2025-Q1",
			activityCount: 8,
			completionRate: 62.5,
			avgProgress: 65.0,
		},
		{
			divisionId: divisionIds[2] || "",
			period: "2025-Q1",
			activityCount: 10,
			completionRate: 80.0,
			avgProgress: 70.5,
		},
		{
			divisionId: divisionIds[3] || "",
			period: "2025-Q1",
			activityCount: 15,
			completionRate: 86.7,
			avgProgress: 88.2,
		},
	];

	for (const metric of metrics) {
		await prisma.divisionMetric.upsert({
			where: {
				divisionId_period: {
					divisionId: metric.divisionId,
					period: metric.period,
				},
			},
			update: metric,
			create: metric,
		});
	}

	console.log("✅ Division Metrics seeded successfully");
}
