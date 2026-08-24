/**
 * Transform murni untuk data demografi dari Desa API → shape WallDemografi.
 * Dipakai bersama oleh route dashboard (demografi.ts) dan wall builder
 * (build-demografi.ts) supaya angka & bentuk identik (parity).
 *
 * Semua fungsi murni & toleran: bentuk item eksternal longgar (field bisa
 * bernama beda antar endpoint), jadi label & nilai di-resolve dengan fallback.
 * Tidak melempar — input non-array → hasil kosong/0.
 */
import type { WallDemografi } from "@/types/wall";
import { groupReligion, religionYears } from "./religion";

/** Ambil angka pertama yang terdefinisi dari daftar kandidat, else 0. */
function num(...cands: unknown[]): number {
	for (const c of cands) {
		if (c === null || c === undefined) continue;
		const n = Number(c);
		if (!Number.isNaN(n)) return n;
	}
	return 0;
}

/** Ambil string pertama yang non-kosong dari daftar kandidat, else fallback. */
function str(fallback: string, ...cands: unknown[]): string {
	for (const c of cands) {
		if (typeof c === "string" && c.trim() !== "") return c;
	}
	return fallback;
}

type Loose = Record<string, unknown>;

function asArray(input: unknown): Loose[] {
	return Array.isArray(input) ? (input as Loose[]) : [];
}

/**
 * Stats ringkasan penduduk dari payload /dashboard/summary.
 * Payload berbentuk { summary: { totalPenduduk, totalKK, totalKemiskinan } }.
 */
export function extractStats(summaryPayload: unknown): WallDemografi["stats"] {
	const p = (summaryPayload ?? {}) as Loose;
	const s = (p.summary ?? {}) as Loose;
	return {
		total: num(s.totalPenduduk, p.total),
		heads: num(s.totalKK, p.heads),
		poor: num(s.totalKemiskinan, p.poor),
	};
}

/**
 * Distribusi agama → { label, count }, ternormalisasi & digroup per agama.
 * Default menampilkan tahun terbaru saja supaya baris tahun lama tidak
 * bercampur (mis. beberapa "Lainnya" dari tahun berbeda). Tahun tak ada
 * → semua baris dijumlahkan per agama.
 */
export function mapReligion(raw: unknown): WallDemografi["religion"] {
	const latest = religionYears(raw)[0] ?? null;
	return groupReligion(raw, latest).map((s) => ({
		label: s.label,
		count: s.count,
	}));
}

/** Distribusi umur → { range, count }. */
export function mapAge(raw: unknown): WallDemografi["ageGroups"] {
	return asArray(raw).map((a) => ({
		range: str("-", a.rentangUmur, a.range, a.ageRange, a.kelompokUmur),
		count: num(a.jumlah, a.total, a.count),
	}));
}

/**
 * Data per banjar → { name, population, kk, poor }, sorted desc by populasi,
 * ambil `take` terpadat. Wall widget tinggi tetap → batasi agar tak overflow.
 */
export function mapBanjar(raw: unknown, take = 5): WallDemografi["banjar"] {
	return asArray(raw)
		.map((b) => ({
			name: str("-", b.nama, b.name),
			population: num(b.penduduk, b.totalPopulation),
			kk: num(b.kk, b.totalKK),
			poor: num(b.miskin, b.totalPoor),
		}))
		.sort((a, b) => b.population - a.population)
		.slice(0, take);
}

/**
 * Demografi pekerjaan → { label, count } (count = lakiLaki + perempuan), sorted
 * desc, ambil `take` teratas. Fallback ke field jumlah/total bila ada.
 */
export function mapOccupation(
	raw: unknown,
	take = 10,
): WallDemografi["occupationTop"] {
	return asArray(raw)
		.map((o) => ({
			label: str("Lainnya", o.pekerjaan, o.namaPekerjaan, o.job),
			count: num(
				o.jumlah,
				o.total,
				o.count,
				num(o.lakiLaki) + num(o.perempuan),
			),
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, take);
}

/**
 * Dinamika penduduk. Kelahiran/kematian dihitung dari panjang array
 * (endpoint kesehatan/kelahiran & kematian). Migrasi dipisah masuk/keluar
 * berdasarkan field `jenis` (MASUK/KELUAR), sama seperti halaman Demografi.
 */
export function countDinamika(args: {
	births: unknown;
	deaths: unknown;
	migration: unknown;
}): WallDemografi["dinamika"] {
	const migration = asArray(args.migration);
	const isIn = (m: Loose) => {
		const j = String(m.jenis ?? m.type ?? m.arah ?? "").toLowerCase();
		return j === "masuk" || j === "in";
	};
	const isOut = (m: Loose) => {
		const j = String(m.jenis ?? m.type ?? m.arah ?? "").toLowerCase();
		return j === "keluar" || j === "out";
	};
	return {
		births: asArray(args.births).length,
		deaths: asArray(args.deaths).length,
		moveIn: migration.filter(isIn).length,
		moveOut: migration.filter(isOut).length,
	};
}

/**
 * Sektor unggulan → { label, value }, sorted desc, ambil `take` teratas. Bar
 * chart wall tinggi tetap → banyak baris bikin tick label sumbu-Y ke-skip
 * Recharts (bar tampil, teks hilang); top-N menjaga semua label terbaca.
 */
export function mapSectors(raw: unknown, take = 5): WallDemografi["sectors"] {
	return asArray(raw)
		.map((s) => ({
			label: str("-", s.name, s.nama, s.sektor, s.sektorUnggulan, s.namaSektor),
			value: num(s.value, s.nilai, s.jumlah, s.total, s.count),
		}))
		.sort((a, b) => b.value - a.value)
		.slice(0, take);
}
