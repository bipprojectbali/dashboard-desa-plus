/**
 * Transform murni untuk data APBDes multi-tahun.
 * Dipisah dari noc.ts agar bisa dipakai lintas modul dan di-test.
 */

import { CHART } from "@/theme";

export interface ApbdesItemRaw {
	id: string;
	kode?: string;
	uraian?: string;
	anggaran?: number;
	tipe?: string;
	level?: number;
	parentId?: string | null;
	realisasiItems?: { jumlah?: number; tanggal?: string }[];
}

export interface ApbdesEntryRaw {
	id: string;
	tahun?: number;
	name?: string;
	items?: ApbdesItemRaw[];
}

export interface ApbdesCategory {
	category: string;
	anggaran: number;
	realisasi: number;
	percentage: number;
	color: string;
}

export interface ApbdesYear {
	id: string;
	tahun: number;
	name: string;
	title: string;
	data: ApbdesCategory[];
}

const colorMap: Record<string, string> = {
	pendapatan: CHART.green,
	belanja: CHART.blue,
	pembiayaan: CHART.amber,
};

export function mapApbdesEntry(entry: ApbdesEntryRaw): ApbdesYear {
	const items = entry.items ?? [];
	const tahun = entry.tahun ?? 0;
	const name = entry.name ?? `APBDes Tahun ${tahun}`;
	const title = `Realisasi ${name}`;

	// Leaf-based: item yang tidak menjadi parentId item lain
	const parentIds = new Set(
		items.map((i) => i.parentId).filter(Boolean) as string[],
	);
	const leaves = items.filter((i) => !parentIds.has(i.id));

	const grouped: Record<string, { anggaran: number; realisasi: number }> = {};
	for (const item of leaves) {
		const tipe = item.tipe?.toLowerCase() ?? "lainnya";
		if (tipe === "lainnya") continue;
		if (!grouped[tipe]) grouped[tipe] = { anggaran: 0, realisasi: 0 };
		grouped[tipe].anggaran += item.anggaran ?? 0;
		grouped[tipe].realisasi += (item.realisasiItems ?? []).reduce(
			(acc, r) => acc + (r.jumlah ?? 0),
			0,
		);
	}

	const data: ApbdesCategory[] = Object.entries(grouped).map(
		([tipe, stats]) => ({
			category: tipe.charAt(0).toUpperCase() + tipe.slice(1),
			anggaran: stats.anggaran,
			realisasi: stats.realisasi,
			percentage:
				stats.anggaran > 0 ? (stats.realisasi / stats.anggaran) * 100 : 0,
			color: colorMap[tipe] ?? "#6B7280",
		}),
	);

	return { id: entry.id, tahun, name, title, data };
}

/** Map array entries → ApbdesYear[], sorted by tahun desc (terbaru dulu). */
export function mapApbdesList(entries: ApbdesEntryRaw[]): ApbdesYear[] {
	return entries.map(mapApbdesEntry).sort((a, b) => b.tahun - a.tahun);
}
