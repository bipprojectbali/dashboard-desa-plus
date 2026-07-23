/**
 * Transform murni untuk data keuangan APBDes multi-tahun.
 * Semua nilai dalam satuan RUPIAH PENUH — konversi ke juta dilakukan di client.
 */

import type { ApbdesEntryRaw, ApbdesItemRaw } from "./apbdes";

export interface KeuanganMonthly {
	income: number;
	expense: number;
}

export interface KeuanganAllocation {
	sector: string;
	amount: number;
}

export interface KeuanganReportItem {
	category: string;
	amount: number;
}

export interface KeuanganReport {
	income: KeuanganReportItem[];
	expenses: KeuanganReportItem[];
	/** Realisasi pendapatan (rupiah penuh) — untuk total row & saldo. */
	totalIncome: number;
	/** Realisasi belanja (rupiah penuh) — untuk total row & saldo. */
	totalExpense: number;
}

export interface KeuanganAid {
	source: string;
	amount: number;
	status: "cair" | "proses";
}

export interface KeuanganYear {
	id: string;
	tahun: number;
	name: string;
	totalBudget: number;
	totalIncomeReal: number;
	totalExpenseReal: number;
	realisasiPercent: number;
	/** 12 elemen, index 0 = Januari. Nilai rupiah penuh. */
	monthly: KeuanganMonthly[];
	allocation: KeuanganAllocation[];
	report: KeuanganReport;
	aid: KeuanganAid[];
}

/**
 * Ambil item breakdown per tipe menggunakan children-of-root.
 * Root = item tipe tsb dengan parentId null.
 * Jika ada children langsung dari root → pakai children.
 * Jika tidak ada (flat) → pakai root itu sendiri.
 * Ini mencegah emisi satu aggregate root saat data hierarkis punya anak.
 */
function getBreakdown(items: ApbdesItemRaw[], tipe: string): ApbdesItemRaw[] {
	const tipeItems = items.filter(
		(i) => i.tipe?.toLowerCase() === tipe.toLowerCase(),
	);
	const roots = tipeItems.filter((i) => !i.parentId);
	const rootIds = new Set(roots.map((r) => r.id));
	const children = tipeItems.filter(
		(i) => i.parentId != null && rootIds.has(i.parentId),
	);
	return children.length > 0 ? children : roots;
}

function sumRealisasi(items: ApbdesItemRaw[], tipe: string): number {
	return items
		.filter((i) => i.tipe?.toLowerCase() === tipe.toLowerCase())
		.reduce(
			(sum, i) =>
				sum + (i.realisasiItems ?? []).reduce((s, r) => s + (r.jumlah ?? 0), 0),
			0,
		);
}

export function mapKeuanganEntry(entry: ApbdesEntryRaw): KeuanganYear {
	const items = entry.items ?? [];
	const tahun = entry.tahun ?? 0;
	const name = entry.name ?? `APBDes Tahun ${tahun}`;

	// totalBudget: sum anggaran leaf pendapatan + pembiayaan (hindari pakai jumlah yg bisa "")
	const parentIds = new Set(
		items.map((i) => i.parentId).filter(Boolean) as string[],
	);
	const leaves = items.filter((i) => !parentIds.has(i.id));
	const totalBudget = leaves
		.filter((i) => {
			const t = i.tipe?.toLowerCase() ?? "";
			return t === "pendapatan" || t === "pembiayaan";
		})
		.reduce((sum, i) => sum + (i.anggaran ?? 0), 0);

	const totalIncomeReal = sumRealisasi(items, "pendapatan");
	const totalExpenseReal = sumRealisasi(items, "belanja");

	const realisasiPercent =
		totalBudget > 0 ? Math.round((totalExpenseReal / totalBudget) * 100) : 0;

	// Monthly: agregasi realisasiItems per bulan
	const monthlyRaw: KeuanganMonthly[] = Array.from({ length: 12 }, () => ({
		income: 0,
		expense: 0,
	}));
	for (const item of items) {
		const t = item.tipe?.toLowerCase() ?? "";
		if (t !== "pendapatan" && t !== "belanja") continue;
		for (const r of item.realisasiItems ?? []) {
			if (!r.tanggal) continue;
			const d = new Date(r.tanggal);
			const m = d.getMonth();
			if (Number.isNaN(m) || m < 0 || m > 11) continue;
			const slot = monthlyRaw[m];
			if (!slot) continue;
			if (t === "pendapatan") slot.income += r.jumlah ?? 0;
			else slot.expense += r.jumlah ?? 0;
		}
	}

	// Allocation: belanja per bidang (children-of-root)
	const allocationItems = getBreakdown(items, "belanja");
	const allocation: KeuanganAllocation[] = allocationItems.map((i) => ({
		sector: i.uraian ?? "",
		amount: i.anggaran ?? 0,
	}));

	// Report breakdown
	const incomeBreakdown = getBreakdown(items, "pendapatan");
	const expenseBreakdown = getBreakdown(items, "belanja");
	const report: KeuanganReport = {
		income: incomeBreakdown.map((i) => ({
			category: i.uraian ?? "",
			amount: i.anggaran ?? 0,
		})),
		expenses: expenseBreakdown.map((i) => ({
			category: i.uraian ?? "",
			amount: i.anggaran ?? 0,
		})),
		// Sengaja mismatch (pre-existing): baris = anggaran, total = realisasi
		// TODO(keuangan): samakan basis baris & total di pass terpisah — keputusan editorial milik user
		totalIncome: totalIncomeReal,
		totalExpense: totalExpenseReal,
	};

	// Aid: item yang uraian mengandung "bantuan" atau "hibah"
	const aid: KeuanganAid[] = items
		.filter(
			(i) =>
				i.uraian?.toLowerCase().includes("bantuan") ||
				i.uraian?.toLowerCase().includes("hibah"),
		)
		.map((i) => {
			const totalReal = (i.realisasiItems ?? []).reduce(
				(s, r) => s + (r.jumlah ?? 0),
				0,
			);
			return {
				source: i.uraian ?? "",
				amount: i.anggaran ?? 0,
				status: totalReal > 0 ? ("cair" as const) : ("proses" as const),
			};
		});

	return {
		id: entry.id,
		tahun,
		name,
		totalBudget,
		totalIncomeReal,
		totalExpenseReal,
		realisasiPercent,
		monthly: monthlyRaw,
		allocation,
		report,
		aid,
	};
}

/** Map array entries → KeuanganYear[], sorted tahun desc (terbaru dulu). */
export function mapKeuanganList(entries: ApbdesEntryRaw[]): KeuanganYear[] {
	return entries.map(mapKeuanganEntry).sort((a, b) => b.tahun - a.tahun);
}
