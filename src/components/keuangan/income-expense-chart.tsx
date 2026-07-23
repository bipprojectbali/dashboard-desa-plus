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
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { KeuanganMonthly } from "@/api/transforms/keuangan-apbdes";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface IncomeExpenseChartProps {
	monthly: KeuanganMonthly[];
	monthLabels: string[];
	loading: boolean;
	tampilkanGrid: boolean;
}

export function IncomeExpenseChart({
	monthly,
	monthLabels,
	loading,
	tampilkanGrid,
}: IncomeExpenseChartProps) {
	const t = useTranslate();
	const theme = useMantineTheme();
	const dark = useIsDark();

	const incomeColor = theme.colors.green[5];
	const expenseColor = theme.colors.red[5];
	const gridStroke = dark ? theme.colors.dark[4] : theme.colors.gray[2];
	const axisTick = dark ? theme.colors.dark[1] : theme.colors.gray[7];
	const tooltipBg = dark ? theme.colors.dark[6] : theme.white;
	const tooltipBorder = dark ? theme.colors.dark[4] : theme.colors.gray[3];

	const chartData = monthly.map((m, idx) => ({
		month: monthLabels[idx] ?? "",
		income: m.income / 1_000_000,
		expense: m.expense / 1_000_000,
	}));

	const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#374b6aff" : "var(--mantine-color-white)",
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
					{t.keuanganAnggaran.pemasukanDanPengeluaran}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={300} radius="md" />
			) : !hasData ? (
				<Group justify="center" align="center" h={300}>
					<Text size="sm" c="dimmed">
						Belum ada data pemasukan dan pengeluaran.
					</Text>
				</Group>
			) : (
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={chartData}>
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={gridStroke}
							/>
						)}
						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tick={{ fill: axisTick, fontSize: 12 }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: axisTick, fontSize: 12 }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: tooltipBg,
								borderColor: tooltipBorder,
								borderRadius: "8px",
							}}
							itemStyle={{ color: axisTick }}
							labelStyle={{ color: axisTick }}
							formatter={(value: number | undefined) => [`Rp ${value}jt`, ""]}
						/>
						<Line
							type="monotone"
							dataKey="income"
							stroke={incomeColor}
							strokeWidth={2}
							dot={{ fill: incomeColor, strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6 }}
							name={t.keuanganAnggaran.pemasukan}
						/>
						<Line
							type="monotone"
							dataKey="expense"
							stroke={expenseColor}
							strokeWidth={2}
							dot={{ fill: expenseColor, strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6 }}
							name={t.keuanganAnggaran.pengeluaran}
						/>
					</LineChart>
				</ResponsiveContainer>
			)}
		</Card>
	);
}
