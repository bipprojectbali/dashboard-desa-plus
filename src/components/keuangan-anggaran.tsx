import {
	Badge,
	Box,
	Card,
	Grid,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
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

// KPI Data
const kpiData = [
	{
		id: 1,
		title: "Total APBDes",
		value: "Rp 5.2M",
		subtitle: "Tahun 2025",
		icon: Coins,
	},
	{
		id: 2,
		title: "Realisasi",
		value: "68%",
		subtitle: "Rp 3.5M dari 5.2M",
		icon: CheckCircle,
	},
	{
		id: 3,
		title: "Pemasukan",
		value: "Rp 580jt",
		subtitle: "Bulan ini",
		trend: "+8%",
		icon: TrendingUp,
	},
	{
		id: 4,
		title: "Pengeluaran",
		value: "Rp 520jt",
		subtitle: "Bulan ini",
		icon: TrendingDown,
	},
];

// Income & Expense Data
const incomeExpenseData = [
	{ month: "Apr", income: 450, expense: 380 },
	{ month: "Mei", income: 520, expense: 420 },
	{ month: "Jun", income: 480, expense: 500 },
	{ month: "Jul", income: 580, expense: 450 },
	{ month: "Agu", income: 550, expense: 520 },
	{ month: "Sep", income: 600, expense: 480 },
	{ month: "Okt", income: 580, expense: 520 },
];

// Sector Allocation Data
const allocationData = [
	{ sector: "Pembangunan", amount: 1200 },
	{ sector: "Kesehatan", amount: 800 },
	{ sector: "Pendidikan", amount: 650 },
	{ sector: "Sosial", amount: 550 },
	{ sector: "Kebudayaan", amount: 400 },
	{ sector: "Teknologi", amount: 300 },
];

// APBDes Report Data
const apbdReport = {
	income: [
		{ category: "Dana Desa", amount: 1800 },
		{ category: "Alokasi Dana Desa", amount: 480 },
		{ category: "Bagi Hasil Pajak & Retribusi", amount: 300 },
		{ category: "Pendapatan Asli Desa", amount: 200 },
		{ category: "Hibah Bantuan", amount: 300 },
	],
	expenses: [
		{ category: "Penyelenggaraan Pemerintah", amount: 425 },
		{ category: "Pembangunan Desa", amount: 850 },
		{ category: "Pembinaan Kemasyarakatan", amount: 320 },
		{ category: "Pemberdayaan Masyarakat", amount: 380 },
		{ category: "Penanggulangan Bencana", amount: 180 },
	],
	totalIncome: 3080,
	totalExpenses: 2155,
};

// Aid & Grants Data
const assistanceFundData = [
	{ source: "Dana Desa (DD)", amount: 1800, status: "cair" },
	{ source: "Alokasi Dana Desa (ADD)", amount: 950, status: "cair" },
	{ source: "Bagi Hasil Pajak", amount: 450, status: "cair" },
	{ source: "Hibah Provinsi", amount: 300, status: "proses" },
];

const KeuanganAnggaran = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Stack gap="lg">
			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter="md">
				{kpiData.map((item) => (
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
				))}
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
								Pemasukan dan Pengeluaran
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={incomeExpenseData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={dark ? "#334155" : "#e5e7eb"}
								/>
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
									tickFormatter={(value) => `Rp ${value}jt`}
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
									name="Pemasukan"
								/>
								<Line
									type="monotone"
									dataKey="expense"
									stroke="#EF4444"
									strokeWidth={2}
									dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6 }}
									name="Pengeluaran"
								/>
							</LineChart>
						</ResponsiveContainer>
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
								Alokasi Anggaran Per Sektor
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={allocationData} layout="vertical">
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={false}
									stroke={dark ? "#334155" : "#e5e7eb"}
								/>
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
									width={100}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
									formatter={(value: number | undefined) => [
										`Rp ${value}jt`,
										"Jumlah",
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
								Laporan APBDes
							</Title>
						</Group>

						<Grid gutter="md">
							{/* Pendapatan */}
							<Grid.Col span={6}>
								<Card p="sm" radius="lg" bg={dark ? "#064E3B" : "#DCFCE7"}>
									<Title order={5} c="#22C55E" mb="sm">
										Pendapatan
									</Title>
									<Stack gap="xs">
										{apbdReport.income.map((item) => (
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
												Total:
											</Text>
											<Text fw={700} c="#22C55E">
												Rp {apbdReport.totalIncome.toLocaleString()}jt
											</Text>
										</Group>
									</Stack>
								</Card>
							</Grid.Col>

							{/* Belanja */}
							<Grid.Col span={6}>
								<Card p="sm" radius="lg" bg={dark ? "#7F1D1D" : "#FEE2E2"}>
									<Title order={5} c="#EF4444" mb="sm">
										Belanja
									</Title>
									<Stack gap="xs">
										{apbdReport.expenses.map((item) => (
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
												Total:
											</Text>
											<Text fw={700} c="#EF4444">
												Rp {apbdReport.totalExpenses.toLocaleString()}jt
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
								Saldo:
							</Text>
							<Text
								fw={700}
								size="lg"
								c={
									apbdReport.totalIncome > apbdReport.totalExpenses
										? "#22C55E"
										: "#EF4444"
								}
							>
								Rp{" "}
								{(
									apbdReport.totalIncome - apbdReport.totalExpenses
								).toLocaleString()}
								jt
							</Text>
						</Group>
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
								Dana Bantuan dan Hibah
							</Title>
						</Group>
						<Stack gap="sm">
							{assistanceFundData.map((fund) => (
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
											<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
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
											{fund.status === "cair" ? "Cair" : "Proses"}
										</Badge>
									</Group>
								</Card>
							))}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default KeuanganAnggaran;
