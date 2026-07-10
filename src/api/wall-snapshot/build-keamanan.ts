import type { WallKeamanan } from "@/types/wall";
import { prisma } from "@/utils/db";

/**
 * Keamanan: 4 count status laporan lokal.
 * Query sama dengan keamanan.ts (/laporan-lokal/stats). Tanpa PII.
 */
export async function buildKeamanan(): Promise<WallKeamanan> {
	const [total, baru, diproses, selesai] = await Promise.all([
		prisma.securityReport.count(),
		prisma.securityReport.count({ where: { status: "BARU" } }),
		prisma.securityReport.count({ where: { status: "DIPROSES" } }),
		prisma.securityReport.count({ where: { status: "SELESAI" } }),
	]);

	return { total, baru, diproses, selesai };
}
