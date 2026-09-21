import { DonutChart } from "@mantine/charts";
import { Stack, Text } from "@mantine/core";
import { MoreIndicator } from "./more-indicator";
import type { WidgetGeom } from "./wall-bento";
import { LIST_ITEM_COMPACT_PX, maxVisibleItems } from "./wall-item-cap";
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
	/** Geometri widget saat ini — dipakai menyusutkan chart & membatasi baris legenda. */
	geom?: WidgetGeom;
}

/**
 * Donut wall responsif: chart besar terpusat + label total di tengah +
 * legenda nilai & persentase di kanan. Mantine `DonutChart` ukurannya tetap
 * (tak ikut `h="100%"`), jadi tanpa ini donut mungil nyangkut di pojok dengan
 * ruang kartu kosong. Layout row biar mengisi lebar; legenda memberi konteks
 * angka yang tak terbaca dari busur saja.
 *
 * Chart & legenda menyesuaikan geometri: saat widget dikecilkan, chart
 * menyusut (bukan cuma legenda) dan baris legenda dibatasi sesuai tinggi slot
 * + indikator non-interaktif "+N lainnya" — data itu sendiri tak hilang,
 * tetap terwakili sebagai slice donut, hanya barisnya yang dipadatkan
 * (mirror pola {@link import("./wall-item-cap").maxVisibleItems} yang sudah
 * dipakai widget list lain).
 */
export function DonutBody({ data, unit, geom }: DonutBodyProps) {
	const total = data.reduce((sum, d) => sum + d.value, 0);
	const compact = (geom?.h ?? 1) <= 1 || (geom?.w ?? 1) <= 1;
	const chartSize = compact ? 130 : 200;
	const chartThickness = compact ? 20 : 34;
	// -1 mengkompensasi baris "Total ... unit" di bawah legenda (fixed, tak
	// dihitung formula maxVisibleItems yang hanya tahu tinggi card & item).
	const cap = maxVisibleItems(geom, LIST_ITEM_COMPACT_PX) - (unit ? 1 : 0);
	const visible = data.slice(0, Math.max(1, cap));
	const hiddenCount = data.length - visible.length;

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: compact ? 12 : 24,
				height: "100%",
				overflow: "hidden",
			}}
		>
			<DonutChart
				data={data}
				size={chartSize}
				thickness={chartThickness}
				withLabels={false}
				withTooltip={false}
				chartLabel={total.toLocaleString("id-ID")}
				paddingAngle={2}
				strokeWidth={0}
				style={{ flexShrink: 0 }}
			/>
			<Stack gap={compact ? 4 : "sm"} style={{ minWidth: compact ? 110 : 150 }}>
				{visible.map((d) => {
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
				<MoreIndicator count={hiddenCount} />
				{unit ? (
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
						Total {total.toLocaleString("id-ID")} {unit}
					</Text>
				) : null}
			</Stack>
		</div>
	);
}
