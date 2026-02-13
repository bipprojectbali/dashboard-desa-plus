import React from "react";
import {
	Button,
	Card,
	Badge,
	Title,
	Text,
	Group,
	Stack,
	Grid,
	Box,
	Progress,
	useMantineColorScheme,
} from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconCurrency } from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";

// Sample Data
const kpiData = [
	{
		id: 1,
		title: "Total APBDes",
		value: "Rp 5.2M",
		sub: "Tahun 2025",
		icon: (
			<IconCurrency className="h-6 w-6 text-muted-foreground" />
		),
	},
	{
		id: 2,
		title: "Realisasi",
		value: "68%",
		sub: "Rp 3.5M dari 5.2M",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6 text-muted-foreground"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.473-1.688 3.342-.48.485-.926.97-1.378 1.44c-1.472 1.58-2.306 2.787-2.91 3.514-.15.18-.207.33-.207.33A.75.75 0 0 1 15 21h-3c-1.104 0-2.08-.542-2.657-1.455-.139-.201-.264-.406-.38-.614l-.014-.025C8.85 18.067 8.156 17.2 7.5 16.325.728 12.56.728 7.44 7.5 3.675c3.04-.482 5.584.47 7.042 1.956.674.672 1.228 1.462 1.696 2.307.426.786.793 1.582 1.113 2.392h.001Z"
				/>
			</svg>
		),
	},
	{
		id: 3,
		title: "Pemasukan",
		value: "Rp 580jt",
		sub: "Bulan ini",
		delta: "+8%",
		deltaType: "positive",
		icon: (
			<IconTrendingUp className="h-6 w-6 text-muted-foreground" />
		),
	},
	{
		id: 4,
		title: "Pengeluaran",
		value: "Rp 520jt",
		sub: "Bulan ini",
		icon: (
			<IconTrendingDown className="h-6 w-6 text-muted-foreground" />
		),
	},
];

const incomeExpenseData = [
	{ month: "Apr", income: 450, expense: 380 },
	{ month: "Mei", income: 520, expense: 420 },
	{ month: "Jun", income: 480, expense: 500 },
	{ month: "Jul", income: 580, expense: 450 },
	{ month: "Agu", income: 550, expense: 520 },
	{ month: "Sep", income: 600, expense: 480 },
	{ month: "Okt", income: 580, expense: 520 },
];

const allocationData = [
	{ sector: "Pembangunan", amount: 1200 },
	{ sector: "Kesehatan", amount: 800 },
	{ sector: "Pendidikan", amount: 650 },
	{ sector: "Sosial", amount: 550 },
	{ sector: "Kebudayaan", amount: 400 },
	{ sector: "Teknologi", amount: 300 },
];

const assistanceFundData = [
	{ source: "Dana Desa (DD)", amount: 1800, status: "cair" },
	{ source: "Alokasi Dana Desa (ADD)", amount: 950, status: "cair" },
	{ source: "Bagi Hasil Pajak", amount: 450, status: "cair" },
	{ source: "Hibah Provinsi", amount: 300, status: "proses" },
];

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

