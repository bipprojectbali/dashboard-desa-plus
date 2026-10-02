import { Card, Group, Skeleton, Title } from "@mantine/core";
import {
	CartesianGrid,
	LabelList,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { EmptyState } from "./pengaduan-empty-state";

interface Props {
	trends: { bulan: string; jumlah: number }[];
	loading: boolean;
}

export function PengaduanTrendCard({ trends, loading }: Props) {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	return (
		<Card
			data-ai-target="pengaduan.tren"
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
		>
			<Group justify="space-between" mb="md">
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.pengaduanLayanan.trenPengaduan}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={300} radius="md" />
			) : trends.length > 0 ? (
				<ResponsiveContainer width="100%" height={300}>
					<LineChart
						data={trends}
						margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
					>
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
						)}
						<XAxis
							dataKey="bulan"
							axisLine={false}
							tickLine={false}
							tickMargin={12}
							padding={{ left: 24, right: 24 }}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
							allowDecimals={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
							}}
							itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Line
							type="monotone"
							dataKey="jumlah"
							stroke="#396aaaff"
							strokeWidth={2}
							dot={{
								fill: "var(--mantine-color-darmasaba-navy-7)",
								strokeWidth: 2,
								r: 4,
							}}
							activeDot={{ r: 6 }}
						>
							<LabelList
								dataKey="jumlah"
								position="top"
								style={{
									fill: dark ? "#E2E8F0" : "#374151",
									fontSize: 11,
								}}
							/>
						</Line>
					</LineChart>
				</ResponsiveContainer>
			) : (
				<EmptyState
					message={t.pengaduanLayanan.tidakAdaDataPengaduan}
					height={300}
				/>
			)}
		</Card>
	);
}
