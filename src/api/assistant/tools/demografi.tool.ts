import type { WallDemografi } from "@/types/wall";
import { buildDemografi } from "../../wall-snapshot/build-demografi";
import type { ToolDefinition } from "./types";

export interface DemografiToolDeps {
	buildDemografi: () => Promise<WallDemografi>;
}

/** Agregat saja: builder demografi tidak memuat data per orang. */
export function summarizeDemografi(data: WallDemografi) {
	return {
		ringkasan: {
			jumlahPenduduk: data.stats.total,
			jumlahKepalaKeluarga: data.stats.heads,
			pendudukMiskin: data.stats.poor,
		},
		perAgama: data.religion.map(({ label, count }) => ({
			agama: label,
			jumlah: count,
		})),
		perKelompokUmur: data.ageGroups.map(({ range, count }) => ({
			kelompokUmur: range,
			jumlah: count,
		})),
		pekerjaanTerbanyak: data.occupationTop.map(({ label, count }) => ({
			pekerjaan: label,
			jumlah: count,
		})),
		dinamikaTahunIni: {
			kelahiran: data.dinamika.births,
			kematian: data.dinamika.deaths,
			pindahMasuk: data.dinamika.moveIn,
			pindahKeluar: data.dinamika.moveOut,
		},
		perBanjar: data.banjar.map(({ name, population, kk, poor }) => ({
			banjar: name,
			penduduk: population,
			kepalaKeluarga: kk,
			miskin: poor,
		})),
		sektorEkonomi: data.sectors.map(({ label, value }) => ({
			sektor: label,
			nilai: value,
		})),
	};
}

/** `statistik_demografi` — kependudukan agregat (halaman Demografi & Pekerjaan). */
export function createStatistikDemografiTool(
	deps: DemografiToolDeps = { buildDemografi },
): ToolDefinition {
	return {
		name: "statistik_demografi",
		description:
			"Statistik kependudukan (demografi) desa, agregat saja: jumlah penduduk, kepala keluarga (KK), penduduk miskin, sebaran per banjar, kelompok umur, agama, pekerjaan warga terbanyak, sektor ekonomi, serta kelahiran, kematian, dan perpindahan penduduk tahun ini.",
		parameters: { type: "object", properties: {}, additionalProperties: false },
		requiredFeature: "view-demografi",
		async handler() {
			return {
				ok: true,
				data: summarizeDemografi(await deps.buildDemografi()),
			};
		},
	};
}

export const statistikDemografiTool = createStatistikDemografiTool();
