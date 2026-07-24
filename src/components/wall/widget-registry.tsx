import type { FC } from "react";
import type { WallSnapshot } from "@/types/wall";
import {
	ALL_WIDGET_IDS,
	isKnownWidgetId,
	type WallCategory,
	type WidgetId,
} from "./wall-layout-utils";
import {
	BerandaApbdesBody,
	BerandaDivisiBody,
	BerandaKalenderBody,
	BerandaKepuasanBody,
	BerandaKpiBody,
	BerandaSdgsBody,
	BerandaSuratTrendBody,
} from "./widgets/beranda";
import {
	BumdesDetailBody,
	BumdesKpiBody,
	BumdesRingkasanBody,
	BumdesTopProdukBody,
} from "./widgets/bumdes";
import {
	DemografiAgeBody,
	DemografiBanjarBody,
	DemografiDinamikaBody,
	DemografiOccupationBody,
	DemografiReligionBody,
	DemografiSectorsBody,
	DemografiStatsBody,
} from "./widgets/demografi";
import {
	DivisiDiskusiBody,
	DivisiDocumentsBody,
	DivisiKegiatanBody,
	DivisiKinerjaBody,
} from "./widgets/divisi";
import {
	JennaInteraksiBody,
	JennaJamSibukBody,
	JennaKpiBody,
	JennaTopikBody,
} from "./widgets/jenna";
import { KeamananStatusBody } from "./widgets/keamanan";
import {
	KeuanganAlokasiBody,
	KeuanganArusBody,
	KeuanganBantuanBody,
	KeuanganKpiBody,
	KeuanganLaporanBody,
} from "./widgets/keuangan";
import { OpsBody } from "./widgets/ops";
import {
	MusrenbangBody,
	PengaduanServiceTypeBody,
	PengaduanStatusBody,
	PengaduanTerbaruBody,
	PengaduanTrendBody,
} from "./widgets/pengaduan";

/**
 * Definisi satu widget. `selectData` mengambil slice dari snapshot; balikin
 * `null` bila slice tak ada / kosong → renderer tampilkan empty state.
 * `Body` menerima data non-null (renderer sudah cabang empty).
 */
// biome-ignore lint/suspicious/noExplicitAny: tiap widget punya tipe data slice sendiri; disatukan di sini.
export interface WidgetDefinition<T = any> {
	id: WidgetId;
	title: string;
	category: WallCategory;
	selectData: (snap: WallSnapshot | null | undefined) => T | null;
	Body: FC<{ data: T }>;
}

/** Balikin array bila ada isi, selain itu null (empty state). */
function nonEmpty<T>(arr: T[] | undefined | null): T[] | null {
	return arr && arr.length > 0 ? arr : null;
}

