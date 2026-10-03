import type { RawReligionRow } from "@/api/transforms/religion";
import { apiClient } from "@/utils/api-client";
import type { DemografiAll } from "./demografi.types";
import {
	parseAgeList,
	parseBanjarList,
	parseDemografiSummary,
	parseJobList,
	parseMigrationList,
	parseSectorList,
	readDemografiPayload,
} from "./demografi-response.parse";

// Mengambil 9 endpoint demografi sekaligus dengan Promise.allSettled agar tahan
// terhadap kegagalan sebagian — endpoint yang gagal/kosong dibiarkan memakai
// nilai default (0/[]), hasil digabung ke satu objek untuk cache.
export async function fetchDemografiAll(): Promise<DemografiAll> {
	const result: DemografiAll = {
		stats: { total: 0, heads: 0, poor: 0 },
		ageData: [],
		jobData: [],
		religionRows: [],
		banjarData: [],
		sektorData: [],
		births: 0,
		deaths: 0,
		moveIn: 0,
		moveOut: 0,
	};

	const settled = await Promise.allSettled([
		apiClient.GET("/api/demografi/summary", {}),
		apiClient.GET("/api/demografi/banjar", {}),
		apiClient.GET("/api/demografi/age", {}),
		apiClient.GET("/api/demografi/occupation", {}),
		apiClient.GET("/api/demografi/religion", {}),
		apiClient.GET("/api/demografi/births", {}),
		apiClient.GET("/api/demografi/deaths", {}),
		apiClient.GET("/api/demografi/migration", {}),
		apiClient.GET("/api/demografi/sectors", {}),
	]);
	const [
		summary,
		banjar,
		age,
		occupation,
		religion,
		births,
		deaths,
		migration,
		sectors,
	] = settled.map((res) =>
		res.status === "fulfilled" ? readDemografiPayload(res.value) : null,
	);

	if (summary) {
		const parsed = parseDemografiSummary(summary);
		result.stats = parsed.stats;
		if (parsed.births !== undefined) result.births = parsed.births;
		if (parsed.deaths !== undefined) result.deaths = parsed.deaths;
		if (parsed.moveIn !== undefined) result.moveIn = parsed.moveIn;
		if (parsed.moveOut !== undefined) result.moveOut = parsed.moveOut;
	}

	result.banjarData = parseBanjarList(banjar) ?? result.banjarData;
	result.ageData = parseAgeList(age) ?? result.ageData;
	result.jobData = parseJobList(occupation) ?? result.jobData;

	// Simpan baris agama mentah (semua tahun); grouping, filter tahun, & normalisasi
	// label dilakukan di komponen agar dropdown tahun bisa ganti tanpa refetch.
	if (Array.isArray(religion)) {
		result.religionRows = religion as RawReligionRow[];
	}

	if (Array.isArray(births)) result.births = births.length;
	if (Array.isArray(deaths)) result.deaths = deaths.length;

	const moves = parseMigrationList(migration);
	if (moves) {
		result.moveIn = moves.moveIn;
		result.moveOut = moves.moveOut;
	}

	result.sektorData = parseSectorList(sectors) ?? result.sektorData;

	return result;
}
