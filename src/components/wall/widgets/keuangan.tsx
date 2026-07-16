import { BarChart, DonutChart } from "@mantine/charts";
import { Stack, Text } from "@mantine/core";
import type { WallKeuangan } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

/** APBDes per kategori (bar). */
export function KeuanganApbdesBody({ data }: { data: WallKeuangan["apbdes"] }) {
	const rows = data.map((b) => ({ category: b.category, amount: b.amount }));
	return (
		<BarChart
			h="100%"
			data={rows}
			dataKey="category"
			series={[{ name: "amount", color: WALL_THEME.ACCENT }]}
			withLegend={false}
		/>
	);
}

/** Kepuasan layanan versi Keuangan (donut). */
export function KeuanganKepuasanBody({
	data,
}: {
	data: WallKeuangan["satisfaction"];
}) {
	const rows = data.map((s) => ({
		name: s.category,
		value: s.value,
		color: s.color,
	}));
	return <DonutChart h="100%" data={rows} withLabels />;
}

/** Skor SDGs (list). */
export function KeuanganSdgsBody({ data }: { data: WallKeuangan["sdgs"] }) {
	return (
		<Stack gap={8}>
			{data.slice(0, 8).map((s) => (
				<div
					key={s.title}
					style={{ display: "flex", justifyContent: "space-between" }}
				>
					<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
						{s.title}
					</Text>
					<Text size="sm" fw={700} style={{ color: WALL_THEME.ACCENT }}>
						{s.score}
					</Text>
				</div>
			))}
		</Stack>
	);
}