const WIDGETS: Record<WidgetId, WidgetDefinition> = {
	// ── Beranda ──────────────────────────────────────────────────────────────
	"beranda-kpi": {
		id: "beranda-kpi",
		title: "KPI Beranda",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.kpi),
		Body: BerandaKpiBody,
	},
	"beranda-surat-trend": {
		id: "beranda-surat-trend",
		title: "Statistik Pengajuan Surat",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.suratTrend),
		Body: BerandaSuratTrendBody,
	},
	"beranda-kepuasan": {
		id: "beranda-kepuasan",
		title: "Tingkat Kepuasan",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.kepuasan),
		Body: BerandaKepuasanBody,
	},
	"beranda-divisi": {
		id: "beranda-divisi",
		title: "Divisi Teraktif",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.divisi),
		Body: BerandaDivisiBody,
	},
	"beranda-kalender": {
		id: "beranda-kalender",
		title: "Kalender & Kegiatan Mendatang",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.kalender),
		Body: BerandaKalenderBody,
	},
	"beranda-apbdes": {
		id: "beranda-apbdes",
		title: "Realisasi APBDes",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.apbdes),
		Body: BerandaApbdesBody,
	},
	"beranda-sdgs": {
		id: "beranda-sdgs",
		title: "SDGs Desa",
		category: "beranda",
		selectData: (s) => nonEmpty(s?.beranda?.sdgs),
		Body: BerandaSdgsBody,
	},
	// ── Keuangan ─────────────────────────────────────────────────────────────
	"keuangan-kpi": {
		id: "keuangan-kpi",
		title: "KPI Keuangan",
		category: "keuangan",
		selectData: (s) => s?.keuangan ?? null,
		Body: KeuanganKpiBody,
	},
	"keuangan-arus": {
		id: "keuangan-arus",
		title: "Pemasukan / Pengeluaran",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.monthly),
		Body: KeuanganArusBody,
	},
	"keuangan-alokasi": {
		id: "keuangan-alokasi",
		title: "Alokasi per Bidang",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.allocation),
		Body: KeuanganAlokasiBody,
	},
	"keuangan-laporan": {
		id: "keuangan-laporan",
		title: "Laporan APBDes",
		category: "keuangan",
		selectData: (s) => s?.keuangan?.report ?? null,
		Body: KeuanganLaporanBody,
	},
	"keuangan-bantuan": {
		id: "keuangan-bantuan",
		title: "Dana Bantuan & Hibah",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.aid),
		Body: KeuanganBantuanBody,
	},
	"pengaduan-status": {
		id: "pengaduan-status",
		title: "Status Pengaduan",
		category: "pengaduan",
		selectData: (s) => s?.pengaduan?.stats ?? null,
		Body: PengaduanStatusBody,
	},
	"pengaduan-trend": {
		id: "pengaduan-trend",
		title: "Tren 7 Bulan",
		category: "pengaduan",
		selectData: (s) => nonEmpty(s?.pengaduan?.trend7m),
		Body: PengaduanTrendBody,
	},
	"pengaduan-service-type": {
		id: "pengaduan-service-type",
		title: "Surat Layanan per Tipe",
		category: "pengaduan",
		selectData: (s) => nonEmpty(s?.pengaduan?.serviceByType),
		Body: PengaduanServiceTypeBody,
	},
	"pengaduan-terbaru": {
		id: "pengaduan-terbaru",
		title: "Pengajuan Terbaru",
		category: "pengaduan",
		selectData: (s) => nonEmpty(s?.pengaduan?.pengajuanTerbaru),
		Body: PengaduanTerbaruBody,
	},
	"pengaduan-musrenbang": {
		id: "pengaduan-musrenbang",
		title: "Musrenbang",
		category: "pengaduan",
		selectData: (s) => nonEmpty(s?.pengaduan?.musrenbang),
		Body: MusrenbangBody,
	},
	"demografi-age": {
		id: "demografi-age",
		title: "Kelompok Umur",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.ageGroups),
		Body: DemografiAgeBody,
	},
	"demografi-religion": {
		id: "demografi-religion",
		title: "Sebaran Agama",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.religion),
		Body: DemografiReligionBody,
	},
	"demografi-occupation": {
		id: "demografi-occupation",
		title: "Pekerjaan Teratas",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.occupationTop),
		Body: DemografiOccupationBody,
	},
	"demografi-stats": {
		id: "demografi-stats",
		title: "Ringkasan Demografi",
		category: "demografi",
		selectData: (s) => s?.demografi?.stats ?? null,
		Body: DemografiStatsBody,
	},
	"demografi-dinamika": {
		id: "demografi-dinamika",
		title: "Dinamika Penduduk",
		category: "demografi",
		selectData: (s) => s?.demografi?.dinamika ?? null,
		Body: DemografiDinamikaBody,
	},
	"demografi-banjar": {
		id: "demografi-banjar",
		title: "Data per Banjar",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.banjar),
		Body: DemografiBanjarBody,
	},
	"demografi-sektor": {
		id: "demografi-sektor",
		title: "Sektor Unggulan",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.sectors),
		Body: DemografiSectorsBody,
	},
	"divisi-kinerja": {
		id: "divisi-kinerja",
		title: "Kinerja Divisi",
		category: "divisi",
		selectData: (s) => nonEmpty(s?.divisi?.activities),
		Body: DivisiKinerjaBody,
	},
	"divisi-documents": {
		id: "divisi-documents",
		title: "Dokumen per Jenis",
		category: "divisi",
		selectData: (s) => nonEmpty(s?.divisi?.documents),
		Body: DivisiDocumentsBody,
	},
	"divisi-kegiatan": {
		id: "divisi-kegiatan",
		title: "Kegiatan Terbaru",
		category: "divisi",
		selectData: (s) => nonEmpty(s?.divisi?.projects),
		Body: DivisiKegiatanBody,
	},
	"divisi-diskusi": {
		id: "divisi-diskusi",
		title: "Diskusi Terbaru",
		category: "divisi",
		selectData: (s) => nonEmpty(s?.divisi?.discussions),
		Body: DivisiDiskusiBody,
	},
	"keamanan-status": {
		id: "keamanan-status",
		title: "Laporan Keamanan",
		category: "keamanan",
		selectData: (s) => s?.keamanan ?? null,
		Body: KeamananStatusBody,
	},
	"jenna-kpi": {
		id: "jenna-kpi",
		title: "KPI Chatbot",
		category: "jenna",
		selectData: (s) => s?.jenna?.kpi ?? null,
		Body: JennaKpiBody,
	},
	"jenna-interaksi": {
		id: "jenna-interaksi",
		title: "Interaksi Chatbot",
		category: "jenna",
		selectData: (s) => nonEmpty(s?.jenna?.mingguan),
		Body: JennaInteraksiBody,
	},
	"jenna-topik": {
		id: "jenna-topik",
		title: "Topik Pertanyaan Terbanyak",
		category: "jenna",
		selectData: (s) => nonEmpty(s?.jenna?.topik),
		Body: JennaTopikBody,
	},
	"jenna-jam-sibuk": {
		id: "jenna-jam-sibuk",
		title: "Jam Tersibuk",
		category: "jenna",
		selectData: (s) => nonEmpty(s?.jenna?.jamSibuk),
		Body: JennaJamSibukBody,
	},
	// ── Bumdes & UMKM ────────────────────────────────────────────────────────
	"bumdes-kpi": {
		id: "bumdes-kpi",
		title: "KPI Bumdes & UMKM",
		category: "bumdes",
		selectData: (s) => s?.bumdes?.kpi ?? null,
		Body: BumdesKpiBody,
	},
	"bumdes-ringkasan": {
		id: "bumdes-ringkasan",
		title: "Ringkasan Penjualan",
		category: "bumdes",
		selectData: (s) => s?.bumdes?.ringkasan ?? null,
		Body: BumdesRingkasanBody,
	},
	"bumdes-top-produk": {
		id: "bumdes-top-produk",
		title: "Top Produk Terlaris",
		category: "bumdes",
		selectData: (s) => nonEmpty(s?.bumdes?.topProduk),
		Body: BumdesTopProdukBody,
	},
	"bumdes-detail": {
		id: "bumdes-detail",
		title: "Detail Penjualan Produk",
		category: "bumdes",
		selectData: (s) => nonEmpty(s?.bumdes?.detail),
		Body: BumdesDetailBody,
	},
	"ops-panel": {
		id: "ops-panel",
		title: "Status Sistem",
		category: "ops",
		selectData: (s) => s?.system ?? null,
		Body: OpsBody,
	},
};

/** Ambil definisi widget bila id dikenal. */
export function getWidget(id: string): WidgetDefinition | undefined {
	return isKnownWidgetId(id) ? WIDGETS[id] : undefined;
}

/** Semua definisi widget dalam urutan katalog. */
export function allWidgets(): WidgetDefinition[] {
	return ALL_WIDGET_IDS.map((id) => WIDGETS[id]);
}

/**
 * Widget yang BELUM terpasang di layout aktif — sumber galeri tambah-widget.
 * `order` yang mengandung id tak dikenal diabaikan (tak mempengaruhi hasil).
 */
export function unplacedWidgets(order: readonly string[]): WidgetDefinition[] {
	const placed = new Set(order);
	return ALL_WIDGET_IDS.filter((id) => !placed.has(id)).map(
		(id) => WIDGETS[id],
	);
}
