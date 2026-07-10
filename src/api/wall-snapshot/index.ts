import type { WallSnapshot } from "@/types/wall";
import logger from "@/utils/logger";
import { computeSystemStats } from "@/utils/system-health";
import { buildDemografi } from "./build-demografi";
import { buildDivisi } from "./build-divisi";
import { buildKeamanan } from "./build-keamanan";
import { buildKeuangan } from "./build-keuangan";
import { buildKpi } from "./build-kpi";
import { buildPengaduan } from "./build-pengaduan";

/**
 * Otorisasi akses wall. Token unset ⇒ terbuka (mulai longgar, bisa diperketat
 * tanpa ubah kode). Token diisi ⇒ wajib `?key=<token>` sama persis.
 */
export function isWallAuthorized(
	token: string | undefined,
	key: string | undefined,
): boolean {
	return !token || key === token;
}

/** Bungkus builder: gagal → null + log, agar satu query gagal tak men-500-kan wall. */
async function settle<T>(
	name: string,
	fn: () => Promise<T>,
): Promise<T | null> {
	try {
		return await fn();
	} catch (error) {
		logger.warn({ error, builder: name }, "Wall snapshot builder failed");
		return null;
	}
}

/**
 * Rakit WallSnapshot dari semua builder domain secara paralel.
 * Degradasi anggun: slice yang gagal jadi null, panel lain tetap render.
 */
export async function buildWallSnapshot(): Promise<WallSnapshot> {
	const [kpi, keuangan, pengaduan, demografi, divisi, keamanan, system] =
		await Promise.all([
			settle("kpi", buildKpi),
			settle("keuangan", buildKeuangan),
			settle("pengaduan", buildPengaduan),
			settle("demografi", buildDemografi),
			settle("divisi", buildDivisi),
			settle("keamanan", buildKeamanan),
			settle("system", computeSystemStats),
		]);

	return {
		generatedAt: new Date().toISOString(),
		kpi,
		keuangan,
		pengaduan,
		demografi,
		divisi,
		keamanan,
		system,
	};
}
