import type { WallKeamanan } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";

async function fetchCctvStats(): Promise<WallKeamanan["kpi"]> {
	const raw = await withCache("keamanan:cctv:stats", TTL.KEAMANAN, async () => {
		const response = await desaExternalClient.GET("/api/keamanan/cctv/stats");
		if (response.error) throw new Error(String(response.error));
		return response.data?.data ?? null;
	});

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const d = raw as any;
	return {
		cctvOnline: Number(d?.cctvOnline ?? d?.online ?? 0),
		laporanMingguIni: Number(d?.laporanMingguIni ?? d?.laporan ?? 0),
	};
}

async function fetchCctvList(): Promise<WallKeamanan["cctv"]> {
	const raw = await withCache("keamanan:cctv:list", TTL.KEAMANAN, async () => {
		const response = await desaExternalClient.GET(
			"/api/keamanan/cctv/find-many",
		);
		if (response.error) throw new Error(String(response.error));
		return response.data?.data ?? null;
	});

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const rows: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
	return rows.map((r) => ({
		id: String(r.id ?? r._id ?? ""),
		kode: String(r.kode ?? r.code ?? ""),
		nama: String(r.nama ?? r.name ?? ""),
		lokasi: String(r.lokasi ?? r.location ?? ""),
		latitude: Number(r.latitude ?? r.lat ?? 0),
		longitude: Number(r.longitude ?? r.lng ?? r.long ?? 0),
		status: String(r.status ?? "Offline"),
	}));
}

async function fetchLaporanPublik(): Promise<WallKeamanan["laporanPublik"]> {
	const raw = await withCache(
		"keamanan:laporan-publik:list",
		TTL.KEAMANAN,
		async () => {
			const response = await desaExternalClient.GET(
				"/api/keamanan/laporanpublik/find-many",
			);
			if (response.error) throw new Error(String(response.error));
			return response.data?.data ?? null;
		},
	);

	// biome-ignore lint/suspicious/noExplicitAny: Desa API response shape not in generated types
	const rows: any[] = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
	return rows.map((r) => ({
		id: String(r.id ?? r._id ?? ""),
		judul: String(r.judul ?? r.title ?? r.nama ?? ""),
		lokasi: String(r.lokasi ?? r.location ?? ""),
		tanggalWaktu: String(r.tanggalWaktu ?? r.tanggal ?? r.date ?? ""),
		status: String(r.status ?? "Baru"),
	}));
}

/**
 * Keamanan: mirror halaman /keamanan. Parallel-fetch 3 sumber dari Desa External
 * API (cctv/stats, cctv/find-many, laporanpublik/find-many). Tanpa PII-orang;
 * field yang diambil adalah data operasional publik setara website desa.
 */
export async function buildKeamanan(): Promise<WallKeamanan> {
	const [kpi, cctv, laporanPublik] = await Promise.all([
		fetchCctvStats(),
		fetchCctvList(),
		fetchLaporanPublik(),
	]);

	return { kpi, cctv, laporanPublik };
}
