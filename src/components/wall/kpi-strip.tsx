import { SimpleGrid, Text } from "@mantine/core";
import type { WallKpi } from "@/types/wall";
import { WALL_THEME } from "./wall-theme";

interface KpiStripProps {
	kpi: WallKpi | null;
}

const KPI_ITEMS: Array<{ key: keyof WallKpi; label: string }> = [
	{ key: "residents", label: "Warga" },
	{ key: "umkm", label: "UMKM" },
	{ key: "complaints", label: "Pengaduan" },
	{ key: "activities", label: "Kegiatan" },
	{ key: "securityReports", label: "Laporan Keamanan" },
	{ key: "documents", label: "Dokumen" },
];

/** Strip 6 KPI count lintas domain. Fallback 0 saat slice null (no mock). */
export function KpiStrip({ kpi }: KpiStripProps) {
	return (
		<SimpleGrid cols={6} spacing="md">
			{KPI_ITEMS.map((item) => (
				<div
					key={item.key}
					style={{
						background: WALL_THEME.CARD,
						border: `1px solid ${WALL_THEME.BORDER}`,
						borderRadius: 12,
						padding: "14px 18px",
					}}
				>
					<Text
						fw={800}
						style={{ fontSize: 30, color: WALL_THEME.TEXT, lineHeight: 1.1 }}
					>
						{(kpi?.[item.key] ?? 0).toLocaleString("id-ID")}
					</Text>
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
						{item.label}
					</Text>
				</div>
			))}
		</SimpleGrid>
	);
}
