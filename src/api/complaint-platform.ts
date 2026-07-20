/**
 * Transform murni untuk card pengaduan & surat dashboard (Fase 2).
 * Dipisah dari complaint.ts agar bisa diuji tanpa network.
 */

// English 3-huruf, indeks = getUTCMonth(). Mirror lama TO_CHAR('Mon') Postgres
// supaya label XAxis ChartSurat tak berubah. Deterministik, tak ikut locale.
const MONTH_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

export interface ComplaintStats {
	total: number;
	baru: number;
	selesai: number;
	ditolak: number;
}

export interface TrendPoint {
	month: string;
	count: number;
}

export const EMPTY_COMPLAINT_STATS: ComplaintStats = {
	total: 0,
	baru: 0,
	selesai: 0,
	ditolak: 0,
};

export interface PlatformLaporan {
	status?: string;
}

export interface PlatformSurat {
	created_at?: string;
}

/** baru/selesai/ditolak dari laporan platform. Aktif=baru, Selesai=selesai (keputusan user). */
export function mapComplaintStats(
	rows: PlatformLaporan[],
	total?: number,
): ComplaintStats {
	let baru = 0;
	let selesai = 0;
	let ditolak = 0;
	for (const r of rows) {
		if (r.status === "baru") baru++;
		else if (r.status === "selesai") selesai++;
		else if (r.status === "ditolak") ditolak++;
	}
	return { total: total ?? rows.length, baru, selesai, ditolak };
}

/** Jumlah surat sejak awal minggu berjalan (Minggu 00:00 lokal). Pertahankan makna lama. */
export function countSuratWeekly(
	rows: PlatformSurat[],
	now: Date = new Date(),
): number {
	const startOfWeek = new Date(now);
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
	startOfWeek.setHours(0, 0, 0, 0);
	let count = 0;
	for (const r of rows) {
		if (!r.created_at) continue;
		if (new Date(r.created_at) >= startOfWeek) count++;
	}
	return count;
}

/** Group surat per bulan (kronologis) untuk ChartSurat. Casing jenis tak relevan. */
export function mapSuratTrends(rows: PlatformSurat[]): TrendPoint[] {
	const counts = new Map<number, number>(); // key: year*12 + month
	for (const r of rows) {
		if (!r.created_at) continue;
		const d = new Date(r.created_at);
		if (Number.isNaN(d.getTime())) continue;
		const key = d.getUTCFullYear() * 12 + d.getUTCMonth();
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([key, count]) => ({ month: MONTH_SHORT[key % 12], count }));
}
