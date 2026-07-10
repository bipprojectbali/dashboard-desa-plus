import { RingProgress, Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

interface GaugeProps {
	label: string;
	value: number; // 0-100
}

/** Warna gauge naik dari OK → WARN → DANGER sesuai beban. */
function gaugeColor(value: number): string {
	if (value >= 85) return WALL_THEME.DANGER;
	if (value >= 60) return WALL_THEME.WARN;
	return WALL_THEME.OK;
}

/** Ring gauge untuk metrik persen (CPU/MEM/DISK). */
export function Gauge({ label, value }: GaugeProps) {
	const clamped = Math.max(0, Math.min(100, Math.round(value)));
	return (
		<RingProgress
			size={110}
			thickness={10}
			roundCaps
			sections={[{ value: clamped, color: gaugeColor(clamped) }]}
			label={
				<div style={{ textAlign: "center" }}>
					<Text fw={700} style={{ fontSize: 20, color: WALL_THEME.TEXT }}>
						{clamped}%
					</Text>
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
						{label}
					</Text>
				</div>
			}
		/>
	);
}
