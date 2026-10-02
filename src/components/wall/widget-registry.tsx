import type { FC } from "react";
import type { WallSnapshot } from "@/types/wall";
import type { WidgetGeom } from "./wall-bento";
import {
	ALL_WIDGET_IDS,
	isKnownWidgetId,
	type WallCategory,
	type WidgetId,
} from "./wall-layout-utils";
import { widgetMeta } from "./widget-meta";
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
import {
	KeamananCctvBody,
	KeamananKpiBody,
	KeamananLaporanBody,
	KeamananPetaBody,
} from "./widgets/keamanan";
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
import {
	SosialBeasiswaBody,
	SosialEventBody,
	SosialKesehatanBody,
	SosialKesejahteraanBody,
	SosialKpiBody,
	SosialPendidikanBody,
	SosialPosyanduBody,
} from "./widgets/sosial";

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
	/** `geom` opsional — hanya widget list-type yang memakainya untuk cap item. */
	Body: FC<{ data: T; geom?: WidgetGeom }>;
}

/** Balikin array bila ada isi, selain itu null (empty state). */
function nonEmpty<T>(arr: T[] | undefined | null): T[] | null {
	return arr && arr.length > 0 ? arr : null;
}

const WIDGETS: Record<WidgetId, WidgetDefinition> = {
	// ── Beranda ──────────────────────────────────────────────────────────────
	"beranda-kpi": {
		...widgetMeta("beranda-kpi"),
		selectData: (s) => nonEmpty(s?.beranda?.kpi),
		Body: BerandaKpiBody,
	},
	"beranda-surat-trend": {
		...widgetMeta("beranda-surat-trend"),
		selectData: (s) => nonEmpty(s?.beranda?.suratTrend),
		Body: BerandaSuratTrendBody,
	},
	"beranda-kepuasan": {
		...widgetMeta("beranda-kepuasan"),
		selectData: (s) => nonEmpty(s?.beranda?.kepuasan),
		Body: BerandaKepuasanBody,
	},
	"beranda-divisi": {
		...widgetMeta("beranda-divisi"),
		selectData: (s) => nonEmpty(s?.beranda?.divisi),
		Body: BerandaDivisiBody,
	},
	"beranda-kalender": {
		...widgetMeta("beranda-kalender"),
		selectData: (s) => nonEmpty(s?.beranda?.kalender),
		Body: BerandaKalenderBody,
	},
	"beranda-apbdes": {
		...widgetMeta("beranda-apbdes"),
		selectData: (s) => nonEmpty(s?.beranda?.apbdes),
		Body: BerandaApbdesBody,
	},
	"beranda-sdgs": {
		...widgetMeta("beranda-sdgs"),
		selectData: (s) => nonEmpty(s?.beranda?.sdgs),
		Body: BerandaSdgsBody,
	},
	// ── Keuangan ─────────────────────────────────────────────────────────────
	"keuangan-kpi": {
		...widgetMeta("keuangan-kpi"),
		selectData: (s) => s?.keuangan ?? null,
		Body: KeuanganKpiBody,
	},
	"keuangan-arus": {
		...widgetMeta("keuangan-arus"),
		selectData: (s) => nonEmpty(s?.keuangan?.monthly),
		Body: KeuanganArusBody,
	},
	"keuangan-alokasi": {
		...widgetMeta("keuangan-alokasi"),
		selectData: (s) => nonEmpty(s?.keuangan?.allocation),
		Body: KeuanganAlokasiBody,
	},
	"keuangan-laporan": {
		...widgetMeta("keuangan-laporan"),
		selectData: (s) => s?.keuangan?.report ?? null,
		Body: KeuanganLaporanBody,
	},
	"keuangan-bantuan": {
		...widgetMeta("keuangan-bantuan"),
		selectData: (s) => nonEmpty(s?.keuangan?.aid),
		Body: KeuanganBantuanBody,
	},
	"pengaduan-status": {
		...widgetMeta("pengaduan-status"),
		selectData: (s) => s?.pengaduan?.stats ?? null,
		Body: PengaduanStatusBody,
	},
	"pengaduan-trend": {
		...widgetMeta("pengaduan-trend"),
		selectData: (s) => nonEmpty(s?.pengaduan?.trend7m),
		Body: PengaduanTrendBody,
	},
	"pengaduan-service-type": {
		...widgetMeta("pengaduan-service-type"),
		selectData: (s) => nonEmpty(s?.pengaduan?.serviceByType),
		Body: PengaduanServiceTypeBody,
	},
	"pengaduan-terbaru": {
		...widgetMeta("pengaduan-terbaru"),
		selectData: (s) => nonEmpty(s?.pengaduan?.pengajuanTerbaru),
		Body: PengaduanTerbaruBody,
	},
	"pengaduan-musrenbang": {
		...widgetMeta("pengaduan-musrenbang"),
		selectData: (s) => nonEmpty(s?.pengaduan?.musrenbang),
		Body: MusrenbangBody,
	},
	"demografi-age": {
		...widgetMeta("demografi-age"),
		selectData: (s) => nonEmpty(s?.demografi?.ageGroups),
		Body: DemografiAgeBody,
	},
	"demografi-religion": {
		...widgetMeta("demografi-religion"),
		selectData: (s) => nonEmpty(s?.demografi?.religion),
		Body: DemografiReligionBody,
	},
	"demografi-occupation": {
		...widgetMeta("demografi-occupation"),
		selectData: (s) => nonEmpty(s?.demografi?.occupationTop),
		Body: DemografiOccupationBody,
	},
	"demografi-stats": {
		...widgetMeta("demografi-stats"),
		selectData: (s) => s?.demografi?.stats ?? null,
		Body: DemografiStatsBody,
	},
	"demografi-dinamika": {
		...widgetMeta("demografi-dinamika"),
		selectData: (s) => s?.demografi?.dinamika ?? null,
		Body: DemografiDinamikaBody,
	},
	"demografi-banjar": {
		...widgetMeta("demografi-banjar"),
		selectData: (s) => nonEmpty(s?.demografi?.banjar),
		Body: DemografiBanjarBody,
	},
	"demografi-sektor": {
		...widgetMeta("demografi-sektor"),
		selectData: (s) => nonEmpty(s?.demografi?.sectors),
		Body: DemografiSectorsBody,
	},
	"divisi-kinerja": {
		...widgetMeta("divisi-kinerja"),
		selectData: (s) => nonEmpty(s?.divisi?.activities),
		Body: DivisiKinerjaBody,
	},
	"divisi-documents": {
		...widgetMeta("divisi-documents"),
		selectData: (s) => nonEmpty(s?.divisi?.documents),
		Body: DivisiDocumentsBody,
	},
	"divisi-kegiatan": {
		...widgetMeta("divisi-kegiatan"),
		selectData: (s) => nonEmpty(s?.divisi?.projects),
		Body: DivisiKegiatanBody,
	},
	"divisi-diskusi": {
		...widgetMeta("divisi-diskusi"),
		selectData: (s) => nonEmpty(s?.divisi?.discussions),
		Body: DivisiDiskusiBody,
	},
	"keamanan-kpi": {
		...widgetMeta("keamanan-kpi"),
		selectData: (s) => s?.keamanan?.kpi ?? null,
		Body: KeamananKpiBody,
	},
	"keamanan-cctv": {
		...widgetMeta("keamanan-cctv"),
		selectData: (s) => nonEmpty(s?.keamanan?.cctv),
		Body: KeamananCctvBody,
	},
	"keamanan-laporan": {
		...widgetMeta("keamanan-laporan"),
		selectData: (s) => nonEmpty(s?.keamanan?.laporanPublik),
		Body: KeamananLaporanBody,
	},
	"keamanan-peta": {
		...widgetMeta("keamanan-peta"),
		selectData: (s) => nonEmpty(s?.keamanan?.cctv),
		Body: KeamananPetaBody,
	},
	"jenna-kpi": {
		...widgetMeta("jenna-kpi"),
		selectData: (s) => s?.jenna?.kpi ?? null,
		Body: JennaKpiBody,
	},
	"jenna-interaksi": {
		...widgetMeta("jenna-interaksi"),
		selectData: (s) => nonEmpty(s?.jenna?.mingguan),
		Body: JennaInteraksiBody,
	},
	"jenna-topik": {
		...widgetMeta("jenna-topik"),
		selectData: (s) => nonEmpty(s?.jenna?.topik),
		Body: JennaTopikBody,
	},
	"jenna-jam-sibuk": {
		...widgetMeta("jenna-jam-sibuk"),
		selectData: (s) => nonEmpty(s?.jenna?.jamSibuk),
		Body: JennaJamSibukBody,
	},
	// ── Bumdes & UMKM ────────────────────────────────────────────────────────
	"bumdes-kpi": {
		...widgetMeta("bumdes-kpi"),
		selectData: (s) => s?.bumdes?.kpi ?? null,
		Body: BumdesKpiBody,
	},
	"bumdes-ringkasan": {
		...widgetMeta("bumdes-ringkasan"),
		selectData: (s) => s?.bumdes?.ringkasan ?? null,
		Body: BumdesRingkasanBody,
	},
	"bumdes-top-produk": {
		...widgetMeta("bumdes-top-produk"),
		selectData: (s) => nonEmpty(s?.bumdes?.topProduk),
		Body: BumdesTopProdukBody,
	},
	"bumdes-detail": {
		...widgetMeta("bumdes-detail"),
		selectData: (s) => nonEmpty(s?.bumdes?.detail),
		Body: BumdesDetailBody,
	},
	// ── Sosial ───────────────────────────────────────────────────────────────
	"sosial-kpi": {
		...widgetMeta("sosial-kpi"),
		selectData: (s) => s?.sosial?.kpi ?? null,
		Body: SosialKpiBody,
	},
	"sosial-kesehatan": {
		...widgetMeta("sosial-kesehatan"),
		selectData: (s) => nonEmpty(s?.sosial?.kesehatan),
		Body: SosialKesehatanBody,
	},
	"sosial-posyandu": {
		...widgetMeta("sosial-posyandu"),
		selectData: (s) => nonEmpty(s?.sosial?.posyandu),
		Body: SosialPosyanduBody,
	},
	"sosial-pendidikan": {
		...widgetMeta("sosial-pendidikan"),
		selectData: (s) => s?.sosial?.pendidikan ?? null,
		Body: SosialPendidikanBody,
	},
	"sosial-beasiswa": {
		...widgetMeta("sosial-beasiswa"),
		selectData: (s) => s?.sosial?.beasiswa ?? null,
		Body: SosialBeasiswaBody,
	},
	"sosial-event": {
		...widgetMeta("sosial-event"),
		selectData: (s) => nonEmpty(s?.sosial?.event),
		Body: SosialEventBody,
	},
	"sosial-kesejahteraan": {
		...widgetMeta("sosial-kesejahteraan"),
		selectData: (s) => nonEmpty(s?.sosial?.kesejahteraan),
		Body: SosialKesejahteraanBody,
	},
	"ops-panel": {
		...widgetMeta("ops-panel"),
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
