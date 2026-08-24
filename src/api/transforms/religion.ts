/**
 * Transform distribusi agama.
 *
 * Data source (`/api/kependudukan/distribusiagama/find-many`) mengembalikan baris
 * mentah lintas tahun tanpa agregasi — bisa ada beberapa baris dengan agama sama
 * (mis. "LAINNYA") untuk tahun berbeda. Helper ini menormalkan label enum,
 * memfilter per tahun, dan menjumlahkan per agama supaya chart tidak menampilkan
 * slice ganda. "Lainnya" selalu diletakkan paling akhir (konvensi bucket "Others").
 */

export interface RawReligionRow {
	agama?: unknown;
	religion?: unknown;
	name?: unknown;
	jumlah?: unknown;
	value?: unknown;
	count?: unknown;
	tahun?: unknown;
	year?: unknown;
}

export interface ReligionSlice {
	/** Key ternormalisasi (uppercase, underscore), mis. `KRISTEN_PROTESTAN`. */
	key: string;
	/** Label tampilan, mis. `Kristen Protestan`. */
	label: string;
	count: number;
}

const OTHER_KEY = "LAINNYA";
const OTHER_LABEL = "Lainnya";

/**
 * Label tampilan untuk key agama. Mengikuti 6 agama resmi (Dukcapil):
 * Islam, Kristen (Protestan), Katolik, Hindu, Buddha, Konghucu.
 * Enum sumber pakai `KRISTEN_PROTESTAN` / `KRISTEN_KATOLIK` → dipendekkan
 * jadi "Kristen" / "Katolik" supaya tidak jadi 4 kategori terpisah.
 */
const RELIGION_LABELS: Record<string, string> = {
	HINDU: "Hindu",
	ISLAM: "Islam",
	KRISTEN_PROTESTAN: "Kristen",
	KRISTEN_KATOLIK: "Katolik",
	BUDDHA: "Buddha",
	KONGHUCU: "Konghucu",
	[OTHER_KEY]: OTHER_LABEL,
};

function asArray<T>(raw: unknown): T[] {
	return Array.isArray(raw) ? (raw as T[]) : [];
}

function firstDefined(...vals: unknown[]): unknown {
	for (const v of vals) {
		if (v !== undefined && v !== null && v !== "") return v;
	}
	return undefined;
}

function titleCase(s: string): string {
	return s
		.toLowerCase()
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function toNumber(v: unknown): number {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

/** Normalkan string agama mentah → `{ key, label }`. Kosong → bucket "Lainnya". */
export function normalizeReligion(raw: unknown): {
	key: string;
	label: string;
} {
	const s = String(raw ?? "").trim();
	if (!s) return { key: OTHER_KEY, label: OTHER_LABEL };
	const key = s.toUpperCase().replace(/[\s-]+/g, "_");
	return { key, label: RELIGION_LABELS[key] ?? titleCase(s) };
}

function rowAgama(row: RawReligionRow): string {
	return String(firstDefined(row.agama, row.religion, row.name) ?? "");
}

function rowCount(row: RawReligionRow): number {
	return toNumber(firstDefined(row.jumlah, row.value, row.count));
}

/** Tahun sebuah baris (`null` bila tidak ada / tidak valid). */
export function rowYear(row: RawReligionRow): number | null {
	const raw = firstDefined(row.tahun, row.year);
	if (raw === undefined) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}

/** Daftar tahun unik yang tersedia, urut menurun (terbaru dulu). */
export function religionYears(raw: unknown): number[] {
	const years = new Set<number>();
	for (const row of asArray<RawReligionRow>(raw)) {
		const y = rowYear(row);
		if (y !== null) years.add(y);
	}
	return [...years].sort((a, b) => b - a);
}

/**
 * Grouping distribusi agama → slice unik.
 * @param tahun bila diberikan, hanya baris tahun tsb yang diikutkan; `null`/undefined
 *   = ikutkan semua tahun (dijumlahkan per agama).
 */
export function groupReligion(
	raw: unknown,
	tahun?: number | null,
): ReligionSlice[] {
	const byKey = new Map<string, ReligionSlice>();

	for (const row of asArray<RawReligionRow>(raw)) {
		if (tahun != null && rowYear(row) !== tahun) continue;
		const { key, label } = normalizeReligion(rowAgama(row));
		const existing = byKey.get(key);
		if (existing) existing.count += rowCount(row);
		else byKey.set(key, { key, label, count: rowCount(row) });
	}

	return [...byKey.values()].sort((a, b) => {
		// "Lainnya" selalu di bawah, sisanya urut count menurun.
		if (a.key === OTHER_KEY) return 1;
		if (b.key === OTHER_KEY) return -1;
		return b.count - a.count;
	});
}
