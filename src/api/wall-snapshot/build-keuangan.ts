import type { WallKeuangan } from "@/types/wall";
import { prisma } from "@/utils/db";

// APBDes memakai budget LOKAL (DB sendiri, fiscalYear 2025), bukan external
// APBDes — hindari call eksternal lambat/gagal yang bisa blokir wall.
const FISCAL_YEAR = 2025;

/**
 * Keuangan: APBDes (budget lokal), kepuasan layanan, skor SDGs.
 * Query sama dengan dashboard.ts (/budget, /satisfaction, /sdgs). Tanpa PII.
 */
export async function buildKeuangan(): Promise<WallKeuangan> {
	const [apbdes, satisfaction, sdgs] = await Promise.all([
		prisma.budget.findMany({
			where: { fiscalYear: FISCAL_YEAR },
			orderBy: { category: "asc" },
			select: {
				category: true,
				amount: true,
				percentage: true,
				color: true,
			},
		}),
		prisma.satisfactionRating.findMany({
			orderBy: { value: "desc" },
			select: { category: true, value: true, color: true },
		}),
		prisma.sdgsScore.findMany({
			orderBy: { score: "desc" },
			select: { title: true, score: true, image: true },
		}),
	]);

	return { apbdes, satisfaction, sdgs };
}
