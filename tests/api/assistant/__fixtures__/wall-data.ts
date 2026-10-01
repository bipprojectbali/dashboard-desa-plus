import type { ApbdesEntryRaw } from "@/api/transforms/apbdes";
import type {
	WallBeranda,
	WallDemografi,
	WallDivisi,
	WallKpi,
	WallPengaduan,
} from "@/types/wall";

/**
 * Data builder palsu untuk test tool assistant — semua nilai test-only.
 * Nilai berawalan `SENSITIF-` tidak boleh pernah muncul di hasil tool
 * (kebijakan data temuan 3 opsi A).
 */

export const SENSITIVE_MARKER = "SENSITIF-";

export const KPI: WallKpi = {
	residents: 5120,
	umkm: 87,
	complaints: 42,
	activities: 6,
	securityReports: 3,
};

export const BERANDA: WallBeranda = {
	kpi: [{ label: "Layanan minggu ini", value: 14, sublabel: "surat" }],
	suratTrend: [{ month: "Sep", count: 30 }],
	kepuasan: [{ category: "Puas", value: 80, color: "#0f0" }],
	divisi: [{ id: "d1", name: "Pemerintahan", activityCount: 9, color: "#00f" }],
	kalender: Array.from({ length: 12 }, (_, i) => ({
		id: `e${i}`,
		title: `Rapat ${i}`,
		startDate: "2026-10-02",
		time: "09:00",
		divisi: "Pemerintahan",
	})),
	apbdes: [
		{
			category: "Belanja",
			anggaran: 1000,
			realisasi: 500,
			percentage: 50,
			color: "#f00",
		},
	],
	sdgs: [{ title: "Desa tanpa kemiskinan", score: 61, image: "/x.png" }],
};

export const PENGADUAN: WallPengaduan = {
	stats: { total: 42, baru: 5, proses: 7, selesai: 28, ditolak: 2 },
	trend7m: [{ month: "Sep", count: 6 }],
	serviceByType: [{ letterType: "Surat Keterangan Usaha", count: 19 }],
	pengajuanTerbaru: [
		{
			id: "SENSITIF-ID-PENGAJUAN",
			kategori: "Infrastruktur",
			subKategori: "Jalan",
			status: "proses",
			createdAt: "2026-09-30",
		},
	],
	musrenbang: [
		{
			id: "m1",
			judul: "SENSITIF-JUDUL-USULAN-WARGA",
			namaPengusul: "SENSITIF-NAMA-PENGUSUL",
			createdAt: "2026-09-29",
		},
	],
};

export const DEMOGRAFI: WallDemografi = {
	stats: { total: 5120, heads: 1500, poor: 210 },
	religion: [{ label: "Hindu", count: 4900 }],
	ageGroups: [{ range: "17-25", count: 700 }],
	occupationTop: [{ label: "Petani", count: 800 }],
	dinamika: { births: 40, deaths: 12, moveIn: 9, moveOut: 7 },
	banjar: [{ name: "Banjar Tengah", population: 900, kk: 250, poor: 30 }],
	sectors: [{ label: "Pertanian", value: 35 }],
};

export const DIVISI: WallDivisi = {
	activities: [{ name: "Selesai", value: 12, color: "#0f0" }],
	documents: [{ name: "Surat", jumlah: 30, color: "#00f" }],
	projects: [
		{
			id: "p1",
			title: "Perbaikan saluran irigasi",
			status: "berjalan",
			progress: 60,
			divisi: "Pembangunan",
			date: "2026-09-20",
		},
	],
	discussions: [
		{
			id: "x1",
			message: "SENSITIF-PESAN-DISKUSI dari Pak Budi",
			divisi: "Pembangunan",
			date: "2026-09-28",
		},
	],
};

/** Entri APBDes mentah: dua tahun, urutan acak (tool harus memilih terbaru). */
export const APBDES_ENTRIES: ApbdesEntryRaw[] = [
	{ id: "a2024", tahun: 2024, name: "APBDes 2024", items: [] },
	{ id: "a2025", tahun: 2025, name: "APBDes 2025", items: [] },
];
