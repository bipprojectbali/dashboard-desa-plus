/** Raw payload dari Jenna `/api/noc/pengaduan`. */
export interface JennaPengaduanRaw {
	stats?: {
		total?: number;
		baru?: number;
		diproses?: number; // Jenna pakai "diproses", WallPengaduan pakai "proses"
		selesai?: number;
	};
	trends?: Array<{ bulan?: string; count?: number | string }>;
	surat_terbanyak?: Array<{ jenis?: string; count?: number | string }>;
}

/** Map `.stats` Jenna → `WallPengaduan["stats"]`. Null-safe, default 0. */
export function mapPengaduanStats(raw: JennaPengaduanRaw | null | undefined): {
	total: number;
	baru: number;
	proses: number;
	selesai: number;
} {
	const s = raw?.stats;
	return {
		total: s?.total ?? 0,
		baru: s?.baru ?? 0,
		proses: s?.diproses ?? 0, // mismatch: Jenna "diproses" → WallPengaduan "proses"
		selesai: s?.selesai ?? 0,
	};
}

/** Map `.trends` Jenna → `WallPengaduan["trend7m"]`. Non-array → `[]`. */
export function mapPengaduanTrend(
	rows: JennaPengaduanRaw["trends"] | null | undefined,
): Array<{ month: string; count: number }> {
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => ({
		month: r.bulan ?? "",
		count: Number(r.count ?? 0),
	}));
}

/** Map `.surat_terbanyak` Jenna → `WallPengaduan["serviceByType"]`. Non-array → `[]`. */
export function mapPengaduanService(
	rows: JennaPengaduanRaw["surat_terbanyak"] | null | undefined,
): Array<{ letterType: string; count: number }> {
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => ({
		letterType: r.jenis ?? "",
		count: Number(r.count ?? 0),
	}));
}
