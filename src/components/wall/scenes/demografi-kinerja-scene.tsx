import { BarChart, DonutChart } from "@mantine/charts";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import type { WallDemografi, WallDivisi } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

interface DemografiKinerjaSceneProps {
	demografi: WallDemografi | null;
	divisi: WallDivisi | null;
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

const GENDER_COLORS = [WALL_THEME.ACCENT, WALL_THEME.WARN, WALL_THEME.TEXT_DIM];

/** Scene gabungan: demografi (gender donut + umur bar) & kinerja divisi. */
export function DemografiKinerjaScene({
	demografi,
	divisi,
}: DemografiKinerjaSceneProps) {
	const gender = (demografi?.gender ?? []).map((g, i) => ({
		name: g.label,
		value: g.count,
		color: GENDER_COLORS[i % GENDER_COLORS.length] ?? WALL_THEME.ACCENT,
	}));
	const ageGroups = (demografi?.ageGroups ?? []).map((a) => ({
		range: a.range,
		count: a.count,
	}));
	const activities = divisi?.activities;

	return (
		<SimpleGrid cols={3} spacing="md" style={{ height: "100%" }}>
			<Panel title="Sebaran Gender">
				{gender.length > 0 ? (
					<DonutChart h={300} data={gender} withLabels />
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>

			<Panel title="Kelompok Umur">
				{ageGroups.length > 0 ? (
					<BarChart
						h={300}
						data={ageGroups}
						dataKey="range"
						series={[{ name: "count", color: WALL_THEME.ACCENT }]}
						withLegend={false}
					/>
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>

			<Panel title="Kinerja Divisi">
				<Stack gap={10}>
					<Text style={{ color: WALL_THEME.TEXT_DIM }} size="sm">
						Total kegiatan: {activities?.total ?? 0}
					</Text>
					{activities ? (
						(
							[
								["Selesai", activities.counts.selesai, WALL_THEME.OK],
								["Berjalan", activities.counts.berjalan, WALL_THEME.ACCENT],
								["Tertunda", activities.counts.tertunda, WALL_THEME.WARN],
								["Dibatalkan", activities.counts.dibatalkan, WALL_THEME.DANGER],
							] as const
						).map(([label, count, color]) => (
							<div
								key={label}
								style={{ display: "flex", justifyContent: "space-between" }}
							>
								<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
									{label}
								</Text>
								<Text size="sm" fw={700} style={{ color }}>
									{count}
								</Text>
							</div>
						))
					) : (
						<Text c="dimmed">Belum ada data</Text>
					)}
				</Stack>
			</Panel>
		</SimpleGrid>
	);
}
