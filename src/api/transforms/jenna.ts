import type { WallJenna } from "@/types/wall";

/**
 * Raw payload dari NOC/Jenna `/api/noc/jenna/analytics`. Bentuk sama dengan
 * yang dipakai halaman `/jenna-analytic` (JennaAnalyticsData). Semua field
 * opsional — transform di bawah null-safe supaya panel tetap render walau
 * sebagian data hilang.
 */
export interface JennaAnalyticsRaw {
	stats?: {
		interaksiHariIni?: number;
		changeFromYesterday?: number;
		jawabanOtomatis?: number;
		jawabanOtomatisCount?: number;
		waktuRespon?: string;
		belumDitindak?: number;
	};
	chartMingguan?: Array<{ day?: string; count?: number | string }>;
	topTopics?: Array<{ topic?: string; count?: number | string }>;
	jamTersibuk?: Array<{ slot?: string; pct?: number | string }>;
}

/** Paksa nilai apa pun ke number berhingga; selain itu 0. */
function num(v: unknown): number {
	const n = typeof v === "string" ? Number(v) : (v as number);
	return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

/** Map `.stats` Jenna → WallJenna["kpi"]. Null-safe, default 0/"—". */
export function mapJennaKpi(
	raw: JennaAnalyticsRaw | null | undefined,
): WallJenna["kpi"] {
	const s = raw?.stats;
	return {
		interaksiHariIni: num(s?.interaksiHariIni),
		changeFromYesterday: num(s?.changeFromYesterday),
		jawabanOtomatis: num(s?.jawabanOtomatis),
		belumDitindak: num(s?.belumDitindak),
		waktuRespon:
			typeof s?.waktuRespon === "string" && s.waktuRespon.length > 0
				? s.waktuRespon
				: "—",
	};
}

/** Map `chartMingguan` → deret bar mingguan. Buang entri tanpa label. */
export function mapJennaMingguan(
	rows: JennaAnalyticsRaw["chartMingguan"] | null | undefined,
): WallJenna["mingguan"] {
	if (!Array.isArray(rows)) return [];
	return rows
		.filter((r): r is { day: string; count?: number | string } =>
			Boolean(r?.day),
		)
		.map((r) => ({ day: String(r.day), count: num(r.count) }));
}

/** Map `topTopics` → daftar topik. Buang entri tanpa topik. */
export function mapJennaTopik(
	rows: JennaAnalyticsRaw["topTopics"] | null | undefined,
): WallJenna["topik"] {
	if (!Array.isArray(rows)) return [];
	return rows
		.filter((r): r is { topic: string; count?: number | string } =>
			Boolean(r?.topic),
		)
		.map((r) => ({ topic: String(r.topic), count: num(r.count) }));
}

/** Map `jamTersibuk` → distribusi slot. Persen di-clamp 0..100. */
export function mapJennaJamSibuk(
	rows: JennaAnalyticsRaw["jamTersibuk"] | null | undefined,
): WallJenna["jamSibuk"] {
	if (!Array.isArray(rows)) return [];
	return rows
		.filter((r): r is { slot: string; pct?: number | string } =>
			Boolean(r?.slot),
		)
		.map((r) => ({
			slot: String(r.slot),
			pct: Math.max(0, Math.min(100, num(r.pct))),
		}));
}

/** Rakit seluruh slice WallJenna dari payload mentah. */
export function mapJenna(raw: JennaAnalyticsRaw | null | undefined): WallJenna {
	return {
		kpi: mapJennaKpi(raw),
		mingguan: mapJennaMingguan(raw?.chartMingguan),
		topik: mapJennaTopik(raw?.topTopics),
		jamSibuk: mapJennaJamSibuk(raw?.jamTersibuk),
	};
}
