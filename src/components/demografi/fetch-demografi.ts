import { apiClient } from "@/utils/api-client";
import type { DemografiAll } from "./demografi.types";

// Mengambil 9 endpoint demografi sekaligus dengan Promise.allSettled agar tahan
// terhadap kegagalan sebagian — hasil digabung ke satu objek untuk cache.
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

	const results = await Promise.allSettled([
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

	const getVal = (index: number) => {
		const res = results[index];
		if (!res) return { data: null, error: "Result not found" };
		if (res.status === "fulfilled") return res.value;
		const reason = (res as PromiseRejectedResult).reason;
		console.error(`❌ Request ${index} failed:`, reason);
		return { data: null, error: reason };
	};

	const summaryRes = getVal(0);
	const banjarRes = getVal(1);
	const ageRes = getVal(2);
	const jobRes = getVal(3);
	const religionRes = getVal(4);
	const birthsRes = getVal(5);
	const deathsRes = getVal(6);
	const migrationRes = getVal(7);
	const sectorRes = getVal(8);

	const parseRes = (res: any, name: string) => {
		if (!res || !res.data) return null;
		if (!res.data.success) {
			console.warn(`⚠️ Failed to fetch ${name}:`, res.data.error || res.error);
			return null;
		}
		if (!res.data.data) return null;
		return res.data.data;
	};

	// Parse Dashboard Summary
	const summaryData = parseRes(summaryRes, "Dashboard Summary");
	if (summaryData) {
		const s = summaryData.summary || {};
		result.stats = {
			total: s.totalPenduduk || summaryData.total || 0,
			heads: s.totalKK || summaryData.heads || 0,
			poor: s.totalKemiskinan || summaryData.poor || 0,
		};

		const d = summaryData.dinamika || {};
		if (d.kelahiran !== undefined) result.births = d.kelahiran;
		if (d.kematian !== undefined) result.deaths = d.kematian;
		if (d.pindahMasuk !== undefined) {
			const inCount = Array.isArray(d.pindahMasuk)
				? d.pindahMasuk.length
				: d.pindahMasuk;
			result.moveIn = Number(inCount) || 0;
		}
		if (d.pindahKeluar !== undefined) {
			const outCount = Array.isArray(d.pindahKeluar)
				? d.pindahKeluar.length
				: d.pindahKeluar;
			result.moveOut = Number(outCount) || 0;
		}
	}

	// Parse Banjar Data
	const banjarList = parseRes(banjarRes, "Banjar Data");
	if (banjarList && Array.isArray(banjarList)) {
		result.banjarData = banjarList.slice(0, 10).map((b: any) => ({
			id: b.id || b._id || String(Math.random()),
			name: b.nama || b.name || "Unknown",
			totalPopulation: b.penduduk || b.totalPopulation || 0,
			totalKK: b.kk || b.totalKK || 0,
			totalPoor: b.miskin || b.totalPoor || 0,
		}));
	}

	// Parse Age Distribution
	const ageList = parseRes(ageRes, "Age Distribution");
	if (ageList && Array.isArray(ageList)) {
		result.ageData = ageList.map((a: any) => ({
			ageRange:
				a.rentangUmur || a.range || a.ageRange || a.kelompokUmur || "Unknown",
			total: Number(a.jumlah || a.total || a.count || 0),
		}));
	}

	// Parse Occupation Data
	const jobList = parseRes(jobRes, "Occupation Data");
	if (jobList && Array.isArray(jobList)) {
		result.jobData = jobList.map((j: any) => ({
			job: j.pekerjaan || j.namaPekerjaan || j.job || "Lainnya",
			total: Number(
				j.jumlah ||
					j.total ||
					j.count ||
					Number(j.lakiLaki || 0) + Number(j.perempuan || 0) ||
					0,
			),
		}));
	}

	// Parse Religion Distribution — simpan baris mentah (semua tahun); grouping,
	// filter tahun, & normalisasi label dilakukan di komponen agar dropdown tahun
	// bisa ganti tanpa refetch.
	const religionList = parseRes(religionRes, "Religion Distribution");
	if (religionList && Array.isArray(religionList)) {
		result.religionRows = religionList as RawReligionRow[];
	}

	// Parse Births
	const birthsList = parseRes(birthsRes, "Births Data");
	if (birthsList && Array.isArray(birthsList)) {
		result.births = birthsList.length;
	}

	// Parse Deaths
	const deathsList = parseRes(deathsRes, "Deaths Data");
	if (deathsList && Array.isArray(deathsList)) {
		result.deaths = deathsList.length;
	}

	// Parse Migration
	const migrationList = parseRes(migrationRes, "Migration Data");
	if (migrationList && Array.isArray(migrationList)) {
		result.moveIn = migrationList.filter(
			(m: any) =>
				m.jenis === "MASUK" ||
				m.jenis === "masuk" ||
				m.type === "in" ||
				m.arah === "masuk",
		).length;
		result.moveOut = migrationList.filter(
			(m: any) =>
				m.jenis === "KELUAR" ||
				m.jenis === "keluar" ||
				m.type === "out" ||
				m.arah === "keluar",
		).length;
	}

	// Parse Sector Data
	let sectorList = parseRes(sectorRes, "Sector Data");
	if (sectorList) {
		if (!Array.isArray(sectorList) && typeof sectorList === "object") {
			const possibleArray =
				sectorList.data ||
				sectorList.list ||
				sectorList.sectors ||
				sectorList.items;
			if (Array.isArray(possibleArray)) sectorList = possibleArray;
		}
		if (Array.isArray(sectorList)) {
			result.sektorData = sectorList.map((s: any) => ({
				sektor:
					s.name ||
					s.nama ||
					s.sektor ||
					s.sektorUnggulan ||
					s.sektor_unggulan ||
					s.namaSektor ||
					"Unknown",
				value: Number(
					s.value ?? s.nilai ?? s.jumlah ?? s.total ?? s.count ?? 0,
				),
			}));
		}
	}

	return result;
}
