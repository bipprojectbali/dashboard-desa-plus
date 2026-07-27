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
}

export interface WallKeuangan {
	tahun: number;
	totalBudget: number;
	totalIncomeReal: number;
	totalExpenseReal: number;
	realisasiPercent: number;
	monthly: Array<{ income: number; expense: number }>;
	allocation: Array<{ sector: string; amount: number }>;
	report: {
		income: Array<{ category: string; amount: number }>;
		expenses: Array<{ category: string; amount: number }>;
		totalIncome: number;
		totalExpense: number;
	};
	aid: Array<{ source: string; amount: number; status: "cair" | "proses" }>;
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
	religion: Array<{ label: string; count: number }>;
	ageGroups: Array<{ range: string; count: number }>;
	occupationTop: Array<{ label: string; count: number }>;
	/** Dinamika penduduk tahun berjalan: kelahiran/kematian/pindah masuk/keluar. */
	dinamika: {
		births: number;
		deaths: number;
		moveIn: number;
		moveOut: number;
	};
	/**
	 * Data agregat per banjar (penduduk/KK/miskin). Nama banjar = data wilayah
	 * publik, bukan PII-orang (setara yang tampil di halaman Demografi).
	 */
	banjar: Array<{
		name: string;
		population: number;
		kk: number;
		poor: number;
	}>;
	/** Sektor ekonomi unggulan desa (label + nilai) untuk bar horizontal. */
	sectors: Array<{ label: string; value: number }>;
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

/**
 * Slice "Jenna Analytic" — mirror halaman `/jenna-analytic`. Sumber = NOC/Jenna
 * API (`/api/noc/jenna/analytics`), sama seperti slice pengaduan. Hanya angka
 * agregat interaksi chatbot, tanpa PII. Nullable: env Jenna tak diset → slice
 * null → panel tampil empty, wall lain tetap render.
 */
export interface WallJenna {
	/** Kartu KPI ringkas interaksi chatbot hari ini. */
	kpi: {
		interaksiHariIni: number;
		changeFromYesterday: number;
		jawabanOtomatis: number;
		belumDitindak: number;
		waktuRespon: string;
	};
	/** Interaksi chatbot mingguan (Jum–Kam) untuk bar chart. */
	mingguan: Array<{ day: string; count: number }>;
	/** Topik pertanyaan terbanyak (label + hitungan). */
	topik: Array<{ topic: string; count: number }>;
	/** Distribusi jam tersibuk (slot + persen 0..100). */
	jamSibuk: Array<{ slot: string; pct: number }>;
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

export interface WallBumdes {
	kpi: {
		umkmAktif: number;
		totalUmkm: number;
		omzetBulanan: number;
		kategoriTerbanyak: string;
		jumlahKategoriTerbanyak: number;
	};
	ringkasan: {
		totalPenjualan: number;
		persentasePerubahan: number;
		kategoriAktif: number;
		totalTransaksi: number;
	};
	topProduk: Array<{
		namaProduk: string;
		namaUmkm: string;
		totalPenjualan: number;
		jumlahTerjual: number;
		growth: number;
	}>;
	detail: Array<{
		namaProduk: string;
		penjualanBulanIni: number;
		penjualanBulanLalu: number;
		trend: "up" | "down";
		trendPersen: number;
		stok: number;
		statusStok: string;
	}>;
}

/**
 * Slice "Sosial" — mirror halaman `/sosial`. Hanya angka agregat + data
 * operasional publik. Riwayat kesehatan warga (PII nama+medis) TIDAK disertakan.
 * event[]: nama+lokasi setara website desa, bukan PII-orang.
 */
export interface WallSosial {
	kpi: {
		ibuHamilAktif: number;
		balitaTerdaftar: number;
		alertStunting: number;
		posyanduAktif: number;
	};
	kesehatan: Array<{ label: string; value: number; color: string }>;
	posyandu: Array<{ id: string; name: string; jadwal: string; time: string }>;
	pendidikan: {
		perJenjang: Array<{ nama: string; jumlahSiswa: number }>;
		jumlahLembaga: number;
		jumlahPengajar: number;
	};
	beasiswa: {
		total: number;
		lakiLaki: number;
		perempuan: number;
		periode: string | null;
	};
	/** event: nama+lokasi = data budaya publik (setara website desa), bukan PII-orang. */
	event: Array<{
		id: string;
		title: string;
		startDate: string;
		location: string;
	}>;
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
	jenna: WallJenna | null;
	bumdes: WallBumdes | null;
	sosial: WallSosial | null;
	system: SystemHealth | null;
}
