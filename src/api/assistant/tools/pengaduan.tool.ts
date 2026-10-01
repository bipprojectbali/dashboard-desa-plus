import type { WallPengaduan } from "@/types/wall";
import { buildPengaduan } from "../../wall-snapshot/build-pengaduan";
import type { ToolDefinition } from "./types";

export interface PengaduanToolDeps {
	buildPengaduan: () => Promise<WallPengaduan>;
}

/**
 * Hanya angka, kategori, dan status (kebijakan data temuan 3 opsi A).
 * Musrenbang (nama pengusul + judul tulisan warga) hanya dikirim jumlahnya;
 * id internal pengajuan juga dibuang.
 */
export function summarizePengaduan(data: WallPengaduan) {
	return {
		ringkasanStatus: data.stats,
		tren7Bulan: data.trend7m.map(({ month, count }) => ({
			bulan: month,
			jumlah: count,
		})),
		layananSuratPerJenis: data.serviceByType.map(({ letterType, count }) => ({
			jenisSurat: letterType,
			jumlah: count,
		})),
		pengajuanTerbaru: data.pengajuanTerbaru.map(
			({ kategori, subKategori, status, createdAt }) => ({
				kategori,
				subKategori,
				status,
				tanggal: createdAt,
			}),
		),
		jumlahUsulanMusrenbangTerbaru: data.musrenbang.length,
	};
}

/** `statistik_pengaduan` — angka pengaduan & layanan surat (halaman Pengaduan & Layanan Publik). */
export function createStatistikPengaduanTool(
	deps: PengaduanToolDeps = { buildPengaduan },
): ToolDefinition {
	return {
		name: "statistik_pengaduan",
		description:
			"Statistik pengaduan warga dan layanan publik: jumlah pengaduan per status (baru, proses, selesai, ditolak), tren pengaduan 7 bulan terakhir, jenis surat yang paling banyak diajukan, kategori dan status pengajuan terbaru, serta jumlah usulan musrenbang.",
		parameters: { type: "object", properties: {}, additionalProperties: false },
		requiredFeature: "view-pengaduan",
		async handler() {
			return {
				ok: true,
				data: summarizePengaduan(await deps.buildPengaduan()),
			};
		},
	};
}

export const statistikPengaduanTool = createStatistikPengaduanTool();
