import type { WallPengaduan } from "@/types/wall";
import { prisma } from "@/utils/db";

/**
 * Pengaduan + layanan: stats status, trend 7 bulan, surat layanan per tipe,
 * kepuasan. Query sama dengan complaint.ts + dashboard.ts, tanpa field PII.
 */
export async function buildPengaduan(): Promise<WallPengaduan> {
	const [total, baru, proses, selesai, trendRows, serviceRows, kepuasan] =
		await Promise.all([
			prisma.complaint.count(),
			prisma.complaint.count({ where: { status: "BARU" } }),
			prisma.complaint.count({ where: { status: "DIPROSES" } }),
			prisma.complaint.count({ where: { status: "SELESAI" } }),
			prisma.$queryRaw<{ month: string; count: number }[]>`
				SELECT
					TO_CHAR("createdAt", 'Mon') as month,
					COUNT(*)::INTEGER as count
				FROM complaint
				WHERE "createdAt" > NOW() - INTERVAL '7 months'
				GROUP BY month, EXTRACT(MONTH FROM "createdAt")
				ORDER BY EXTRACT(MONTH FROM "createdAt") ASC
			`,
			prisma.serviceLetter.groupBy({
				by: ["letterType"],
				_count: { _all: true },
			}),
			prisma.satisfactionRating.findMany({
				orderBy: { value: "desc" },
				select: { category: true, value: true, color: true },
			}),
		]);

	return {
		stats: { total, baru, proses, selesai },
		trend7m: trendRows.map((r) => ({ month: r.month, count: Number(r.count) })),
		serviceByType: serviceRows.map((r) => ({
			letterType: r.letterType,
			count: r._count._all,
		})),
		kepuasan,
	};
}
