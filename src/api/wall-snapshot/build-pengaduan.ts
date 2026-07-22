import type { WallPengaduan } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import {
	type JennaPengaduanRaw,
	mapPengaduanService,
	mapPengaduanStats,
	mapPengaduanTrend,
} from "../transforms/noc-pengaduan";

/** Fetch & cache data pengaduan dari Jenna. Guard: env kosong → throw → settle() → null. */
async function fetchPengaduanFromJenna(): Promise<WallPengaduan> {
	return withCache("dashboard:pengaduan", TTL.DASHBOARD, async () => {
		const apiUrl = process.env.VITE_JENNA_API_URL ?? "";
		const token = process.env.VITE_JENNA_API_TOKEN ?? "";
		if (!apiUrl || !token) throw new Error("VITE_JENNA_API_URL/TOKEN not set");

		const res = await fetch(`${apiUrl}/api/noc/pengaduan`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error(`Jenna pengaduan error: ${res.status}`);

		const json = await res.json();
		const d = (json?.data ?? json) as JennaPengaduanRaw;

		return {
			stats: mapPengaduanStats(d),
			trend7m: mapPengaduanTrend(d.trends),
			serviceByType: mapPengaduanService(d.surat_terbanyak),
		};
	});
}

/** Rakit slice pengaduan dari Jenna (sumber sama dgn halaman /pengaduan-layanan-publik). */
export async function buildPengaduan(): Promise<WallPengaduan> {
	return fetchPengaduanFromJenna();
}
