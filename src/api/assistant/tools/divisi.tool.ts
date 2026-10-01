import type { WallDivisi } from "@/types/wall";
import { buildDivisi } from "../../wall-snapshot/build-divisi";
import type { ToolDefinition } from "./types";

export interface DivisiToolDeps {
	buildDivisi: () => Promise<WallDivisi>;
}

/**
 * Isi pesan diskusi dibuang (teks bebas yang bisa menyebut orang) — hanya
 * divisi & tanggalnya. Judul proyek/kegiatan bukan tulisan warga, jadi tetap.
 */
export function summarizeDivisi(data: WallDivisi) {
	return {
		progresKegiatan: data.activities.map(({ name, value }) => ({
			status: name,
			jumlah: value,
		})),
		dokumenPerJenis: data.documents.map(({ name, jumlah }) => ({
			jenis: name,
			jumlah,
		})),
		kegiatanTerbaru: data.projects.map(
			({ title, status, progress, divisi, date }) => ({
				judul: title,
				status,
				persenProgres: progress,
				divisi,
				tanggal: date,
			}),
		),
		diskusiTerbaru: data.discussions.map(({ divisi, date }) => ({
			divisi,
			tanggal: date,
		})),
	};
}

/** `kinerja_divisi` — kegiatan & dokumen divisi (halaman Kinerja Divisi). */
export function createKinerjaDivisiTool(
	deps: DivisiToolDeps = { buildDivisi },
): ToolDefinition {
	return {
		name: "kinerja_divisi",
		description:
			"Kinerja divisi perangkat desa: progres kegiatan per status, jumlah dokumen per jenis, kegiatan/proyek terbaru beserta divisi dan persen progresnya, serta divisi yang paling aktif berdiskusi.",
		parameters: { type: "object", properties: {}, additionalProperties: false },
		requiredFeature: "view-kinerja-divisi",
		async handler() {
			return { ok: true, data: summarizeDivisi(await deps.buildDivisi()) };
		},
	};
}

export const kinerjaDivisiTool = createKinerjaDivisiTool();
