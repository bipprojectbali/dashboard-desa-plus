import { BarChart } from "@mantine/charts";
import { Group, Stack, Text } from "@mantine/core";
import type { WallDivisi } from "@/types/wall";
import { StatRow } from "../stat-row";
import { WALL_THEME } from "../wall-theme";

/** Kinerja divisi: total kegiatan + breakdown status dgn bar proporsi. */
export function DivisiKinerjaBody({
	data,
}: {
	data: WallDivisi["activities"];
}) {
	const total = data.total || 0;
	const rows = [
		["Selesai", data.counts.selesai, WALL_THEME.OK],
		["Berjalan", data.counts.berjalan, WALL_THEME.ACCENT],
		["Tertunda", data.counts.tertunda, WALL_THEME.WARN],
		["Dibatalkan", data.counts.dibatalkan, WALL_THEME.DANGER],
	] as const;
	const rate = total > 0 ? Math.round((data.counts.selesai / total) * 100) : 0;
	return (
		<Stack gap="md" justify="space-between" style={{ height: "100%" }}>
			<Stack gap="md">
				{rows.map(([label, count, color]) => (
					<StatRow
						key={label}
						label={label}
						value={count}
						color={color}
						fraction={total > 0 ? count / total : 0}
					/>
				))}
			</Stack>
			<Group justify="space-between" align="baseline">
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					{total} kegiatan · Rampung
				</Text>
				<Text fw={800} style={{ fontSize: 20, color: WALL_THEME.OK }}>
					{rate}%
				</Text>
			</Group>
		</Stack>
	);
}

/** Dokumen per jenis (bar). Slice yang sebelumnya nganggur. */
export function DivisiDocumentsBody({
	data,
}: {
	data: WallDivisi["documents"];
}) {
	const rows = data.map((d) => ({ name: d.name, jumlah: d.jumlah }));
	return (
		<BarChart
			h="100%"
			data={rows}
			dataKey="name"
			orientation="vertical"
			series={[{ name: "jumlah", color: WALL_THEME.ACCENT }]}
			withLegend={false}
		/>
	);
}
