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
	useMantineTheme,
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
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

interface KeuanganData {
	kpiData: KpiItem[];
	incomeExpenseData: ChartData[];
	allocationData: AllocationData[];
	reportData: {
		income: ReportItem[];
		expenses: ReportItem[];
		totalIncome: number;
		totalExpenses: number;
	};
	assistanceData: AssistanceData[];
}

const EMPTY_KEUANGAN: KeuanganData = {
	kpiData: [],
	incomeExpenseData: [],
	allocationData: [],
	reportData: { income: [], expenses: [], totalIncome: 0, totalExpenses: 0 },
	assistanceData: [],
};

// `t` diteruskan sebagai parameter karema transform membangun label dari
// translations — tidak bisa memanggil hook di level modul.
async function fetchApbdesData(
	t: ReturnType<typeof useTranslate>,
): Promise<KeuanganData> {
	const id = "cmk-apbdes-001";
	const { data, error } = (await apiClient.GET("/api/demografi/apbdes/{id}", {
		params: { path: { id } },
	})) as any;

	if (!data || !data.success || !data.data) {
		console.error("Failed to fetch APBDes detail:", error);
		throw new Error("Gagal memuat data keuangan.");
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

	const kpiData: KpiItem[] = [
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
	];

	// 3. Line Chart Mapping (Time Series)
	const monthlyData: Record<number, { income: number; expense: number }> = {};
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
					if (type === "pendapatan") monthlyData[mIdx].income += r.jumlah || 0;
					else if (type === "belanja")
						monthlyData[mIdx].expense += r.jumlah || 0;
				}
			});
		}
	});

	const incomeExpenseData: ChartData[] = Object.entries(monthlyData)
		.map(([mIdx, val]) => ({
			month: months[Number(mIdx)] || "",
			income: val.income / 1000000,
			expense: val.expense / 1000000,
			sortKey: Number(mIdx),
		}))
		.sort((a, b) => a.sortKey - b.sortKey);

	// 4. Bar Chart Mapping (Bidang - level 2 Belanja)
	const sectorItems = items.filter(
		(item: any) => item.level === 2 && item.tipe === "belanja",
	);
	const allocationData: AllocationData[] = sectorItems.map((s: any) => ({
		sector:
			s.uraian?.length > 20 ? s.uraian.substring(0, 17) + "..." : s.uraian,
		amount: (s.anggaran || 0) / 1000000,
	}));

	// 5. Report Table Mapping
	const incomeLevel2 = items.filter(
		(item: any) => item.level === 2 && item.tipe === "pendapatan",
	);
	const expenseLevel2 = items.filter(
		(item: any) => item.level === 2 && item.tipe === "belanja",
	);

	const reportData = {
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
	};

	// 6. Aid & Grants Mapping
	const aidGrants = items.filter(
		(item: any) =>
			item.uraian?.toLowerCase().includes("bantuan") ||
			item.uraian?.toLowerCase().includes("hibah"),
	);
	const assistanceData: AssistanceData[] = aidGrants.map((a: any) => ({
		source: a.uraian,
		amount: (a.anggaran || 0) / 1000000,
		status: (a.totalRealisasi || 0) > 0 ? "cair" : "proses",
	}));

	return {
		kpiData,
		incomeExpenseData,
		allocationData,
		reportData,
		assistanceData,
	};
}

