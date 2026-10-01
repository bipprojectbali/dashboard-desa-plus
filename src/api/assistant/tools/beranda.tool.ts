import type { WallBeranda, WallKpi } from "@/types/wall";
import { buildBeranda } from "../../wall-snapshot/build-beranda";
import { buildKpi } from "../../wall-snapshot/build-kpi";
import type { ToolDefinition } from "./types";

/** Batas agenda yang dikirim ke LLM (hemat token). */
export const AGENDA_LIMIT = 10;

export interface BerandaToolDeps {
	buildKpi: () => Promise<WallKpi>;
	buildBeranda: () => Promise<WallBeranda>;
}

/** Ringkas KPI + beranda; warna/gambar dibuang karena tidak berguna untuk jawaban teks. */
export function summarizeBeranda(
	kpi: WallKpi | null,
	beranda: WallBeranda | null,
) {
	return {
		kpiUtama: kpi && {
			jumlahPenduduk: kpi.residents,
			umkmAktif: kpi.umkm,
			totalPengaduan: kpi.complaints,
			kegiatanMendatang: kpi.activities,
			laporanKeamananMingguIni: kpi.securityReports,
		},
		kartuRingkasan: beranda?.kpi.map(({ label, value, sublabel }) => ({
			label,
			nilai: value,
			keterangan: sublabel,
		})),
		trenLayananSurat: beranda?.suratTrend,
		kepuasanLayanan: beranda?.kepuasan.map(({ category, value }) => ({
			kategori: category,
			nilai: value,
		})),
		divisiAktif: beranda?.divisi.map(({ name, activityCount }) => ({
			divisi: name,
			jumlahKegiatan: activityCount,
		})),
		agendaMendatang: beranda?.kalender
			.slice(0, AGENDA_LIMIT)
			.map(({ title, startDate, time, divisi }) => ({
				judul: title,
				tanggal: startDate,
				jam: time,
				divisi,
			})),
		apbdesTahunTerbaru: beranda?.apbdes.map(
			({ category, anggaran, realisasi, percentage }) => ({
				kategori: category,
				anggaran,
				realisasi,
				persenRealisasi: percentage,
			}),
		),
		skorSdgs: beranda?.sdgs.map(({ title, score }) => ({
			tujuan: title,
			skor: score,
		})),
	};
}

/** `ringkasan_beranda` — gambaran umum desa seperti halaman Beranda. */
export function createRingkasanBerandaTool(
	deps: BerandaToolDeps = { buildKpi, buildBeranda },
): ToolDefinition {
	return {
		name: "ringkasan_beranda",
		description:
			"Ringkasan kondisi desa hari ini seperti halaman Beranda dashboard: jumlah penduduk, UMKM aktif, total pengaduan, layanan surat, kepuasan layanan, divisi aktif, agenda/kegiatan mendatang, ringkasan APBDes tahun terbaru, dan skor SDGs desa.",
		parameters: { type: "object", properties: {}, additionalProperties: false },
		requiredFeature: "view-dashboard",
		async handler() {
			// Satu sumber gagal tidak menggagalkan yang lain; keduanya gagal → error.
			const [kpi, beranda] = await Promise.allSettled([
				deps.buildKpi(),
				deps.buildBeranda(),
			]);
			if (kpi.status === "rejected" && beranda.status === "rejected") {
				throw new Error("Beranda sources unavailable", {
					cause: beranda.reason,
				});
			}
			return {
				ok: true,
				data: summarizeBeranda(
					kpi.status === "fulfilled" ? kpi.value : null,
					beranda.status === "fulfilled" ? beranda.value : null,
				),
			};
		},
	};
}

export const ringkasanBerandaTool = createRingkasanBerandaTool();
