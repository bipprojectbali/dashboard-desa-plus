import type { WallDemografi } from "@/types/wall";
import { prisma } from "@/utils/db";

/**
 * Demografi: stats penduduk + sebaran gender/agama/umur/pekerjaan.
 * Query sama dengan resident.ts, di-flatten ke {label,count}. Tanpa PII
 * (hanya kategori agregat: jenis kelamin, agama, rentang umur, jenis pekerjaan).
 */
export async function buildDemografi(): Promise<WallDemografi> {
	const [total, heads, poor, gender, religion, occupation, ageGroups] =
		await Promise.all([
			prisma.resident.count(),
			prisma.resident.count({ where: { isHeadOfHousehold: true } }),
			prisma.resident.count({ where: { isPoor: true } }),
			prisma.resident.groupBy({ by: ["gender"], _count: { _all: true } }),
			prisma.resident.groupBy({ by: ["religion"], _count: { _all: true } }),
			prisma.resident.groupBy({
				by: ["occupation"],
				_count: { _all: true },
				orderBy: { _count: { occupation: "desc" } },
				take: 10,
			}),
			prisma.$queryRaw<{ range: string; count: number }[]>`
				SELECT
					CASE
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 0 AND 16 THEN '0-16'
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 17 AND 25 THEN '17-25'
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 26 AND 35 THEN '26-35'
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 36 AND 45 THEN '36-45'
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 46 AND 55 THEN '46-55'
						WHEN date_part('year', age(now(), "birthDate")) BETWEEN 56 AND 65 THEN '56-65'
						ELSE '65+'
					END as range,
					COUNT(*)::INTEGER as count
				FROM resident
				GROUP BY range
				ORDER BY range ASC
			`,
		]);

	return {
		stats: { total, heads, poor },
		gender: gender.map((g) => ({
			label: g.gender ?? "Tidak diketahui",
			count: g._count._all,
		})),
		religion: religion.map((r) => ({
			label: r.religion ?? "Tidak diketahui",
			count: r._count._all,
		})),
		ageGroups: ageGroups.map((a) => ({
			range: a.range,
			count: Number(a.count),
		})),
		occupationTop: occupation.map((o) => ({
			label: o.occupation ?? "Tidak diketahui",
			count: o._count._all,
		})),
	};
}
