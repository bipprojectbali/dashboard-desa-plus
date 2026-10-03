import type {
	AgeData,
	BanjarData,
	DashboardSummary,
	JobData,
	SectorData,
} from "./demografi.types";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
	typeof value === "object" && value !== null;

const asRecord = (value: unknown): UnknownRecord =>
	isRecord(value) ? value : {};

const asList = (value: unknown): unknown[] | null =>
	Array.isArray(value) ? value : null;

/** Setara rantai `a || b || c`: nilai truthy pertama, atau nilai terakhir. */
const firstTruthy = (...values: unknown[]): unknown =>
	values.find(Boolean) ?? values[values.length - 1];

/** Setara rantai `a ?? b ?? c`: nilai non-null pertama, atau nilai terakhir. */
const firstDefined = (...values: unknown[]): unknown =>
	values.find((v) => v !== null && v !== undefined) ??
	values[values.length - 1];

const toNumber = (value: unknown): number => Number(value) || 0;

const countOf = (value: unknown): number =>
	toNumber(Array.isArray(value) ? value.length : value);

/**
 * Ambil `data` dari respons `{ success, data }` endpoint demografi; `null` bila
 * respons kosong/gagal (gagal sebagian memang ditoleransi → fallback 0/[]).
 */
export function readDemografiPayload(response: unknown): unknown {
	const body = asRecord(response).data;
	if (!isRecord(body) || !body.success || !body.data) return null;
	return body.data;
}

export interface SummaryParseResult {
	stats: DashboardSummary;
	births?: number;
	deaths?: number;
	moveIn?: number;
	moveOut?: number;
}

/** Ringkasan dashboard + dinamika penduduk (field dinamika opsional). */
export function parseDemografiSummary(payload: unknown): SummaryParseResult {
	const data = asRecord(payload);
	const s = asRecord(data.summary);
	const d = asRecord(data.dinamika);
	const parsed: SummaryParseResult = {
		stats: {
			total: toNumber(firstTruthy(s.totalPenduduk, data.total, 0)),
			heads: toNumber(firstTruthy(s.totalKK, data.heads, 0)),
			poor: toNumber(firstTruthy(s.totalKemiskinan, data.poor, 0)),
		},
	};
	if (d.kelahiran !== undefined) parsed.births = toNumber(d.kelahiran);
	if (d.kematian !== undefined) parsed.deaths = toNumber(d.kematian);
	if (d.pindahMasuk !== undefined) parsed.moveIn = countOf(d.pindahMasuk);
	if (d.pindahKeluar !== undefined) parsed.moveOut = countOf(d.pindahKeluar);
	return parsed;
}

/** Maksimal 10 banjar pertama, nama field sumber bisa ID/EN. */
export function parseBanjarList(payload: unknown): BanjarData[] | null {
	const list = asList(payload);
	if (!list) return null;
	return list.slice(0, 10).map((item) => {
		const b = asRecord(item);
		const id = firstTruthy(b.id, b._id);
		return {
			id: id ? String(id) : String(Math.random()),
			name: String(firstTruthy(b.nama, b.name, "Unknown")),
			totalPopulation: toNumber(firstTruthy(b.penduduk, b.totalPopulation, 0)),
			totalKK: toNumber(firstTruthy(b.kk, b.totalKK, 0)),
			totalPoor: toNumber(firstTruthy(b.miskin, b.totalPoor, 0)),
		};
	});
}

/** Distribusi kelompok umur. */
export function parseAgeList(payload: unknown): AgeData[] | null {
	const list = asList(payload);
	if (!list) return null;
	return list.map((item) => {
		const a = asRecord(item);
		return {
			ageRange: String(
				firstTruthy(
					a.rentangUmur,
					a.range,
					a.ageRange,
					a.kelompokUmur,
					"Unknown",
				),
			),
			total: Number(firstTruthy(a.jumlah, a.total, a.count, 0)),
		};
	});
}

/** Distribusi pekerjaan; total jatuh ke laki-laki + perempuan bila tidak ada. */
export function parseJobList(payload: unknown): JobData[] | null {
	const list = asList(payload);
	if (!list) return null;
	return list.map((item) => {
		const j = asRecord(item);
		const byGender = toNumber(j.lakiLaki) + toNumber(j.perempuan);
		return {
			job: String(firstTruthy(j.pekerjaan, j.namaPekerjaan, j.job, "Lainnya")),
			total: Number(firstTruthy(j.jumlah, j.total, j.count, byGender, 0)),
		};
	});
}

const isMoveIn = (m: UnknownRecord) =>
	m.jenis === "MASUK" ||
	m.jenis === "masuk" ||
	m.type === "in" ||
	m.arah === "masuk";

const isMoveOut = (m: UnknownRecord) =>
	m.jenis === "KELUAR" ||
	m.jenis === "keluar" ||
	m.type === "out" ||
	m.arah === "keluar";

/** Hitung pindah masuk/keluar dari daftar mutasi. */
export function parseMigrationList(
	payload: unknown,
): { moveIn: number; moveOut: number } | null {
	const list = asList(payload);
	if (!list) return null;
	const rows = list.map(asRecord);
	return {
		moveIn: rows.filter(isMoveIn).length,
		moveOut: rows.filter(isMoveOut).length,
	};
}

/** Sektor unggulan; payload bisa array langsung atau dibungkus objek. */
export function parseSectorList(payload: unknown): SectorData[] | null {
	let list = asList(payload);
	if (!list && isRecord(payload)) {
		list = asList(
			firstTruthy(payload.data, payload.list, payload.sectors, payload.items),
		);
	}
	if (!list) return null;
	return list.map((item) => {
		const s = asRecord(item);
		return {
			sektor: String(
				firstTruthy(
					s.name,
					s.nama,
					s.sektor,
					s.sektorUnggulan,
					s.sektor_unggulan,
					s.namaSektor,
					"Unknown",
				),
			),
			value: Number(
				firstDefined(s.value, s.nilai, s.jumlah, s.total, s.count, 0),
			),
		};
	});
}
