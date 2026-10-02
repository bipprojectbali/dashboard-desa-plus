import type { RawReligionRow } from "@/api/transforms/religion";

// Data Interfaces
export interface AgeData {
	ageRange: string;
	total: number;
}

export interface JobData {
	job: string;
	total: number;
}

export interface ReligionData {
	name: string;
	value: number;
	color: string;
}

export interface BanjarData {
	id: string;
	name: string;
	totalPopulation: number;
	totalKK: number;
	totalPoor: number;
}

export interface SectorData {
	sektor: string;
	value: number;
}

export interface DashboardSummary {
	total: number;
	heads: number;
	poor: number;
}

export interface DemografiAll {
	stats: DashboardSummary;
	ageData: AgeData[];
	jobData: JobData[];
	religionRows: RawReligionRow[];
	banjarData: BanjarData[];
	sektorData: SectorData[];
	births: number;
	deaths: number;
	moveIn: number;
	moveOut: number;
}

export const EMPTY_DEMOGRAFI: DemografiAll = {
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
