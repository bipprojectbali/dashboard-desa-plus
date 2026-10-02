import type { WallCategory, WidgetId } from "./wall-layout-utils";

/** Metadata widget wall yang MURNI (tanpa React) — dipakai registry komponen dan registry penunjuk AI (server + browser). */
export interface WidgetMeta {
	id: WidgetId;
	title: string;
	category: WallCategory;
}

const META_BY_ID: Record<WidgetId, Omit<WidgetMeta, "id">> = {
	"beranda-kpi": { title: "KPI Beranda", category: "beranda" },
	"beranda-surat-trend": {
		title: "Statistik Pengajuan Surat",
		category: "beranda",
	},
	"beranda-kepuasan": { title: "Tingkat Kepuasan", category: "beranda" },
	"beranda-divisi": { title: "Divisi Teraktif", category: "beranda" },
	"beranda-kalender": {
		title: "Kalender & Kegiatan Mendatang",
		category: "beranda",
	},
	"beranda-apbdes": { title: "Realisasi APBDes", category: "beranda" },
	"beranda-sdgs": { title: "SDGs Desa", category: "beranda" },
	"keuangan-kpi": { title: "KPI Keuangan", category: "keuangan" },
	"keuangan-arus": { title: "Pemasukan / Pengeluaran", category: "keuangan" },
	"keuangan-alokasi": { title: "Alokasi per Bidang", category: "keuangan" },
	"keuangan-laporan": { title: "Laporan APBDes", category: "keuangan" },
	"keuangan-bantuan": { title: "Dana Bantuan & Hibah", category: "keuangan" },
	"pengaduan-status": { title: "Status Pengaduan", category: "pengaduan" },
	"pengaduan-trend": { title: "Tren 7 Bulan", category: "pengaduan" },
	"pengaduan-service-type": {
		title: "Surat Layanan per Tipe",
		category: "pengaduan",
	},
	"pengaduan-terbaru": { title: "Pengajuan Terbaru", category: "pengaduan" },
	"pengaduan-musrenbang": { title: "Musrenbang", category: "pengaduan" },
	"demografi-age": { title: "Kelompok Umur", category: "demografi" },
	"demografi-religion": { title: "Sebaran Agama", category: "demografi" },
	"demografi-occupation": { title: "Pekerjaan Teratas", category: "demografi" },
	"demografi-stats": { title: "Ringkasan Demografi", category: "demografi" },
	"demografi-dinamika": { title: "Dinamika Penduduk", category: "demografi" },
	"demografi-banjar": { title: "Data per Banjar", category: "demografi" },
	"demografi-sektor": { title: "Sektor Unggulan", category: "demografi" },
	"divisi-kinerja": { title: "Kinerja Divisi", category: "divisi" },
	"divisi-documents": { title: "Dokumen per Jenis", category: "divisi" },
	"divisi-kegiatan": { title: "Kegiatan Terbaru", category: "divisi" },
	"divisi-diskusi": { title: "Diskusi Terbaru", category: "divisi" },
	"keamanan-kpi": { title: "CCTV & Laporan Keamanan", category: "keamanan" },
	"keamanan-cctv": { title: "Daftar CCTV", category: "keamanan" },
	"keamanan-laporan": { title: "Laporan Publik", category: "keamanan" },
	"keamanan-peta": { title: "Peta CCTV", category: "keamanan" },
	"jenna-kpi": { title: "KPI Chatbot", category: "jenna" },
	"jenna-interaksi": { title: "Interaksi Chatbot", category: "jenna" },
	"jenna-topik": { title: "Topik Pertanyaan Terbanyak", category: "jenna" },
	"jenna-jam-sibuk": { title: "Jam Tersibuk", category: "jenna" },
	"bumdes-kpi": { title: "KPI Bumdes & UMKM", category: "bumdes" },
	"bumdes-ringkasan": { title: "Ringkasan Penjualan", category: "bumdes" },
	"bumdes-top-produk": { title: "Top Produk Terlaris", category: "bumdes" },
	"bumdes-detail": { title: "Detail Penjualan Produk", category: "bumdes" },
	"sosial-kpi": { title: "KPI Kesehatan", category: "sosial" },
	"sosial-kesehatan": { title: "Statistik Kesehatan", category: "sosial" },
	"sosial-posyandu": { title: "Jadwal Posyandu", category: "sosial" },
	"sosial-pendidikan": { title: "Pendidikan", category: "sosial" },
	"sosial-beasiswa": { title: "Beasiswa Desa", category: "sosial" },
	"sosial-event": { title: "Kalender Event Budaya", category: "sosial" },
	"sosial-kesejahteraan": {
		title: "Kesejahteraan Masyarakat",
		category: "sosial",
	},
	"ops-panel": { title: "Status Sistem", category: "ops" },
};

/** Metadata satu widget; satu-satunya tempat judul & kategori widget didefinisikan. */
export function widgetMeta(id: WidgetId): WidgetMeta {
	return { id, ...META_BY_ID[id] };
}
