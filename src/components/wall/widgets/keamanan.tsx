import { Stack, Text } from "@mantine/core";
import type { WallKeamanan } from "@/types/wall";
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

/** Status laporan keamanan. Slice yang sebelumnya nganggur. */
export function KeamananStatusBody({ data }: { data: WallKeamanan }) {
	return (
		<Stack gap="sm">
			<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
				Total laporan: {data.total}
			</Text>
			{ITEMS.map((item) => (
				<div
					key={item.key}
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "baseline",
					}}
				>
					<Text style={{ color: WALL_THEME.TEXT }}>{item.label}</Text>
					<Text fw={800} style={{ fontSize: 28, color: item.color }}>
						{data[item.key]}
					</Text>
				</div>
			))}
		</Stack>
	);
}
