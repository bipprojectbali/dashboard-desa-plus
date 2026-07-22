import type { SystemHealth } from "@/utils/system-health";

/**
 * Snapshot agregat untuk NOC video wall (`/wall`).
 * Satu sumber kebenaran dipakai server (builder) dan klien (widget).
 *
 * Semua slice domain NULLABLE: partial-failure di satu builder hanya
 * mematikan satu panel, bukan seluruh wall. Mayoritas slice hanya angka
 * agregat tanpa PII. PENGECUALIAN: slice `beranda` sengaja memuat teks
 * operasional publik (divisi[].name, kalender[].title, kalender[].location)
 * — setara data yang sudah tampil di website desa, bukan PII-orang.
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
	stats: {
		total: number;
		baru: number;
		proses: number;
		selesai: number;
		ditolak: number;
	};
	trend7m: Array<{ month: string; count: number }>;
	serviceByType: Array<{ letterType: string; count: number }>;
	pengajuanTerbaru: Array<{
		id: string;
		kategori: string;
		subKategori: string | null;
		status: string;
		createdAt: string;
	}>;
	musrenbang: Array<{
		id: string;
		judul: string;
		namaPengusul: string;
		createdAt: string;
	}>;
}

export interface WallDemografi {
	stats: { total: number; heads: number; poor: number };
	gender: Array<{ label: string; count: number }>;
	religion: Array<{ label: string; count: number }>;
	ageGroups: Array<{ range: string; count: number }>;
	occupationTop: Array<{ label: string; count: number }>;
}

export interface WallDivisi {
	activities: Array<{ name: string; value: number; color: string }>;
	documents: Array<{ name: string; jumlah: number; color: string }>;
	projects: Array<{
		id: string;
		title: string;
		status: string;
		progress: number;
		divisi: string;
		date: string;
	}>;
	discussions: Array<{
		id: string;
		message: string;
		divisi: string;
		date: string;
	}>;
}

export interface WallKeamanan {
	total: number;
	baru: number;
	diproses: number;
	selesai: number;
}

export interface WallBerandaKpiTile {
	label: string;
	value: number;
	sublabel: string;
}

/**
 * Slice "Beranda" — 7 widget yang meniru card halaman utama dashboard.
 * Teks operasional publik (divisi[].name, kalender[].title/location) disertakan
 * secara sengaja; bukan PII-orang. Guard PII test memeriksa field nested ini.
 */
export interface WallBeranda {
	kpi: WallBerandaKpiTile[];
	suratTrend: Array<{ month: string; count: number }>;
	kepuasan: Array<{ category: string; value: number; color: string }>;
	divisi: Array<{
		id: string;
		name: string;
		activityCount: number;
		color: string;
	}>;
	kalender: Array<{
		id: string;
		title: string;
		startDate: string;
		time: string;
		divisi: string | null;
	}>;
	apbdes: Array<{
		category: string;
		anggaran: number;
		realisasi: number;
		percentage: number;
		color: string;
	}>;
	sdgs: Array<{ title: string; score: number; image: string | null }>;
}

export interface WallSnapshot {
	generatedAt: string;
	kpi: WallKpi | null;
	keuangan: WallKeuangan | null;
	pengaduan: WallPengaduan | null;
	demografi: WallDemografi | null;
	divisi: WallDivisi | null;
	keamanan: WallKeamanan | null;
	beranda: WallBeranda | null;
	system: SystemHealth | null;
}
