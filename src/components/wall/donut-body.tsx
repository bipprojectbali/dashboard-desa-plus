import { DonutChart } from "@mantine/charts";
import { Stack, Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

export interface DonutDatum {
	name: string;
	value: number;
	color: string;
}

interface DonutBodyProps {
	data: DonutDatum[];
	/** Satuan untuk total di tengah (mis. "jiwa", "laporan"). */
	unit?: string;
}

/**
 * Donut wall responsif: chart besar terpusat + label total di tengah +
 * legenda nilai & persentase di kanan. Mantine `DonutChart` ukurannya tetap
 * (tak ikut `h="100%"`), jadi tanpa ini donut mungil nyangkut di pojok dengan
 * ruang kartu kosong. Layout row biar mengisi lebar; legenda memberi konteks
 * angka yang tak terbaca dari busur saja.
 */
export function DonutBody({ data, unit }: DonutBodyProps) {
	const total = data.reduce((sum, d) => sum + d.value, 0);
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 24,
				height: "100%",
				flexWrap: "wrap",
			}}
		>
			<DonutChart
				data={data}
				size={200}
				thickness={34}
				withLabels={false}
				withTooltip={false}
				chartLabel={total.toLocaleString("id-ID")}
				paddingAngle={2}
				strokeWidth={0}
			/>
			<Stack gap="sm" style={{ minWidth: 150 }}>
				{data.map((d) => {
					const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
					return (
						<div
							key={d.name}
							style={{ display: "flex", alignItems: "center", gap: 10 }}
						>
							<span
								style={{
									width: 12,
									height: 12,
									borderRadius: 3,
									background: d.color,
									flexShrink: 0,
								}}
							/>
							<Text
								size="sm"
								style={{
									color: WALL_THEME.TEXT,
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{d.name}
							</Text>
							<Text size="sm" fw={700} style={{ color: WALL_THEME.TEXT }}>
								{d.value.toLocaleString("id-ID")}
							</Text>
							<Text
								size="xs"
								style={{
									color: WALL_THEME.TEXT_DIM,
									width: 38,
									textAlign: "right",
								}}
							>
								{pct}%
							</Text>
						</div>
					);
				})}
				{unit ? (
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
						Total {total.toLocaleString("id-ID")} {unit}
					</Text>
				) : null}
			</Stack>
		</div>
	);
}
