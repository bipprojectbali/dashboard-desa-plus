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
	DemografiAgeBody,
	DemografiBanjarBody,
	DemografiDinamikaBody,
	DemografiGenderBody,
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
import { KeamananStatusBody } from "./widgets/keamanan";
import {
	KeuanganApbdesBody,
	KeuanganKepuasanBody,
	KeuanganSdgsBody,
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
	"keuangan-apbdes": {
		id: "keuangan-apbdes",
		title: "APBDes 2025",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.apbdes),
		Body: KeuanganApbdesBody,
	},
	"keuangan-kepuasan": {
		id: "keuangan-kepuasan",
		title: "Kepuasan Layanan (Keuangan)",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.satisfaction),
		Body: KeuanganKepuasanBody,
	},
	"keuangan-sdgs": {
		id: "keuangan-sdgs",
		title: "Skor SDGs",
		category: "keuangan",
		selectData: (s) => nonEmpty(s?.keuangan?.sdgs),
		Body: KeuanganSdgsBody,
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
	"demografi-gender": {
		id: "demografi-gender",
		title: "Sebaran Gender",
		category: "demografi",
		selectData: (s) => nonEmpty(s?.demografi?.gender),
		Body: DemografiGenderBody,
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
