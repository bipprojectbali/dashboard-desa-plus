import { BarChart } from "@mantine/charts";

/** Lebar area label sumbu-Y untuk bar horizontal — cukup buat label sedang. */
const Y_AXIS_WIDTH = 120;
/** Batas karakter label sebelum dipotong ellipsis (hindari tabrak bar). */
const MAX_TICK_CHARS = 16;

function truncateTick(value: unknown): string {
	const s = String(value);
	return s.length > MAX_TICK_CHARS ? `${s.slice(0, MAX_TICK_CHARS - 1)}…` : s;
}

interface HorizontalBarProps {
	data: Array<Record<string, string | number>>;
	/** Key kategori (sumbu-Y). */
	dataKey: string;
	/** Key nilai + warnanya. */
	valueKey: string;
	color: string;
}

/**
 * Bar chart horizontal wall dgn label sumbu-Y yang aman: lebar tetap + truncate
 * ellipsis. Tanpa ini, label panjang (mis. jenis surat/pekerjaan) tumpah ke
 * area bar / keluar frame kartu. Dipakai Surat Layanan, Dokumen, Pekerjaan.
 */
export function HorizontalBar({
	data,
	dataKey,
	valueKey,
	color,
}: HorizontalBarProps) {
	return (
		<BarChart
			h="100%"
			data={data}
			dataKey={dataKey}
			orientation="vertical"
			series={[{ name: valueKey, color }]}
			withLegend={false}
			yAxisProps={{ width: Y_AXIS_WIDTH, tickFormatter: truncateTick }}
			barChartProps={{ margin: { left: 0, right: 12 } }}
		/>
	);
}
