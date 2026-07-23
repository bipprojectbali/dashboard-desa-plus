import {
	getDemografiAge,
	getDemografiBanjar,
	getDemografiBirths,
	getDemografiDeaths,
	getDemografiMigration,
	getDemografiOccupation,
	getDemografiReligion,
	getDemografiSectors,
	getDemografiSummary,
} from "@/api/dashboard-cache";
import {
	countDinamika,
	extractStats,
	mapAge,
	mapBanjar,
	mapOccupation,
	mapReligion,
	mapSectors,
} from "@/api/transforms/demografi";
import type { WallDemografi } from "@/types/wall";

/**
 * Bungkus loader agar kegagalan satu slice → nilai empty (bukan men-null seluruh
 * demografi). Setara Promise.allSettled di halaman Demografi: 1 endpoint Desa API
 * mati hanya mengosongkan panel terkait, panel lain tetap render.
 */
async function settle<T>(
	label: string,
	fn: () => Promise<unknown>,
	map: (raw: unknown) => T,
	empty: T,
): Promise<T> {
	try {
		return map(await fn());
	} catch (error) {
		console.error(`[wall build-demografi] ${label} fallback kosong:`, error);
		return empty;
	}
}

/**
 * Demografi wall: sumber = Desa API live (identik dengan halaman Demografi),
 * dibaca lewat shared loaders `getDemografi*` (satu penulis shape per cache key
 * `demografi:*`). Semua slice diisolasi via settle() agar tahan gagal sebagian.
 *
 * Catatan: `gender` sengaja kosong — Desa API tidak menyediakan endpoint sebaran
 * gender, dan halaman Demografi pun tidak menampilkannya. Widget gender di wall
 * menampilkan empty state ("Belum ada data") sampai sumbernya tersedia.
 */
export async function buildDemografi(): Promise<WallDemografi> {
	const [
		summary,
		religion,
		ageGroups,
		occupationTop,
		banjar,
		sectors,
		births,
		deaths,
		migration,
	] = await Promise.all([
		settle("summary", getDemografiSummary, extractStats, {
			total: 0,
			heads: 0,
			poor: 0,
		}),
		settle("religion", getDemografiReligion, mapReligion, []),
		settle("age", getDemografiAge, mapAge, []),
		settle("occupation", getDemografiOccupation, (r) => mapOccupation(r), []),
		settle("banjar", getDemografiBanjar, mapBanjar, []),
		settle("sectors", getDemografiSectors, mapSectors, []),
		// Dinamika: 3 endpoint terpisah, diambil mentah lalu digabung di bawah.
		settle("births", getDemografiBirths, (r) => r, null),
		settle("deaths", getDemografiDeaths, (r) => r, null),
		settle("migration", getDemografiMigration, (r) => r, null),
	]);

	return {
		stats: summary,
		gender: [],
		religion,
		ageGroups,
		occupationTop,
		dinamika: countDinamika({ births, deaths, migration }),
		banjar,
		sectors,
	};
}
