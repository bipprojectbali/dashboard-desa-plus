/** Label & warna badge status kesehatan. */
export interface HealthStatusBadge {
	label: string;
	color: string;
}

export const IBU_HAMIL_STATUS: Record<string, HealthStatusBadge> = {
	AKTIF: { label: "Aktif", color: "green" },
	NONAKTIF: { label: "Nonaktif", color: "gray" },
	MELAHIRKAN: { label: "Melahirkan", color: "blue" },
	KEGUGURAN: { label: "Keguguran", color: "red" },
};

export const STUNTING_STATUS: Record<string, HealthStatusBadge> = {
	NORMAL: { label: "Normal", color: "green" },
	ALERT: { label: "Alert", color: "orange" },
	STUNTING: { label: "Stunting", color: "red" },
};

/** Badge untuk kode status; kode tak dikenal tampil apa adanya berwarna abu-abu. */
export function resolveHealthStatus(
	map: Record<string, HealthStatusBadge>,
	code: string,
): HealthStatusBadge {
	return map[code] ?? { label: code, color: "gray" };
}

/** Tanggal ISO → format pendek id-ID; kosong → "—". */
export function fmtDate(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
