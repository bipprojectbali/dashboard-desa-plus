/**
 * Transform murni untuk data divisi NOC. Dipisah dari noc.ts agar bisa
 * dipakai di wall-snapshot builder tanpa import Elysia/route.
 */

import { CHART } from "@/theme";

/** Warna statis per nama divisi (NOC external tidak kirim color). */
export const DIVISION_COLOR_MAP: Record<string, string> = {
	Pemerintahan: CHART.blue,
	Pembangunan: CHART.green,
	Kemasyarakatan: CHART.amber,
	Pemberdayaan: CHART.violet,
	"Kesejahteraan Sosial": CHART.pink,
	"Keamanan & Ketertiban": CHART.red,
	"Adat & Budaya": CHART.orange,
};

export const DIVISION_COLOR_FALLBACK = CHART.gray;

export interface NocDivisionRaw {
	id: string;
	division: string;
	totalKegiatan: number;
}

export interface MappedDivision {
	id: string;
	name: string;
	activityCount: number;
	color: string;
}

/** Map raw NOC active-divisions response → MappedDivision[]. */
export function mapActiveDivisions(divisi: NocDivisionRaw[]): MappedDivision[] {
	return divisi.map((d) => ({
		id: d.id,
		name: d.division,
		activityCount: d.totalKegiatan,
		color: DIVISION_COLOR_MAP[d.division] ?? DIVISION_COLOR_FALLBACK,
	}));
}
