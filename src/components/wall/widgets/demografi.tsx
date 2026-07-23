import { BarChart } from "@mantine/charts";
import { Group, Stack, Text } from "@mantine/core";
import type { WallDemografi } from "@/types/wall";
import { DonutBody } from "../donut-body";
import { HorizontalBar } from "../horizontal-bar";
import { StatRow } from "../stat-row";
import { WALL_CATEGORICAL, WALL_THEME } from "../wall-theme";

function toDonut(rows: Array<{ label: string; count: number }>) {
	return rows.map((r, i) => ({
		name: r.label,
		value: r.count,
		color: WALL_CATEGORICAL[i % WALL_CATEGORICAL.length] ?? WALL_THEME.ACCENT,
	}));
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

/** Sebaran agama (donut besar + legenda). Slice yang sebelumnya nganggur. */
export function DemografiReligionBody({
	data,
}: {
	data: WallDemografi["religion"];
}) {
	return <DonutBody data={toDonut(data)} unit="jiwa" />;
}

/** Pekerjaan teratas (bar horizontal). Slice yang sebelumnya nganggur. */
export function DemografiOccupationBody({
	data,
}: {
	data: WallDemografi["occupationTop"];
}) {
	const rows = data.map((o) => ({ label: o.label, count: o.count }));
	return (
		<HorizontalBar
			data={rows}
			dataKey="label"
			valueKey="count"
			color={WALL_THEME.OK}
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
export function DemografiStatsBody({ data }: { data: WallDemografi["stats"] }) {
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

const DINAMIKA_ITEMS: Array<{
	key: "births" | "deaths" | "moveIn" | "moveOut";
	label: string;
	color: string;
}> = [
	{ key: "births", label: "Kelahiran", color: WALL_THEME.OK },
	{ key: "deaths", label: "Kematian", color: WALL_THEME.DANGER },
	{ key: "moveIn", label: "Pindah Masuk", color: WALL_THEME.ACCENT },
	{ key: "moveOut", label: "Pindah Keluar", color: WALL_THEME.WARN },
];

/** Dinamika penduduk: kelahiran/kematian/pindah masuk/keluar tahun berjalan. */
export function DemografiDinamikaBody({
	data,
}: {
	data: WallDemografi["dinamika"];
}) {
	const max = Math.max(...DINAMIKA_ITEMS.map((i) => data[i.key]), 1);
	return (
		<Stack gap="md" style={{ height: "100%" }} justify="center">
			{DINAMIKA_ITEMS.map((item) => (
				<StatRow
					key={item.key}
					label={item.label}
					value={data[item.key]}
					color={item.color}
					fraction={data[item.key] / max}
				/>
			))}
		</Stack>
	);
}

/** Data per banjar: tabel penduduk/KK/miskin, 5 terpadat (sort di mapBanjar). */
export function DemografiBanjarBody({
	data,
}: {
	data: WallDemografi["banjar"];
}) {
	return (
		<Stack gap={4} style={{ height: "100%", overflow: "hidden" }}>
			<Group
				gap="xs"
				wrap="nowrap"
				style={{
					paddingBottom: 4,
					borderBottom: `1px solid ${WALL_THEME.TRACK}`,
				}}
			>
				<Text
					size="xs"
					fw={700}
					style={{ flex: 1, minWidth: 0, color: WALL_THEME.TEXT_DIM }}
				>
					Banjar
				</Text>
				<Text
					size="xs"
					fw={700}
					style={{ width: 70, textAlign: "right", color: WALL_THEME.TEXT_DIM }}
				>
					Penduduk
				</Text>
				<Text
					size="xs"
					fw={700}
					style={{ width: 44, textAlign: "right", color: WALL_THEME.TEXT_DIM }}
				>
					KK
				</Text>
				<Text
					size="xs"
					fw={700}
					style={{ width: 52, textAlign: "right", color: WALL_THEME.WARN }}
				>
					Miskin
				</Text>
			</Group>
			{data.map((b) => (
				<Group key={b.name} gap="xs" wrap="nowrap">
					<Text
						size="sm"
						style={{
							flex: 1,
							minWidth: 0,
							color: WALL_THEME.TEXT,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{b.name}
					</Text>
					<Text
						size="sm"
						style={{ width: 70, textAlign: "right", color: WALL_THEME.TEXT }}
					>
						{b.population.toLocaleString("id-ID")}
					</Text>
					<Text
						size="sm"
						style={{
							width: 44,
							textAlign: "right",
							color: WALL_THEME.TEXT_DIM,
						}}
					>
						{b.kk.toLocaleString("id-ID")}
					</Text>
					<Text
						size="sm"
						fw={700}
						style={{ width: 52, textAlign: "right", color: WALL_THEME.WARN }}
					>
						{b.poor.toLocaleString("id-ID")}
					</Text>
				</Group>
			))}
		</Stack>
	);
}

/** Sektor unggulan desa (bar horizontal), 5 teratas (sort di mapSectors). Sumber: Desa API. */
export function DemografiSectorsBody({
	data,
}: {
	data: WallDemografi["sectors"];
}) {
	const rows = data.map((s) => ({ label: s.label, value: s.value }));
	return (
		<HorizontalBar
			data={rows}
			dataKey="label"
			valueKey="value"
			color={WALL_THEME.ACCENT}
		/>
	);
}
