import { BarChart } from "@mantine/charts";
import { Stack, Text } from "@mantine/core";
import type { WallDivisi } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

/** Kinerja divisi: total kegiatan + breakdown status. */
export function DivisiKinerjaBody({
	data,
}: {
	data: WallDivisi["activities"];
}) {
	const rows = [
		["Selesai", data.counts.selesai, WALL_THEME.OK],
		["Berjalan", data.counts.berjalan, WALL_THEME.ACCENT],
		["Tertunda", data.counts.tertunda, WALL_THEME.WARN],
		["Dibatalkan", data.counts.dibatalkan, WALL_THEME.DANGER],
	] as const;
	return (
		<Stack gap={10}>
			<Text style={{ color: WALL_THEME.TEXT_DIM }} size="sm">
				Total kegiatan: {data.total}
			</Text>
			{rows.map(([label, count, color]) => (
				<div
					key={label}
					style={{ display: "flex", justifyContent: "space-between" }}
				>
					<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
						{label}
					</Text>
					<Text size="sm" fw={700} style={{ color }}>
						{count}
					</Text>
				</div>
			))}
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
