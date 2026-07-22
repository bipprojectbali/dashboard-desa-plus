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
	pengajuan_terbaru?: Array<{
		id?: string;
		kategori?: string;
		sub_kategori?: string | null;
		status?: string;
		created_at?: string;
	}>;
	musrenbang?: Array<{
		id?: string;
		judul?: string;
		nama_pengusul?: string;
		created_at?: string;
	}>;
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

const LIST_LIMIT = 5;

/** Map `.pengajuan_terbaru` Jenna → `WallPengaduan["pengajuanTerbaru"]`. Non-array → `[]`. Max 5. */
export function mapPengaduanTerbaru(
	rows: JennaPengaduanRaw["pengajuan_terbaru"] | null | undefined,
): Array<{ id: string; kategori: string; subKategori: string | null; status: string; createdAt: string }> {
	if (!Array.isArray(rows)) return [];
	return rows.slice(0, LIST_LIMIT).map((r) => ({
		id: r.id ?? "",
		kategori: r.kategori ?? "",
		subKategori: r.sub_kategori ?? null,
		status: r.status ?? "",
		createdAt: r.created_at ?? "",
	}));
}

/** Map `.musrenbang` Jenna → `WallPengaduan["musrenbang"]`. Non-array → `[]`. Max 5. */
export function mapMusrenbang(
	rows: JennaPengaduanRaw["musrenbang"] | null | undefined,
): Array<{ id: string; judul: string; namaPengusul: string; createdAt: string }> {
	if (!Array.isArray(rows)) return [];
	return rows.slice(0, LIST_LIMIT).map((r) => ({
		id: r.id ?? "",
		judul: r.judul ?? "",
		namaPengusul: r.nama_pengusul ?? "",
		createdAt: r.created_at ?? "",
	}));
}
