import { Group, Stack, Text } from "@mantine/core";
import type { WallKeamanan } from "@/types/wall";
import { StatRow } from "../stat-row";
import { WALL_THEME } from "../wall-theme";

const ITEMS: Array<{
	key: "baru" | "diproses" | "selesai";
	label: string;
	color: string;
}> = [
	{ key: "baru", label: "Baru", color: WALL_THEME.WARN },
	{ key: "diproses", label: "Diproses", color: WALL_THEME.ACCENT },
	{ key: "selesai", label: "Selesai", color: WALL_THEME.OK },
];

/** Status laporan keamanan: total + bar proporsi + laju penanganan. */
export function KeamananStatusBody({ data }: { data: WallKeamanan }) {
	const total = data.total || 0;
	const outstanding = data.baru + data.diproses;
	return (
		<Stack gap="md" justify="space-between" style={{ height: "100%" }}>
			<Stack gap="md">
				{ITEMS.map((item) => (
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
					Total {total} · Perlu tindak lanjut
				</Text>
				<Text
					fw={800}
					style={{
						fontSize: 20,
						color: outstanding > 0 ? WALL_THEME.WARN : WALL_THEME.OK,
					}}
				>
					{outstanding}
				</Text>
			</Group>
		</Stack>
	);
}
