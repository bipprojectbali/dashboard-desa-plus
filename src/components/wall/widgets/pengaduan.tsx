import { BarChart, DonutChart, LineChart } from "@mantine/charts";
import { SimpleGrid, Text } from "@mantine/core";
import type { WallPengaduan } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

const STATUS_ITEMS: Array<{
	key: "baru" | "proses" | "selesai";
	label: string;
	color: string;
}> = [
	{ key: "baru", label: "Baru", color: WALL_THEME.WARN },
	{ key: "proses", label: "Diproses", color: WALL_THEME.ACCENT },
	{ key: "selesai", label: "Selesai", color: WALL_THEME.OK },
];

/** Status pengaduan (angka besar per status). */
export function PengaduanStatusBody({
	data,
}: {
	data: WallPengaduan["stats"];
}) {
	return (
		<SimpleGrid cols={1} spacing="sm">
			{STATUS_ITEMS.map((item) => (
				<div
					key={item.key}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "baseline",
					}}
				>
					<Text style={{ color: WALL_THEME.TEXT }}>{item.label}</Text>
					<Text fw={800} style={{ fontSize: 28, color: item.color }}>
						{data[item.key]}
					</Text>
				</div>
			))}
		</SimpleGrid>
	);
}

/** Tren pengaduan 7 bulan (line). */
export function PengaduanTrendBody({
	data,
}: {
	data: WallPengaduan["trend7m"];
}) {
	return (
		<LineChart
			h="100%"
			data={data}
			dataKey="month"
			series={[{ name: "count", color: WALL_THEME.ACCENT }]}
			curveType="monotone"
			withLegend={false}
		/>
	);
}

/** Surat layanan per tipe (bar horizontal). */
export function PengaduanServiceTypeBody({
	data,
}: {
	data: WallPengaduan["serviceByType"];
}) {
	const rows = data.map((s) => ({ type: s.letterType, count: s.count }));
	return (
		<BarChart
			h="100%"
			data={rows}
			dataKey="type"
			orientation="vertical"
			series={[{ name: "count", color: WALL_THEME.OK }]}
			withLegend={false}
		/>
	);
}

/** Kepuasan versi Pengaduan (donut) — sumber berbeda dari Keuangan. */
export function PengaduanKepuasanBody({
	data,
}: {
	data: WallPengaduan["kepuasan"];
}) {
	const rows = data.map((s) => ({
		name: s.category,
		value: s.value,
		color: s.color,
	}));
	return <DonutChart h="100%" data={rows} withLabels />;
}
