import { BarChart, LineChart } from "@mantine/charts";
import { SimpleGrid, Text } from "@mantine/core";
import type { WallPengaduan } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

interface PengaduanSceneProps {
	data: WallPengaduan | null;
}

function Panel({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				background: WALL_THEME.CARD,
				border: `1px solid ${WALL_THEME.BORDER}`,
				borderRadius: 12,
				padding: 18,
			}}
		>
			<Text fw={700} mb="md" style={{ color: WALL_THEME.TEXT }}>
				{title}
			</Text>
			{children}
		</div>
	);
}

const STATUS_ITEMS: Array<{
	key: "baru" | "proses" | "selesai";
	label: string;
	color: string;
}> = [
	{ key: "baru", label: "Baru", color: WALL_THEME.WARN },
	{ key: "proses", label: "Diproses", color: WALL_THEME.ACCENT },
	{ key: "selesai", label: "Selesai", color: WALL_THEME.OK },
];

/** Scene pengaduan: status count, trend 7 bulan (line), surat per tipe (bar). */
export function PengaduanScene({ data }: PengaduanSceneProps) {
	const stats = data?.stats;
	const trend = data?.trend7m ?? [];
	const service = (data?.serviceByType ?? []).map((s) => ({
		type: s.letterType,
		count: s.count,
	}));

	return (
		<SimpleGrid cols={3} spacing="md" style={{ height: "100%" }}>
			<Panel title="Status Pengaduan">
				<SimpleGrid cols={1} spacing="sm">
					{STATUS_ITEMS.map((item) => (
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
								{stats?.[item.key] ?? 0}
							</Text>
						</div>
					))}
				</SimpleGrid>
			</Panel>

			<Panel title="Tren 7 Bulan">
				{trend.length > 0 ? (
					<LineChart
						h={300}
						data={trend}
						dataKey="month"
						series={[{ name: "count", color: WALL_THEME.ACCENT }]}
						curveType="monotone"
						withLegend={false}
					/>
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>

			<Panel title="Surat Layanan per Tipe">
				{service.length > 0 ? (
					<BarChart
						h={300}
						data={service}
						dataKey="type"
						orientation="vertical"
						series={[{ name: "count", color: WALL_THEME.OK }]}
						withLegend={false}
					/>
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>
		</SimpleGrid>
	);
}
