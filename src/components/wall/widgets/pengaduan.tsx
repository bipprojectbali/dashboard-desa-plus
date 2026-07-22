import { LineChart } from "@mantine/charts";
import { Group, Stack, Text } from "@mantine/core";
import type { WallPengaduan } from "@/types/wall";
import { HorizontalBar } from "../horizontal-bar";
import { StatRow } from "../stat-row";
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

/** Status pengaduan: total + bar proporsi per status (bukan angka telanjang). */
export function PengaduanStatusBody({
	data,
}: {
	data: WallPengaduan["stats"];
}) {
	const total = data.total || 0;
	const rate = total > 0 ? Math.round((data.selesai / total) * 100) : 0;
	return (
		<Stack gap="md" justify="space-between" style={{ height: "100%" }}>
			<Stack gap="md">
				{STATUS_ITEMS.map((item) => (
					<StatRow
						key={item.key}
						label={item.label}
						value={data[item.key]}
						color={item.color}
						fraction={total > 0 ? data[item.key] / total : 0}
					/>
				))}
			</Stack>
			<Group justify="space-between" align="baseline">
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					Total {total} · Tingkat penyelesaian
				</Text>
				<Text fw={800} style={{ fontSize: 20, color: WALL_THEME.OK }}>
					{rate}%
				</Text>
			</Group>
		</Stack>
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
		<HorizontalBar
			data={rows}
			dataKey="type"
			valueKey="count"
			color={WALL_THEME.OK}
		/>
	);
}
