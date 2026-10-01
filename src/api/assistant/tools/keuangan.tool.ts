import { fetchApbdesEntriesRaw } from "../../sources/apbdes";
import type { ApbdesEntryRaw } from "../../transforms/apbdes";
import {
	type KeuanganYear,
	mapKeuanganList,
} from "../../transforms/keuangan-apbdes";
import type { ToolDefinition, ToolResult } from "./types";

const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
] as const;

export interface KeuanganToolDeps {
	fetchEntries: () => Promise<ApbdesEntryRaw[]>;
}

/** Tahun dari argumen LLM (angka atau teks angka); undefined = tidak diisi, null = tidak valid. */
export function parseTahun(value: unknown): number | null | undefined {
	if (value === undefined || value === null || value === "") return undefined;
	const n = typeof value === "string" ? Number(value.trim()) : value;
	return typeof n === "number" && Number.isInteger(n) && n >= 1900 && n <= 2999
		? n
		: null;
}

function summarizeYear(year: KeuanganYear, tahunTersedia: number[]) {
	return {
		tahun: year.tahun,
		tahunTersedia,
		satuan: "rupiah",
		totalAnggaran: year.totalBudget,
		realisasiPendapatan: year.totalIncomeReal,
		realisasiBelanja: year.totalExpenseReal,
		persenRealisasi: year.realisasiPercent,
		bulanan: year.monthly.map((m, i) => ({
			bulan: MONTHS[i] ?? String(i + 1),
			pendapatan: m.income,
			belanja: m.expense,
		})),
		alokasiPerSektor: year.allocation.map((a) => ({
			sektor: a.sector,
			jumlah: a.amount,
		})),
		laporan: {
			pendapatan: year.report.income.map((r) => ({
				kategori: r.category,
				jumlah: r.amount,
			})),
			belanja: year.report.expenses.map((r) => ({
				kategori: r.category,
				jumlah: r.amount,
			})),
		},
		bantuan: year.aid.map((a) => ({
			sumber: a.source,
			jumlah: a.amount,
			status: a.status,
		})),
	};
}

/** Pilih tahun APBDes: tanpa tahun = terbaru; tahun tak ada → error berisi daftar tahun tersedia. */
export function selectKeuangan(
	years: KeuanganYear[],
	tahunArg: unknown,
): ToolResult {
	const tahun = parseTahun(tahunArg);
	if (tahun === null)
		return { ok: false, error: "Parameter tahun tidak valid (contoh: 2025)." };
	const tahunTersedia = years.map((y) => y.tahun);
	if (years.length === 0)
		return { ok: false, error: "Data APBDes belum tersedia." };
	const year =
		tahun === undefined ? years[0] : years.find((y) => y.tahun === tahun);
	if (!year) {
		return {
			ok: false,
			error: `Data APBDes tahun ${tahun} tidak tersedia. Tahun yang tersedia: ${tahunTersedia.join(", ")}.`,
		};
	}
	return { ok: true, data: summarizeYear(year, tahunTersedia) };
}

/** `ringkasan_keuangan` — APBDes per tahun (sumber sama dengan halaman Keuangan). */
export function createRingkasanKeuanganTool(
	deps: KeuanganToolDeps = { fetchEntries: fetchApbdesEntriesRaw },
): ToolDefinition {
	return {
		name: "ringkasan_keuangan",
		description:
			"Data keuangan desa (APBDes) per tahun: total anggaran, realisasi pendapatan dan belanja, persen realisasi, pendapatan/belanja bulanan, alokasi anggaran per sektor, rincian laporan, dan dana bantuan. Tanpa tahun = tahun terbaru; hasil menyertakan daftar tahun yang tersedia.",
		parameters: {
			type: "object",
			properties: {
				tahun: {
					type: "integer",
					description:
						"Tahun anggaran, mis. 2025. Kosongkan untuk tahun terbaru.",
				},
			},
			additionalProperties: false,
		},
		requiredFeature: "view-keuangan",
		async handler(args) {
			const years = mapKeuanganList(await deps.fetchEntries());
			return selectKeuangan(years, args.tahun);
		},
	};
}

export const ringkasanKeuanganTool = createRingkasanKeuanganTool();
