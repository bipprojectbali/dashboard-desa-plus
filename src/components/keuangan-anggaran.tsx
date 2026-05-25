/** biome-ignore-all lint/suspicious/noExplicitAny: penjelasannya */

import {
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import {
	CheckCircle,
	Coins,
	PieChart as PieChartIcon,
	Receipt,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSnapshot } from "valtio";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { apiClient } from "@/utils/api-client";

// Data Interfaces
interface KpiItem {
	id: number;
	title: string;
	value: string;
	subtitle: string;
	icon: any;
	trend?: string;
}

interface ChartData {
	month: string;
	income: number;
	expense: number;
}

interface AllocationData {
	sector: string;
	amount: number;
}

interface ReportItem {
	category: string;
	amount: number;
}

interface AssistanceData {
	source: string;
	amount: number;
	status: string;
}

const KeuanganAnggaran = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [kpiData, setKpiData] = useState<KpiItem[]>([]);
	const [incomeExpenseData, setIncomeExpenseData] = useState<ChartData[]>([]);
	const [allocationData, setAllocationData] = useState<AllocationData[]>([]);
	const [reportData, setReportData] = useState<{
		income: ReportItem[];
		expenses: ReportItem[];
		totalIncome: number;
		totalExpenses: number;
	}>({ income: [], expenses: [], totalIncome: 0, totalExpenses: 0 });
	const [assistanceData, setAssistanceData] = useState<AssistanceData[]>([]);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const id = "cmk-apbdes-001";
			const { data, error } = (await apiClient.GET(
				"/api/demografi/apbdes/{id}",
				{
					params: { path: { id } },
				},
			)) as any;

			if (!data || !data.success || !data.data) {
				console.error("Failed to fetch APBDes detail:", error);
				setError("Gagal memuat data keuangan. Periksa koneksi dan coba lagi.");
				return;
			}

			const rawData = data.data.data || data.data;
			const items = rawData.items || [];

			// Helper to parse amount (handles strings like "1.850.000.000" or numbers)
			const parseAmount = (val: any) => {
				if (typeof val === "number") return val;
				if (typeof val === "string")
					return Number(val.replace(/\./g, "").replace(/,/g, ""));
				return 0;
			};

			// 1. Calculate Real Totals by iterating through all realisasiItems
			let calculatedTotalIncomeReal = 0;
			let calculatedTotalExpenseReal = 0;

			items.forEach((item: any) => {
				const type = item.tipe?.toLowerCase();
				if (item.realisasiItems && Array.isArray(item.realisasiItems)) {
					const itemReal = item.realisasiItems.reduce(
						(acc: number, curr: any) => acc + (curr.jumlah || 0),
						0,
					);
					if (type === "pendapatan") calculatedTotalIncomeReal += itemReal;
					else if (type === "belanja") calculatedTotalExpenseReal += itemReal;
				}
			});

			// 2. KPI Data Mapping
			// Use the "jumlah" field from rawData which represents Total Pendapatan + Pembiayaan
			const totalBudget = parseAmount(rawData.jumlah);

			const realisasiPercent =
				totalBudget > 0
					? Math.round((calculatedTotalExpenseReal / totalBudget) * 100)
					: 0;

			// Helper to format currency in Millions
			const formatM = (val: number) => {
				const m = val / 1000000;
				if (m >= 1000) return `${(m / 1000).toFixed(1)}M`;
				return `${m.toFixed(1)}jt`;
			};

			setKpiData([
				{
					id: 1,
					title: t.keuanganAnggaran.totalApbdes,
					value: `Rp ${formatM(totalBudget)}`,
					subtitle: `${t.keuanganAnggaran.tahun} ${rawData.tahun || "2025"}`,
					icon: Coins,
				},
				{
					id: 2,
					title: t.keuanganAnggaran.realisasi,
					value: `${realisasiPercent}%`,
					subtitle: `Rp ${formatM(calculatedTotalExpenseReal)} ${t.keuanganAnggaran.dari} ${formatM(totalBudget)}`,
					icon: CheckCircle,
				},
				{
					id: 3,
					title: t.keuanganAnggaran.pemasukan,
					value: `Rp ${formatM(calculatedTotalIncomeReal)}`,
					subtitle: t.keuanganAnggaran.totalRealisasi,
					trend: "+0%",
					icon: TrendingUp,
				},
				{
					id: 4,
					title: t.keuanganAnggaran.pengeluaran,
					value: `Rp ${formatM(calculatedTotalExpenseReal)}`,
					subtitle: t.keuanganAnggaran.totalRealisasi,
					icon: TrendingDown,
				},
			]);

			// 3. Line Chart Mapping (Time Series)
			const monthlyData: Record<number, { income: number; expense: number }> =
				{};
			for (let i = 0; i < 12; i++) monthlyData[i] = { income: 0, expense: 0 };

			const months = [
				t.keuanganAnggaran.jan,
				t.keuanganAnggaran.feb,
				t.keuanganAnggaran.mar,
				t.keuanganAnggaran.apr,
				t.keuanganAnggaran.mei,
				t.keuanganAnggaran.jun,
				t.keuanganAnggaran.jul,
				t.keuanganAnggaran.agu,
				t.keuanganAnggaran.sep,
				t.keuanganAnggaran.okt,
				t.keuanganAnggaran.nov,
				t.keuanganAnggaran.des,
			];

			items.forEach((item: any) => {
				const type = item.tipe?.toLowerCase();
				if (item.realisasiItems && Array.isArray(item.realisasiItems)) {
					item.realisasiItems.forEach((r: any) => {
						const date = new Date(r.tanggal);
						const mIdx = date.getMonth();
						if (monthlyData[mIdx]) {
							if (type === "pendapatan")
								monthlyData[mIdx].income += r.jumlah || 0;
							else if (type === "belanja")
								monthlyData[mIdx].expense += r.jumlah || 0;
						}
					});
				}
			});

			const chartData: ChartData[] = Object.entries(monthlyData)
				.map(([mIdx, val]) => ({
					month: months[Number(mIdx)] || "",
					income: val.income / 1000000,
					expense: val.expense / 1000000,
					sortKey: Number(mIdx),
				}))
				.sort((a, b) => a.sortKey - b.sortKey);

			setIncomeExpenseData(chartData);

			// 4. Bar Chart Mapping (Bidang - level 2 Belanja)
			const sectorItems = items.filter(
				(item: any) => item.level === 2 && item.tipe === "belanja",
			);
			setAllocationData(
				sectorItems.map((s: any) => ({
					sector:
						s.uraian?.length > 20
							? s.uraian.substring(0, 17) + "..."
							: s.uraian,
					amount: (s.anggaran || 0) / 1000000,
				})),
			);

			// 5. Report Table Mapping
			const incomeLevel2 = items.filter(
				(item: any) => item.level === 2 && item.tipe === "pendapatan",
			);
			const expenseLevel2 = items.filter(
				(item: any) => item.level === 2 && item.tipe === "belanja",
			);

			setReportData({
				income: incomeLevel2.map((i: any) => ({
					category: i.uraian,
					amount: (i.anggaran || 0) / 1000000,
				})),
				expenses: expenseLevel2.map((e: any) => ({
					category: e.uraian,
					amount: (e.anggaran || 0) / 1000000,
				})),
				totalIncome: calculatedTotalIncomeReal / 1000000,
				totalExpenses: calculatedTotalExpenseReal / 1000000,
			});

			// 5. Aid & Grants Mapping
			const aidGrants = items.filter(
				(item: any) =>
					item.uraian?.toLowerCase().includes("bantuan") ||
					item.uraian?.toLowerCase().includes("hibah"),
			);
			setAssistanceData(
				aidGrants.map((a: any) => ({
					source: a.uraian,
					amount: (a.anggaran || 0) / 1000000,
					status: (a.totalRealisasi || 0) > 0 ? "cair" : "proses",
				})),
			);
		} catch (err) {
			console.error("Error fetching financial data:", err);
			setError("Gagal memuat data keuangan. Periksa koneksi dan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useAutoRefresh(fetchData);

	const hasChartData = incomeExpenseData.some(
		(d) => d.income > 0 || d.expense > 0,
	);

	return (
		<Stack gap="lg">
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					title="Gagal memuat data"
					radius="md"
				>
					{error}
					<Button
						size="xs"
						variant="light"
						color="red"
						leftSection={<IconRefresh size={14} />}
						onClick={fetchData}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter="md">
				{loading ? (
					Array.from({ length: 4 }).map((_, i) => (
						<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
							<Skeleton height={100} radius="xl" />
						</Grid.Col>
					))
				) : kpiData.length === 0 ? (
					<Grid.Col span={12}>
						<Card p="md" radius="xl" withBorder ta="center" c="dimmed">
							Belum ada data APBDes.
						</Card>
					</Grid.Col>
				) : (
					kpiData.map((item) => (
						<Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 3 }}>
							<Card
								p="md"
								radius="xl"
								withBorder
								bg={dark ? "#1E293B" : "white"}
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								h="100%"
							>
								<Group justify="space-between" align="flex-start" w="100%">
									<Stack gap={2}>
										<Text size="sm" c="dimmed">
											{item.title}
										</Text>
										<Text size="xl" fw={700} c={dark ? "white" : "gray.9"}>
											{item.value}
										</Text>
										<Group gap={4} align="flex-start">
											{item.trend && <TrendingUp size={14} color="#22C55E" />}
											<Text
												size="xs"
												c={item.trend ? "green" : dark ? "gray.4" : "gray.5"}
											>
												{item.subtitle}
											</Text>
										</Group>
									</Stack>
									<ThemeIcon
										color="#1E3A5F"
										variant="filled"
										size="lg"
										radius="xl"
									>
										<item.icon style={{ width: "60%", height: "60%" }} />
									</ThemeIcon>
								</Group>
							</Card>
						</Grid.Col>
					))
				)}
			</Grid>

			{/* MAIN CHART SECTION */}
			<Grid gutter="lg">
				{/* LEFT: PEMASUKAN DAN PENGELUARAN (70%) */}
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<Card
						p="md"
						radius="xl"
						withBorder
						bg={dark ? "#1E293B" : "white"}
						style={{
							borderColor: dark ? "#334155" : "white",
							boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
						}}
						h="100%"
					>
						<Group gap="xs" mb="md">
							<ThemeIcon color="#1E3A5F" variant="filled" size="sm" radius="sm">
								<PieChartIcon size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.keuanganAnggaran.pemasukanDanPengeluaran}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={300} radius="md" />
						) : !hasChartData ? (
							<Group justify="center" align="center" h={300}>
								<Text size="sm" c="dimmed">
									Belum ada data pemasukan dan pengeluaran.
								</Text>
							</Group>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={incomeExpenseData}>
									{tampilkanGrid && (
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke={dark ? "#334155" : "#e5e7eb"}
										/>
									)}
									<XAxis
										dataKey="month"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: dark ? "#E2E8F0" : "#374151",
											fontSize: 12,
										}}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{
											fill: dark ? "#E2E8F0" : "#374151",
											fontSize: 12,
										}}
										tickFormatter={(value) => `${value}`}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: dark ? "#1E293B" : "white",
											borderColor: dark ? "#334155" : "#e5e7eb",
											borderRadius: "8px",
										}}
										labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
										formatter={(value: number | undefined) => [
											`Rp ${value}jt`,
											"",
										]}
									/>
									<Line
										type="monotone"
										dataKey="income"
										stroke="#22C55E"
										strokeWidth={2}
										dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
										activeDot={{ r: 6 }}
										name={t.keuanganAnggaran.pemasukan}
									/>
									<Line
										type="monotone"
										dataKey="expense"
										stroke="#EF4444"
										strokeWidth={2}
										dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
										activeDot={{ r: 6 }}
										name={t.keuanganAnggaran.pengeluaran}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Grid.Col>

				{/* RIGHT: ALOKASI ANGGARAN PER SEKTOR (30%) */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<Card
						p="md"
						radius="xl"
						withBorder
						bg={dark ? "#1E293B" : "white"}
						style={{
							borderColor: dark ? "#334155" : "white",
							boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
						}}
						h="100%"
					>
						<Group gap="xs" mb="md">
							<ThemeIcon color="#1E3A5F" variant="filled" size="sm" radius="sm">
								<PieChartIcon size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.keuanganAnggaran.alokasiAnggaran}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={300} radius="md" />
						) : allocationData.length === 0 ? (
							<Group justify="center" align="center" h={300}>
								<Text size="sm" c="dimmed">
									Belum ada data alokasi anggaran.
								</Text>
							</Group>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={allocationData} layout="vertical">
									{tampilkanGrid && (
										<CartesianGrid
											strokeDasharray="3 3"
											horizontal={false}
											stroke={dark ? "#334155" : "#e5e7eb"}
										/>
									)}
									<XAxis
										type="number"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: dark ? "#E2E8F0" : "#374151",
											fontSize: 12,
										}}
										tickFormatter={(value) => `${value}`}
									/>
									<YAxis
										type="category"
										dataKey="sector"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: dark ? "#E2E8F0" : "#374151",
											fontSize: 11,
										}}
										width={120}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: dark ? "#1E293B" : "white",
											borderColor: dark ? "#334155" : "#e5e7eb",
											borderRadius: "8px",
										}}
										formatter={(value: number | undefined) => [
											`Rp ${value}jt`,
											t.keuanganAnggaran.jumlah,
										]}
									/>
									<Bar
										dataKey="amount"
										fill="#396aaaff"
										radius={[0, 8, 8, 0]}
										maxBarSize={30}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</Card>
				</Grid.Col>
			</Grid>

			{/* BOTTOM SECTION */}
			<Grid gutter="lg">
				{/* LEFT: LAPORAN APBDES */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						radius="xl"
						withBorder
						bg={dark ? "#1E293B" : "white"}
						style={{
							borderColor: dark ? "#334155" : "white",
							boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
						}}
						h="100%"
					>
						<Group gap="xs" mb="md">
							<ThemeIcon color="#1E3A5F" variant="filled" size="sm" radius="sm">
								<Receipt size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.keuanganAnggaran.laporanApbdes}
							</Title>
						</Group>

						{loading ? (
							<Skeleton height={280} radius="md" />
						) : reportData.income.length === 0 &&
							reportData.expenses.length === 0 ? (
							<Group justify="center" align="center" h={280}>
								<Text size="sm" c="dimmed">
									Belum ada data laporan APBDes.
								</Text>
							</Group>
						) : (
							<>
								<Grid gutter="md">
									{/* Pendapatan */}
									<Grid.Col span={6}>
										<Card p="sm" radius="lg" bg={dark ? "#064E3B" : "#DCFCE7"}>
											<Title order={5} c="#22C55E" mb="sm">
												{t.keuanganAnggaran.pendapatan}
											</Title>
											<Stack gap="xs">
												{reportData.income.map((item) => (
													<Group key={item.category} justify="space-between">
														<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
															{item.category}
														</Text>
														<Text size="sm" fw={600} c="#22C55E">
															Rp {item.amount.toLocaleString()}jt
														</Text>
													</Group>
												))}
												<Group
													justify="space-between"
													mt="sm"
													pt="sm"
													style={{
														borderTop: `1px solid ${dark ? "#065F46" : "#86EFAC"}`,
													}}
												>
													<Text fw={700} c="#22C55E">
														{t.keuanganAnggaran.total}
													</Text>
													<Text fw={700} c="#22C55E">
														Rp {reportData.totalIncome.toLocaleString()}jt
													</Text>
												</Group>
											</Stack>
										</Card>
									</Grid.Col>

									{/* Belanja */}
									<Grid.Col span={6}>
										<Card p="sm" radius="lg" bg={dark ? "#7F1D1D" : "#FEE2E2"}>
											<Title order={5} c="#EF4444" mb="sm">
												{t.keuanganAnggaran.belanja}
											</Title>
											<Stack gap="xs">
												{reportData.expenses.map((item) => (
													<Group key={item.category} justify="space-between">
														<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
															{item.category}
														</Text>
														<Text size="sm" fw={600} c="#EF4444">
															Rp {item.amount.toLocaleString()}jt
														</Text>
													</Group>
												))}
												<Group
													justify="space-between"
													mt="sm"
													pt="sm"
													style={{
														borderTop: `1px solid ${dark ? "#991B1B" : "#FCA5A5"}`,
													}}
												>
													<Text fw={700} c="#EF4444">
														{t.keuanganAnggaran.total}
													</Text>
													<Text fw={700} c="#EF4444">
														Rp {reportData.totalExpenses.toLocaleString()}jt
													</Text>
												</Group>
											</Stack>
										</Card>
									</Grid.Col>
								</Grid>

								{/* Saldo */}
								<Group
									justify="space-between"
									mt="md"
									pt="md"
									style={{
										borderTop: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
									}}
								>
									<Text fw={700} c={dark ? "white" : "gray.9"}>
										{t.keuanganAnggaran.saldo}
									</Text>
									<Text
										fw={700}
										size="lg"
										c={
											reportData.totalIncome > reportData.totalExpenses
												? "#22C55E"
												: "#EF4444"
										}
									>
										Rp{" "}
										{(
											reportData.totalIncome - reportData.totalExpenses
										).toLocaleString()}
										jt
									</Text>
								</Group>
							</>
						)}
					</Card>
				</Grid.Col>

				{/* RIGHT: DANA BANTUAN DAN HIBAH */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						radius="xl"
						withBorder
						bg={dark ? "#1E293B" : "white"}
						style={{
							borderColor: dark ? "#334155" : "white",
							boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
						}}
						h="100%"
					>
						<Group gap="xs" mb="md">
							<ThemeIcon color="#1E3A5F" variant="filled" size="sm" radius="sm">
								<Coins size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.keuanganAnggaran.danaBantuan}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={200} radius="md" />
						) : (
							<Stack gap="sm">
								{assistanceData.length > 0 ? (
									assistanceData.map((fund) => (
										<Card
											key={fund.source}
											p="sm"
											radius="lg"
											bg={dark ? "#334155" : "#F1F5F9"}
											style={{
												borderColor: "transparent",
												transition: "background-color 0.15s ease",
											}}
										>
											<Group justify="space-between" align="center">
												<Box>
													<Text
														size="sm"
														fw={600}
														c={dark ? "white" : "gray.9"}
													>
														{fund.source}
													</Text>
													<Text size="xs" c="dimmed">
														Rp {fund.amount.toLocaleString()}jt
													</Text>
												</Box>
												<Badge
													variant="light"
													color={fund.status === "cair" ? "green" : "yellow"}
													radius="sm"
													fw={600}
												>
													{fund.status === "cair"
														? t.keuanganAnggaran.cair
														: t.keuanganAnggaran.proses}
												</Badge>
											</Group>
										</Card>
									))
								) : (
									<Text size="sm" c="dimmed" ta="center" py="xl">
										{t.keuanganAnggaran.tidakAdaBantuan}
									</Text>
								)}
							</Stack>
						)}
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default KeuanganAnggaran;
