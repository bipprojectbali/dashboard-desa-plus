import { SimpleGrid, Text } from "@mantine/core";
import {
	IconBuildingStore,
	IconCalendarEvent,
	IconMessage2,
	IconShieldHalf,
	IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { WallKpi } from "@/types/wall";
import { WALL_THEME } from "./wall-theme";

interface KpiStripProps {
	kpi: WallKpi | null;
}

interface IconProps {
	size?: number;
	color?: string;
}

const KPI_ITEMS: Array<{
	key: keyof WallKpi;
	label: string;
	color: string;
	Icon: ComponentType<IconProps>;
}> = [
	{
		key: "residents",
		label: "Warga",
		color: WALL_THEME.ACCENT,
		Icon: IconUsers,
	},
	{
		key: "umkm",
		label: "UMKM",
		color: WALL_THEME.OK,
		Icon: IconBuildingStore,
	},
	{
		key: "complaints",
		label: "Pengaduan",
		color: WALL_THEME.WARN,
		Icon: IconMessage2,
	},
	{
		key: "activities",
		label: "Kegiatan",
		color: WALL_THEME.VIOLET,
		Icon: IconCalendarEvent,
	},
	{
		key: "securityReports",
		label: "Laporan Keamanan",
		color: WALL_THEME.INFO,
		Icon: IconShieldHalf,
	},
];

/**
 * Strip 6 KPI lintas domain. Tiap kartu: pita aksen kiri + ikon + angka besar,
 * warna berbeda per metrik agar cepat dipindai dari jarak jauh (TV). Fallback 0
 * saat slice null (no mock).
 */
export function KpiStrip({ kpi }: KpiStripProps) {
	return (
		<SimpleGrid cols={5} spacing="md">
			{KPI_ITEMS.map(({ key, label, color, Icon }) => (
				<div
					key={key}
					style={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						gap: 14,
						background: WALL_THEME.CARD,
						border: `1px solid ${WALL_THEME.BORDER}`,
						borderLeft: `3px solid ${color}`,
						borderRadius: 12,
						padding: "14px 18px",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 40,
							height: 40,
							borderRadius: 10,
							background: `${color}22`,
							flexShrink: 0,
						}}
					>
						<Icon size={22} color={color} />
					</div>
					<div style={{ minWidth: 0 }}>
						<Text
							fw={800}
							style={{ fontSize: 28, color: WALL_THEME.TEXT, lineHeight: 1.1 }}
						>
							{(kpi?.[key] ?? 0).toLocaleString("id-ID")}
						</Text>
						<Text
							size="xs"
							style={{
								color: WALL_THEME.TEXT_DIM,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{label}
						</Text>
					</div>
				</div>
			))}
		</SimpleGrid>
	);
}
