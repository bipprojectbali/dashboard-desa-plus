import { BarChart, DonutChart } from "@mantine/charts";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import type { WallKeuangan } from "@/types/wall";
import { WALL_THEME } from "../wall-theme";

interface KeuanganSceneProps {
	data: WallKeuangan | null;
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

/** Scene keuangan: APBDes (bar), kepuasan (donut), SDGs (list skor). */
export function KeuanganScene({ data }: KeuanganSceneProps) {
	const apbdes = (data?.apbdes ?? []).map((b) => ({
		category: b.category,
		amount: b.amount,
	}));
	const kepuasan = (data?.satisfaction ?? []).map((s) => ({
		name: s.category,
		value: s.value,
		color: s.color,
	}));
	const sdgs = data?.sdgs ?? [];

	return (
		<SimpleGrid cols={3} spacing="md" style={{ height: "100%" }}>
			<Panel title="APBDes 2025">
				{apbdes.length > 0 ? (
					<BarChart
						h={300}
						data={apbdes}
						dataKey="category"
						series={[{ name: "amount", color: WALL_THEME.ACCENT }]}
						withLegend={false}
					/>
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>

			<Panel title="Kepuasan Layanan">
				{kepuasan.length > 0 ? (
					<DonutChart h={300} data={kepuasan} withLabels />
				) : (
					<Text c="dimmed">Belum ada data</Text>
				)}
			</Panel>

			<Panel title="Skor SDGs">
				<Stack gap={8}>
					{sdgs.length > 0 ? (
						sdgs.slice(0, 8).map((s) => (
							<div
								key={s.title}
								style={{ display: "flex", justifyContent: "space-between" }}
							>
								<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
									{s.title}
								</Text>
								<Text size="sm" fw={700} style={{ color: WALL_THEME.ACCENT }}>
									{s.score}
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
