import { Group, Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

interface StatusLightProps {
	label: string;
	ok: boolean;
	detail?: string;
}

/** Titik status hijau/merah + label — dot standar panel NOC. */
export function StatusLight({ label, ok, detail }: StatusLightProps) {
	const color = ok ? WALL_THEME.OK : WALL_THEME.DANGER;
	return (
		<Group gap={8} wrap="nowrap">
			<span
				style={{
					width: 10,
					height: 10,
					borderRadius: "50%",
					background: color,
					boxShadow: `0 0 8px ${color}`,
					flexShrink: 0,
				}}
			/>
			<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
				{label}
			</Text>
			{detail ? (
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					{detail}
				</Text>
			) : null}
		</Group>
	);
}
