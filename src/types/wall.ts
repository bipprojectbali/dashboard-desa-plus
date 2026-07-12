import type { SystemHealth } from "@/utils/system-health";

/**
 * Snapshot agregat untuk NOC video wall (`/wall`).
 * Satu sumber kebenaran dipakai server (builder) dan klien (widget).
 *
 * Semua slice domain NULLABLE: partial-failure di satu builder hanya
 * mematikan satu panel, bukan seluruh wall. TANPA field PII —
 * hanya angka agregat, tidak ada nama/NIK/isi pesan.
 */

export interface WallKpi {
	residents: number;
	umkm: number;
	complaints: number;
	activities: number;
	securityReports: number;
	documents: number;
}

export interface WallKeuangan {
	apbdes: Array<{
		category: string;
		amount: number;
		percentage: number;
		color: string;
	}>;
	satisfaction: Array<{ category: string; value: number; color: string }>;
	sdgs: Array<{ title: string; score: number; image: string | null }>;
}

export interface WallPengaduan {
	stats: { total: number; baru: number; proses: number; selesai: number };
	trend7m: Array<{ month: string; count: number }>;
	serviceByType: Array<{ letterType: string; count: number }>;
	kepuasan: Array<{ category: string; value: number; color: string }>;
}

export interface WallDemografi {
	stats: { total: number; heads: number; poor: number };
	gender: Array<{ label: string; count: number }>;
	religion: Array<{ label: string; count: number }>;
	ageGroups: Array<{ range: string; count: number }>;
	occupationTop: Array<{ label: string; count: number }>;
}

export interface WallDivisi {
	activities: {
		total: number;
		counts: {
			selesai: number;
			berjalan: number;
			tertunda: number;
			dibatalkan: number;
		};
		percentages: {
			selesai: number;
			berjalan: number;
			tertunda: number;
			dibatalkan: number;
		};
	};
	documents: Array<{ name: string; jumlah: number; color: string }>;
}

export interface WallKeamanan {
	total: number;
	baru: number;
	diproses: number;
	selesai: number;
}

export interface WallSnapshot {
	generatedAt: string;
	kpi: WallKpi | null;
	keuangan: WallKeuangan | null;
	pengaduan: WallPengaduan | null;
	demografi: WallDemografi | null;
	divisi: WallDivisi | null;
	keamanan: WallKeamanan | null;
	system: SystemHealth | null;
}
