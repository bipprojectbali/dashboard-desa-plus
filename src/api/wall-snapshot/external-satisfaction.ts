import { TTL, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";

// TODO(wall): buildSatisfaction() belum di-wire ke wall-snapshot/index.ts —
// widget kepuasan masih pakai sumber lokal di build-keuangan.ts. Ganti ke
// builder ini agar angka wall == dashboard. Lihat MIND/SUMMARY/16-Jul-26/
// audit-sumber-data-wall-per-widget.md (transisi data lokal → API live).

/**
 * Kepuasan layanan untuk wall — SAMA sumber & cache key dengan dashboard
 * (`/api/dashboard/satisfaction-responden`) supaya angka wall == angka halaman.
 * Primary: agregasi responden NOC eksternal; fallback: tabel lokal.
 *
 * Cache key `dashboard:satisfaction:responden` sengaja identik dengan
 * dashboard.ts → hit cache yang sama, tak dobel fetch ke NOC.
 */

// Mirror RATING_COLOR_MAP di dashboard.ts (nama rating NOC → warna + urutan).
const RATING_COLOR_MAP: Record<string, { color: string; order: number }> = {
	"Sangat Baik": { color: "#10B981", order: 0 },
	Baik: { color: "#3B82F6", order: 1 },
	"Kurang Baik": { color: "#F59E0B", order: 2 },
	"Sangat Kurang Baik": { color: "#EF4444", order: 3 },
};

// Alias kategori seed lokal lama → nama NOC (mirror FALLBACK_CATEGORY_ALIAS
// di satisfaction-chart.tsx) supaya label fallback tetap konsisten.
const FALLBACK_CATEGORY_ALIAS: Record<string, string> = {
	"Sangat Puas": "Sangat Baik",
	Puas: "Baik",
	Cukup: "Kurang Baik",
	Kurang: "Sangat Kurang Baik",
};

export interface WallSatisfactionRow {
	category: string;
	value: number;
	color: string;
}

async function fetchRespondenAggregated(): Promise<WallSatisfactionRow[]> {
	return withCache(
		"dashboard:satisfaction:responden",
		TTL.DASHBOARD,
		async () => {
			const baseUrl =
				process.env.DESA_API_URL || "https://desa-darmasaba-stg.wibudev.com";
			const response = await fetch(
				`${baseUrl}/api/landingpage/responden/findMany`,
			);
			if (!response.ok) {
				throw new Error(`External API error: ${response.status}`);
			}
			const json = await response.json();
			if (!json.success || !Array.isArray(json.data)) {
				throw new Error("Invalid response from external API");
			}

			const counts: Record<string, number> = {};
			for (const r of json.data as Array<{ rating?: { name?: string } }>) {
				const name = r.rating?.name;
				if (name) counts[name] = (counts[name] ?? 0) + 1;
			}

			return Object.entries(RATING_COLOR_MAP)
				.filter(([apiName]) => counts[apiName])
				.sort((a, b) => a[1].order - b[1].order)
				.map(([apiName, mapping]) => ({
					category: apiName,
					value: counts[apiName] ?? 0,
					color: mapping.color,
				}));
		},
	);
}

/**
 * Kepuasan layanan: coba responden NOC dulu; kalau kosong/gagal, fallback ke
 * tabel lokal `satisfactionRating` (normalisasi kategori seed lama). Persis pola
 * `fetchSatisfaction` di satisfaction-chart.tsx.
 */
export async function buildSatisfaction(): Promise<WallSatisfactionRow[]> {
	try {
		const responden = await fetchRespondenAggregated();
		if (responden.length > 0) return responden;
	} catch {
		// jatuh ke fallback lokal
	}

	const local = await prisma.satisfactionRating.findMany({
		orderBy: { value: "desc" },
		select: { category: true, value: true, color: true },
	});
	return local.map((d) => ({
		category: FALLBACK_CATEGORY_ALIAS[d.category] ?? d.category,
		value: d.value,
		color: d.color,
	}));
}
