import type { WallBumdes } from "@/types/wall";
import {
	fetchUmkmDetail,
	fetchUmkmKpi,
	fetchUmkmRingkasan,
	fetchUmkmTopProduk,
} from "../sources/umkm-dashboard";

const PERIOD = "monthly";

/** Bumdes wall: aggregate 4 endpoint live UMKM dashboard (period=monthly). */
export async function buildBumdes(): Promise<WallBumdes | null> {
	const [kpi, ringkasan, topProduk, detail] = await Promise.all([
		fetchUmkmKpi(PERIOD).catch(() => null),
		fetchUmkmRingkasan(PERIOD).catch(() => null),
		fetchUmkmTopProduk(PERIOD).catch(() => null),
		fetchUmkmDetail(PERIOD).catch(() => null),
	]);

	if (!kpi) return null;

	return {
		kpi,
		ringkasan: ringkasan ?? {
			totalPenjualan: 0,
			persentasePerubahan: 0,
			kategoriAktif: 0,
			totalTransaksi: 0,
		},
		topProduk: topProduk ?? [],
		detail: detail ?? [],
	};
}
