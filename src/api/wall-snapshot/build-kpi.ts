import type { WallKpi } from "@/types/wall";
import { prisma } from "@/utils/db";

/** 6 angka KPI lintas domain — count murni, tanpa PII. */
export async function buildKpi(): Promise<WallKpi> {
	const [residents, umkm, complaints, activities, securityReports, documents] =
		await Promise.all([
			prisma.resident.count(),
			prisma.umkm.count(),
			prisma.complaint.count(),
			prisma.activity.count(),
			prisma.securityReport.count(),
			prisma.document.count(),
		]);

	return {
		residents,
		umkm,
		complaints,
		activities,
		securityReports,
		documents,
	};
}
