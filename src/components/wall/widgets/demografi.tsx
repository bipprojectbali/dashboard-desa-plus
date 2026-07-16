import { BarChart, DonutChart } from "@mantine/charts";
import { Stack, Text } from "@mantine/core";
import type { WallDemografi } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

const CATEGORICAL_COLORS = [
	WALL_THEME.ACCENT,
	WALL_THEME.WARN,
	WALL_THEME.OK,
	WALL_THEME.DANGER,
	WALL_THEME.TEXT_DIM,
];

function toDonut(rows: Array<{ label: string; count: number }>) {
	return rows.map((r, i) => ({
		name: r.label,
		value: r.count,
		color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length] ?? WALL_THEME.ACCENT,
	}));
}

/** Sebaran gender (donut). */
export function DemografiGenderBody({
	data,
}: {
	data: WallDemografi["gender"];
}) {
	return <DonutChart h="100%" data={toDonut(data)} withLabels />;
}

/** Kelompok umur (bar). */
export function DemografiAgeBody({
	data,
}: {
	data: WallDemografi["ageGroups"];
}) {
	const rows = data.map((a) => ({ range: a.range, count: a.count }));
	return (
		<BarChart
			h="100%"
			data={rows}
			dataKey="range"
			series={[{ name: "count", color: WALL_THEME.ACCENT }]}
			withLegend={false}
		/>
	);
}

/** Sebaran agama (donut). Slice yang sebelumnya nganggur. */
export function DemografiReligionBody({
	data,
}: {
	data: WallDemografi["religion"];
}) {
	return <DonutChart h="100%" data={toDonut(data)} withLabels />;
}

/** Pekerjaan teratas (bar horizontal). Slice yang sebelumnya nganggur. */
export function DemografiOccupationBody({
	data,
}: {
	data: WallDemografi["occupationTop"];
}) {
	const rows = data.map((o) => ({ label: o.label, count: o.count }));
	return (
		<BarChart
			h="100%"
			data={rows}
			dataKey="label"
			orientation="vertical"
			series={[{ name: "count", color: WALL_THEME.OK }]}
			withLegend={false}
		/>
	);
}

const STAT_ITEMS: Array<{
	key: "total" | "heads" | "poor";
	label: string;
	color: string;
}> = [
	{ key: "total", label: "Total penduduk", color: WALL_THEME.TEXT },
	{ key: "heads", label: "Kepala keluarga", color: WALL_THEME.ACCENT },
	{ key: "poor", label: "Keluarga miskin", color: WALL_THEME.WARN },
];

/** Ringkasan angka demografi. Slice yang sebelumnya nganggur. */
export function DemografiStatsBody({
	data,
}: {
	data: WallDemografi["stats"];
}) {
	return (
		<Stack gap="sm">
			{STAT_ITEMS.map((item) => (
				<div
					key={item.key}
					style={{ display: "flex", justifyContent: "space-between" }}
				>
					<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
						{item.label}
					</Text>
					<Text fw={800} style={{ fontSize: 24, color: item.color }}>
						{data[item.key]}
					</Text>
				</div>
			))}
		</Stack>
	);
}
