/** Penyusun tile KPI beranda murni (tanpa network/prisma). */
import type { WallBerandaKpiTile } from "@/types/wall";

export interface BerandaKpiCounts {
	weeklyService: number;
	complaints: { baru: number; selesai: number; ditolak: number };
	totalPenduduk: number;
	totalKK: number;
}

/**
 * Urutan tile WAJIB [Surat, Pengaduan, Layanan, Penduduk] — positional terhadap
 * KPI_ICONS di beranda.tsx (4 entri, index 0–3).
 */
export function buildBerandaKpiTiles(
	c: BerandaKpiCounts,
): WallBerandaKpiTile[] {
	return [
		{
			label: "Surat Minggu Ini",
			value: c.weeklyService,
			sublabel: "Total surat diajukan",
		},
		{
			label: "Pengaduan Aktif",
			value: c.complaints.baru,
			sublabel: `${c.complaints.baru} baru, ${c.complaints.ditolak} ditolak`,
		},
		{
			label: "Layanan Selesai",
			value: c.complaints.selesai,
			sublabel: "Total diselesaikan",
		},
		{
			label: "Total Penduduk",
			value: c.totalPenduduk,
			sublabel: `${c.totalKK} kepala keluarga`,
		},
	];
}
