import {
	Card,
	Group,
	Skeleton,
	Text,
	ThemeIcon,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { PieChart as PieChartIcon } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { KeuanganAllocation } from "@/api/transforms/keuangan-apbdes";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface AllocationChartProps {
	allocation: KeuanganAllocation[];
	loading: boolean;
	tampilkanGrid: boolean;
}

export function AllocationChart({
	allocation,
	loading,
	tampilkanGrid,
}: AllocationChartProps) {
	const t = useTranslate();
	const theme = useMantineTheme();
	const dark = useIsDark();

	const barColor = theme.colors["darmasaba-blue"]?.[5] ?? theme.colors.blue[5];
	const gridStroke = dark ? theme.colors.dark[4] : theme.colors.gray[2];
	const axisTick = dark ? theme.colors.dark[1] : theme.colors.gray[7];
	const tooltipBg = dark ? theme.colors.dark[6] : theme.white;
	const tooltipBorder = dark ? theme.colors.dark[4] : theme.colors.gray[3];

	const chartData = allocation.map((a) => ({
		sector: a.sector.length > 20 ? `${a.sector.substring(0, 17)}...` : a.sector,
		amount: a.amount / 1_000_000,
	}));

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "var(--mantine-shadow-xs)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<PieChartIcon size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.keuanganAnggaran.alokasiAnggaran}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={300} radius="md" />
			) : chartData.length === 0 ? (
				<Group justify="center" align="center" h={300}>
					<Text size="sm" c="dimmed">
						Belum ada data alokasi anggaran.
					</Text>
				</Group>
			) : (
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData} layout="vertical">
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								horizontal={false}
								stroke={gridStroke}
							/>
						)}
						<XAxis
							type="number"
							axisLine={false}
							tickLine={false}
							tick={{ fill: axisTick, fontSize: 12 }}
						/>
						<YAxis
							type="category"
							dataKey="sector"
							axisLine={false}
							tickLine={false}
							tick={{ fill: axisTick, fontSize: 11 }}
							width={120}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: tooltipBg,
								borderColor: tooltipBorder,
								borderRadius: "8px",
							}}
							itemStyle={{ color: axisTick }}
							labelStyle={{ color: axisTick }}
							formatter={(value: number | undefined) => [
								`Rp ${value}jt`,
								t.keuanganAnggaran.jumlah,
							]}
						/>
						<Bar
							dataKey="amount"
							fill={barColor}
							radius={[0, 8, 8, 0]}
							maxBarSize={30}
						/>
					</BarChart>
				</ResponsiveContainer>
			)}
		</Card>
	);
}
