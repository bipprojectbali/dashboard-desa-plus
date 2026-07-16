import { BarChart } from "@mantine/charts";
import { Stack } from "@mantine/core";
import type { WallKeuangan } from "@/types/wall";
import { DonutBody } from "../donut-body";
import { StatRow } from "../stat-row";
import { WALL_THEME } from "../wall-theme";

/** Warnai skor SDGs per ambang: hijau baik, biru cukup, oranye rendah. */
function scoreColor(score: number): string {
	if (score >= 80) return WALL_THEME.OK;
	if (score >= 60) return WALL_THEME.ACCENT;
	return WALL_THEME.WARN;
}

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

/** Kepuasan layanan versi Keuangan (donut besar + legenda). */
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
	return <DonutBody data={rows} />;
}

/** Skor SDGs: nilai 0–100 dgn bar progres berwarna per ambang. */
export function KeuanganSdgsBody({ data }: { data: WallKeuangan["sdgs"] }) {
	return (
		<Stack gap="sm" justify="center" style={{ height: "100%" }}>
			{data.slice(0, 6).map((s) => (
				<StatRow
					key={s.title}
					label={s.title}
					value={s.score.toFixed(1)}
					color={scoreColor(s.score)}
					fraction={s.score / 100}
				/>
			))}
		</Stack>
	);
}