const KeuanganAnggaran = () => {
	const t = useTranslate();
	const theme = useMantineTheme();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	// Resolved color tokens — used for recharts (SVG attrs require concrete values,
	// not CSS vars). Mantine JSX below uses `c=`/`bg=`/`color=` props so they
	// react to the live color scheme automatically.
	const incomeColor = theme.colors.green[5];
	const expenseColor = theme.colors.red[5];
	const barColor = theme.colors["darmasaba-blue"]?.[5] ?? theme.colors.blue[5];
	const gridStroke = dark ? theme.colors.dark[4] : theme.colors.gray[2];
	const axisTick = dark ? theme.colors.dark[1] : theme.colors.gray[7];
	const tooltipBg = dark ? theme.colors.dark[6] : theme.white;
	const tooltipBorder = dark ? theme.colors.dark[4] : theme.colors.gray[3];

	const {
		data = EMPTY_KEUANGAN,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["keuangan", "apbdes"], () => fetchApbdesData(t), {
		autoRefresh: true,
	});
	const {
		kpiData,
		incomeExpenseData,
		allocationData,
		reportData,
		assistanceData,
	} = data;
	const error = isError
		? "Gagal memuat data keuangan. Periksa koneksi dan coba lagi."
		: null;

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
						onClick={() => refetch()}
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
						<Card
							p="md"
							radius="xl"
							withBorder
							ta="center"
							c="dimmed"
							bg={dark ? "#1F293A" : undefined}
						>
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
									borderColor: dark
										? "#374b6aff"
										: "var(--mantine-color-white)",
									boxShadow: "var(--mantine-shadow-xs)",
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
											{item.trend && (
												<TrendingUp
													size={14}
													color="var(--mantine-color-green-5)"
												/>
											)}
											<Text
												size="xs"
												c={item.trend ? "green" : dark ? "gray.4" : "gray.5"}
											>
												{item.subtitle}
											</Text>
										</Group>
									</Stack>
									<ThemeIcon
										color="darmasaba-navy.7"
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
										tickFormatter={(value) => `${value}`}
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
											"",
										]}
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
				</Grid.Col>

				{/* RIGHT: ALOKASI ANGGARAN PER SEKTOR (30%) */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
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
											stroke={gridStroke}
										/>
									)}
									<XAxis
										type="number"
										axisLine={false}
										tickLine={false}
										tick={{ fill: axisTick, fontSize: 12 }}
										tickFormatter={(value) => `${value}`}
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
										<Card
											p="sm"
											radius="lg"
											withBorder
											bg="var(--mantine-color-green-light)"
											style={{
												borderColor: "var(--mantine-color-green-light-color)",
											}}
										>
											<Title order={5} c="green.5" mb="sm">
												{t.keuanganAnggaran.pendapatan}
											</Title>
											<Stack gap="xs">
												{reportData.income.map((item) => (
													<Group key={item.category} justify="space-between">
														<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
															{item.category}
														</Text>
														<Text size="sm" fw={600} c="green.5">
															Rp {item.amount.toLocaleString()}jt
														</Text>
													</Group>
												))}
												<Group
													justify="space-between"
													mt="sm"
													pt="sm"
													style={{
														borderTop:
															"1px solid var(--mantine-color-green-light-color)",
													}}
												>
													<Text fw={700} c="green.5">
														{t.keuanganAnggaran.total}
													</Text>
													<Text fw={700} c="green.5">
														Rp {reportData.totalIncome.toLocaleString()}jt
													</Text>
												</Group>
											</Stack>
										</Card>
									</Grid.Col>

									{/* Belanja */}
									<Grid.Col span={6}>
										<Card
											p="sm"
											radius="lg"
											withBorder
											bg="var(--mantine-color-red-light)"
											style={{
												borderColor: "var(--mantine-color-red-light-color)",
											}}
										>
											<Title order={5} c="red.5" mb="sm">
												{t.keuanganAnggaran.belanja}
											</Title>
											<Stack gap="xs">
												{reportData.expenses.map((item) => (
													<Group key={item.category} justify="space-between">
														<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
															{item.category}
														</Text>
														<Text size="sm" fw={600} c="red.5">
															Rp {item.amount.toLocaleString()}jt
														</Text>
													</Group>
												))}
												<Group
													justify="space-between"
													mt="sm"
													pt="sm"
													style={{
														borderTop:
															"1px solid var(--mantine-color-red-light-color)",
													}}
												>
													<Text fw={700} c="red.5">
														{t.keuanganAnggaran.total}
													</Text>
													<Text fw={700} c="red.5">
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
										borderTop: `1px solid var(--mantine-color-${dark ? "dark-4" : "gray-2"})`,
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
												? "green.5"
												: "red.5"
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
											bg={dark ? "#1e3a5f" : "#eaf1fb"}
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
