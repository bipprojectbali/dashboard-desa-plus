import type { WallDemografi } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";
import { desaExternalClient } from "@/utils/desa-external-client";

/** Peta tipe PopulationDynamic → slot dinamika snapshot. */
const DYNAMIC_TYPE_MAP: Record<
	string,
	"births" | "deaths" | "moveIn" | "moveOut"
> = {
	KELAHIRAN: "births",
	KEMATIAN: "deaths",
	KEDATANGAN: "moveIn",
	KEPERGIAN: "moveOut",
};

/**
 * Sektor unggulan tak punya model prisma → ambil dari Desa API (sama seperti
 * halaman Demografi). Diisolasi: kegagalan eksternal hanya mengosongkan panel
 * sektor (empty state), tidak men-null seluruh slice demografi. Bentuk item
 * eksternal longgar, jadi label & nilai di-resolve toleran seperti di halaman.
 */
async function fetchSectors(): Promise<WallDemografi["sectors"]> {
	try {
		return await withCache("demografi:sectors", TTL.DEMOGRAFI, async () => {
			const res = await desaExternalClient.GET(
				"/api/ekonomi/sektourunggulandesa/find-many",
			);
			if (res.error) throw new Error("Sektor API error");
			const items = res.data?.data;
			if (!Array.isArray(items)) return [];
			return (items as Array<Record<string, unknown>>).map((s) => ({
				label: String(
					s.name ??
						s.nama ??
						s.sektor ??
						s.sektorUnggulan ??
						s.namaSektor ??
						"-",
				),
				value: Number(
					s.value ?? s.nilai ?? s.jumlah ?? s.total ?? s.count ?? 0,
				),
			}));
		});
	} catch (error) {
		console.error("[wall build-demografi] sektor fallback kosong:", error);
		return [];
	}
}

/**
 * Demografi: stats penduduk + sebaran gender/agama/umur/pekerjaan + dinamika,
 * per-banjar, dan sektor unggulan. Semua agregat lokal (prisma) tanpa PII;
 * hanya sektor yang berasal dari Desa API (diisolasi agar tak men-null slice).
 * Nama banjar = data wilayah publik, bukan PII-orang.
 */
export async function buildDemografi(): Promise<WallDemografi> {
	const [
		total,
		heads,
		poor,
		gender,
		religion,
		occupation,
		ageGroups,
		dynamics,
		banjar,
		sectors,
	] = await Promise.all([
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
		prisma.populationDynamic.groupBy({
			by: ["type"],
			_count: { _all: true },
		}),
		prisma.banjar.findMany({
			select: {
				name: true,
				totalPopulation: true,
				totalKK: true,
				totalPoor: true,
			},
			orderBy: { totalPopulation: "desc" },
		}),
		fetchSectors(),
	]);

	const dinamika = { births: 0, deaths: 0, moveIn: 0, moveOut: 0 };
	for (const d of dynamics) {
		const slot = DYNAMIC_TYPE_MAP[d.type];
		if (slot) dinamika[slot] += d._count._all;
	}

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
		dinamika,
		banjar: banjar.map((b) => ({
			name: b.name,
			population: b.totalPopulation,
			kk: b.totalKK,
			poor: b.totalPoor,
		})),
		sectors,
	};
}
