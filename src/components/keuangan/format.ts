/** Format rupiah ke juta/miliar singkat, misal 1.500.000 → "1,5jt", 1.500.000.000 → "1,5 M" */
export function formatM(val: number): string {
	const m = val / 1_000_000;
	if (m >= 1000)
		return `${(m / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
	return `${m.toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
}
