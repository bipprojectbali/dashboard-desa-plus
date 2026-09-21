import { RingProgress, Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

interface GaugeProps {
	label: string;
	value: number; // 0-100
	/** Diameter ring. Default 110 — perkecil agar 3 gauge muat sebaris tanpa wrap saat widget dipersempit. */
	size?: number;
	thickness?: number;
}

/** Warna gauge naik dari OK → WARN → DANGER sesuai beban. */
function gaugeColor(value: number): string {
	if (value >= 85) return WALL_THEME.DANGER;
	if (value >= 60) return WALL_THEME.WARN;
	return WALL_THEME.OK;
}

/** Ring gauge untuk metrik persen (CPU/MEM/DISK). */
export function Gauge({
	label,
	value,
	size = 110,
	thickness = 10,
}: GaugeProps) {
	const clamped = Math.max(0, Math.min(100, Math.round(value)));
	const compact = size < 90;
	return (
		<RingProgress
			size={size}
			thickness={thickness}
			roundCaps
			sections={[{ value: clamped, color: gaugeColor(clamped) }]}
			label={
				<div style={{ textAlign: "center" }}>
					<Text
						fw={700}
						style={{ fontSize: compact ? 15 : 20, color: WALL_THEME.TEXT }}
					>
						{clamped}%
					</Text>
					<Text
						style={{
							fontSize: compact ? 9 : 12,
							color: WALL_THEME.TEXT_DIM,
						}}
					>
						{label}
					</Text>
				</div>
			}
		/>
	);
}
