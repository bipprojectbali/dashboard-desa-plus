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
	Table,
	Progress,
} from "@mantine/core";
import { IconBabyCarriage, IconSkull, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { BarChart, PieChart } from "@mantine/charts";

// Sample Data
const kpiData = [
	{
		id: 1,
		title: "Total Penduduk",
		value: "5.634",
		sub: "Aktif terdaftar",
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
					d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
				/>
			</svg>
		),
	},
	{
		id: 2,
		title: "Kepala Keluarga",
		value: "1.354",
		sub: "Total KK",
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
					d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
				/>
			</svg>
		),
	},
	{
		id: 3,
		title: "Kelahiran",
		value: "23",
		sub: "Tahun ini",
		icon: (
			<IconBabyCarriage className="h-6 w-6 text-muted-foreground" />
		),
	},
	{
		id: 4,
		title: "Kemiskinan",
		value: "324",
		delta: "-10% dari tahun lalu",
		deltaType: "positive",
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
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
				/>
			</svg>
		),
	},
];

const ageDistributionData = [
	{ ageRange: "17-25", total: 850 },
	{ ageRange: "26-35", total: 1200 },
	{ ageRange: "36-45", total: 1100 },
	{ ageRange: "46-55", total: 950 },
	{ ageRange: "56-65", total: 750 },
	{ ageRange: "65+", total: 484 },
];

const jobDistributionData = [
	{ job: "Sipil", total: 1200 },
	{ job: "Guru", total: 850 },
	{ job: "Petani", total: 950 },
	{ job: "Pedagang", total: 750 },
	{ job: "Wiraswasta", total: 984 },
];

const religionData = [
	{ religion: "Hindu", total: 4234, color: "red" },
	{ religion: "Islam", total: 856, color: "blue" },
	{ religion: "Kristen", total: 412, color: "green" },
	{ religion: "Buddha", total: 202, color: "yellow" },
];

const banjarData = [
	{ banjar: "Banjar Darmasaba", population: 1200, kk: 300, poor: 45 },
	{ banjar: "Banjar Manesa", population: 950, kk: 240, poor: 32 },
	{ banjar: "Banjar Cabe", population: 800, kk: 200, poor: 28 },
	{ banjar: "Banjar Penenjoan", population: 1100, kk: 280, poor: 38 },
	{ banjar: "Banjar Baler Pasar", population: 984, kk: 250, poor: 42 },
	{ banjar: "Banjar Bucu", population: 600, kk: 184, poor: 25 },
];

const dynamicStats = [
	{ title: "Kelahiran", value: "23", icon: <IconBabyCarriage size={16} />, color: "green" },
	{ title: "Kematian", value: "12", icon: <IconSkull size={16} />, color: "red" },
	{ title: "Pindah Masuk", value: "45", icon: <IconArrowDown size={16} />, color: "blue" },
	{ title: "Pindah Keluar", value: "32", icon: <IconArrowUp size={16} />, color: "orange" },
];

const DemografiPekerjaan = () => {
	return (
		<Box className="space-y-6">
			<Stack gap="xl">
				<Group justify="space-between" align="center">
					<Title order={2} fw={700}>
						Demografi & Kependudukan
					</Title>
					<Button variant="filled">Export Data</Button>
				</Group>

				{/* KPI Cards */}
				<Grid gutter="lg">
					{kpiData.map((kpi) => (
						<Grid.Col key={kpi.id} span={{ base: 12, md: 6, lg: 3 }}>
							<Card shadow="sm" padding="lg" radius="md" withBorder>
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
									<Text size="xs" c="dimmed" mt={2}>
										{kpi.sub}
									</Text>
								)}
							</Card>
						</Grid.Col>
					))}
				</Grid>

				{/* Charts Section */}
				<Grid gutter="lg">
					{/* Grafik Pengelompokan Umur */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} fw={500} mb="md">
								Grafik Pengelompokan Umur
							</Title>
							<BarChart
								h={300}
								data={ageDistributionData}
								dataKey="ageRange"
								series={[{ name: 'total', color: 'darmasaba-navy' }]}
								withLegend
							/>
						</Card>
					</Grid.Col>

					{/* Demografi Pekerjaan */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} fw={500} mb="md">
								Demografi Pekerjaan
							</Title>
							<BarChart
								h={300}
								data={jobDistributionData}
								dataKey="job"
								series={[{ name: 'total', color: 'darmasaba-navy' }]}
								withLegend
							/>
						</Card>
					</Grid.Col>
				</Grid>

				{/* Agama & Data per Banjar */}
				<Grid gutter="lg">
					{/* Distribusi Agama */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} fw={500} mb="md">
								Distribusi Agama
							</Title>
							<PieChart
								h={300}
								data={religionData.map(item => ({
									name: item.religion,
									value: item.total,
									color: item.color
								}))}
								withLabels
								withLabelsLine
								labelsPosition="outside"
								labelsType="percent"
							/>
						</Card>
					</Grid.Col>

					{/* Data per Banjar */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} fw={500} mb="md">
								Data per Banjar
							</Title>
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Banjar</Table.Th>
										<Table.Th>Penduduk</Table.Th>
										<Table.Th>KK</Table.Th>
										<Table.Th>Miskin</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{banjarData.map((item, index) => (
										<Table.Tr key={index}>
											<Table.Td>{item.banjar}</Table.Td>
											<Table.Td>{item.population.toLocaleString()}</Table.Td>
											<Table.Td>{item.kk.toLocaleString()}</Table.Td>
											<Table.Td>
												<Text c="red">{item.poor.toLocaleString()}</Text>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Card>
					</Grid.Col>
				</Grid>

				{/* Statistik Dinamika Penduduk */}
				<Card shadow="sm" padding="lg" radius="md" withBorder>
					<Title order={3} fw={500} mb="md">
						Statistik Dinamika Penduduk
					</Title>
					<Grid gutter="md">
						{dynamicStats.map((stat, index) => (
							<Grid.Col key={index} span={{ base: 12, md: 3 }}>
								<Card shadow="sm" padding="lg" radius="md" withBorder>
									<Group justify="space-between" align="center">
										<Box>
											<Text size="sm" fw={500} c="dimmed">
												{stat.title}
											</Text>
											<Title order={4} fw={700} c={stat.color}>
												{stat.value}
											</Title>
										</Box>
										<Box c={stat.color}>
											{stat.icon}
										</Box>
									</Group>
								</Card>
							</Grid.Col>
						))}
					</Grid>
				</Card>
			</Stack>
		</Box>
	);
};

export default DemografiPekerjaan;