/**
 * Transform murni untuk data divisi NOC. Dipisah dari noc.ts agar bisa
 * dipakai di wall-snapshot builder tanpa import Elysia/route.
 */

/** Warna statis per nama divisi (NOC external tidak kirim color). */
export const DIVISION_COLOR_MAP: Record<string, string> = {
	Pemerintahan: "#3B82F6",
	Pembangunan: "#10B981",
	Kemasyarakatan: "#F59E0B",
	Pemberdayaan: "#8B5CF6",
	"Kesejahteraan Sosial": "#EC4899",
	"Keamanan & Ketertiban": "#EF4444",
	"Adat & Budaya": "#F97316",
};

export const DIVISION_COLOR_FALLBACK = "#6B7280";

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