const KeuanganAnggaran = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	return (
		<Box>
			<Stack gap="xl">
				{/* KPI Cards */}
				<Grid gutter="lg">
					{kpiData.map((kpi) => (
						<Grid.Col key={kpi.id} span={{ base: 12, md: 6, lg: 3 }}>
							<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }} h="100%">
								<Group justify="space-between" align="flex-start" mb="xs">
									<Text size="sm" fw={500} c="dimmed">
										{kpi.title}
									</Text>
									{React.cloneElement(kpi.icon, {
										className: "h-6 w-6",
										color: "var(--mantine-color-dimmed)",
									})}
								</Group>
								<Title order={3} fw={700} mt="xs">
									{kpi.value}
								</Title>
								{kpi.delta && (
									<Text
										size="xs"
										c={
											kpi.deltaType === "positive"
												? "green"
												: kpi.deltaType === "negative"
													? "red"
													: "dimmed"
										}
										mt={4}
									>
										{kpi.delta}
									</Text>
								)}
								{kpi.sub && (
									<Text size="xs" c="dimmed" mt="auto">
										{kpi.sub}
									</Text>
								)}
							</Card>
						</Grid.Col>
					))}
				</Grid>

				{/* Charts Section */}
				<Grid gutter="lg">
					{/* Grafik Pemasukan vs Pengeluaran */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
							<Title order={3} fw={500} mb="md">
								Pemasukan vs Pengeluaran
							</Title>
							<BarChart
								h={300}
								data={incomeExpenseData}
								dataKey="month"
								series={[
									{ name: 'income', color: 'green', label: 'Pemasukan' },
									{ name: 'expense', color: 'red', label: 'Pengeluaran' },
								]}
								withLegend
							/>
						</Card>
					</Grid.Col>

					{/* Alokasi Anggaran Per Sektor */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
							<Title order={3} fw={500} mb="md">
								Alokasi Anggaran Per Sektor
							</Title>
							<BarChart
								h={300}
								data={allocationData}
								dataKey="sector"
								series={[{ name: 'amount', color: 'darmasaba-navy', label: 'Jumlah' }]}
								withLegend
								orientation="horizontal"
							/>
						</Card>
					</Grid.Col>
				</Grid>

				<Grid gutter="lg">
					{/* Dana Bantuan & Hibah */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
							<Title order={3} fw={500} mb="md">
								Dana Bantuan & Hibah
							</Title>
							<Stack gap="sm">
								{assistanceFundData.map((fund, index) => (
									<Group
										key={index}
										justify="space-between"
										align="center"
										p="sm"
										style={{
											border: "1px solid var(--mantine-color-gray-3)",
											borderRadius: "var(--mantine-radius-sm)",
										}}
									>
										<Box>
											<Text size="sm" fw={500}>
												{fund.source}
											</Text>
											<Text size="sm" c="dimmed">
												Rp {fund.amount.toLocaleString()}jt
											</Text>
										</Box>
										<Badge
											variant="light"
											color={fund.status === "cair" ? "green" : "yellow"}
										>
											{fund.status}
										</Badge>
									</Group>
								))}
							</Stack>
						</Card>
					</Grid.Col>

					{/* Laporan APBDes */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
							<Title order={3} fw={500} mb="md">
								Laporan APBDes
							</Title>

							<Box mb="md">
								<Title order={4} mb="sm">Pendapatan</Title>
								<Stack gap="xs">
									{apbdReport.income.map((item, index) => (
										<Group key={index} justify="space-between">
											<Text size="sm">{item.category}</Text>
											<Text size="sm" c="green">
												Rp {item.amount.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group justify="space-between" mt="sm">
										<Text fw={700}>Total Pendapatan:</Text>
										<Text fw={700} c="green">
											Rp {apbdReport.totalIncome.toLocaleString()}jt
										</Text>
									</Group>
								</Stack>
							</Box>

							<Box>
								<Title order={4} mb="sm">Belanja</Title>
								<Stack gap="xs">
									{apbdReport.expenses.map((item, index) => (
										<Group key={index} justify="space-between">
											<Text size="sm">{item.category}</Text>
											<Text size="sm" c="red">
												Rp {item.amount.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group justify="space-between" mt="sm">
										<Text fw={700}>Total Belanja:</Text>
										<Text fw={700} c="red">
											Rp {apbdReport.totalExpenses.toLocaleString()}jt
										</Text>
									</Group>
								</Stack>
							</Box>

							<Box mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
								<Group justify="space-between">
									<Text fw={700}>Saldo:</Text>
									<Text fw={700} c={apbdReport.totalIncome > apbdReport.totalExpenses ? "green" : "red"}>
										Rp {(apbdReport.totalIncome - apbdReport.totalExpenses).toLocaleString()}jt
									</Text>
								</Group>
							</Box>
						</Card>
					</Grid.Col>
				</Grid>
			</Stack>
		</Box>
	);
};

export default KeuanganAnggaran;