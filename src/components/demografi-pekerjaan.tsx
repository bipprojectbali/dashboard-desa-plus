import {
	Badge,
	Box,
	Card,
	Grid,
	GridCol,
	Group,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	Baby,
	BarChart3,
	Building2,
	Home,
	PieChart as PieChartIcon,
	TrendingDown,
	Users,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// KPI Data
const kpiData = [
	{
		id: 1,
		title: "Total Penduduk",
		value: "5.634",
		subtitle: "Aktif terdaftar",
		icon: Users,
	},
	{
		id: 2,
		title: "Kepala Keluarga",
		value: "1.354",
		subtitle: "Total KK",
		icon: Home,
	},
	{
		id: 3,
		title: "Kelahiran",
		value: "23",
		subtitle: "Tahun ini",
		icon: Baby,
	},
	{
		id: 4,
		title: "Kemiskinan",
		value: "324",
		subtitle: "-10% dari tahun lalu",
		trend: "positive",
		icon: TrendingDown,
	},
];

// Age Distribution Data
const ageDistributionData = [
	{ ageRange: "17-25", total: 850 },
	{ ageRange: "26-35", total: 1200 },
	{ ageRange: "36-45", total: 1100 },
	{ ageRange: "46-55", total: 950 },
	{ ageRange: "56-65", total: 750 },
	{ ageRange: "65+", total: 484 },
];

// Job Distribution Data
const jobDistributionData = [
	{ job: "Sipil", total: 1200 },
	{ job: "Guru", total: 850 },
	{ job: "Petani", total: 950 },
	{ job: "Pedagang", total: 750 },
	{ job: "Wiraswasta", total: 984 },
];

// Religion Data
const religionData = [
	{ name: "Hindu", value: 4234, color: "#EF4444" },
	{ name: "Islam", value: 856, color: "#3B82F6" },
	{ name: "Kristen", value: 412, color: "#22C55E" },
	{ name: "Buddha", value: 202, color: "#FACC15" },
];

// Banjar Data
const banjarData = [
	{ banjar: "Darmasaba", population: 1200, kk: 300, poor: 45 },
	{ banjar: "Manesa", population: 950, kk: 240, poor: 32 },
	{ banjar: "Cabe", population: 800, kk: 200, poor: 28 },
	{ banjar: "Penenjoan", population: 1100, kk: 280, poor: 38 },
	{ banjar: "Baler Pasar", population: 984, kk: 250, poor: 42 },
	{ banjar: "Bucu", population: 600, kk: 184, poor: 25 },
];

// Dynamic Stats Data
const dynamicStats = [
	{
		title: "Kelahiran",
		value: "23",
		icon: Baby,
		color: "#22C55E",
	},
	{
		title: "Kematian",
		value: "12",
		icon: TrendingDown,
		color: "#EF4444",
	},
	{
		title: "Pindah Masuk",
		value: "45",
		icon: Users,
		color: "#3B82F6",
	},
	{
		title: "Pindah Keluar",
		value: "32",
		icon: Users,
		color: "#3B82F6",
	},
];

// Sektor Unggulan Data
const sektorUnggulanData = [
	{ sektor: "Pertanian", value: 65 },
	{ sektor: "Perdagangan", value: 45 },
	{ sektor: "Industri", value: 38 },
	{ sektor: "Jasa", value: 52 },
];

const DemografiPekerjaan = () => {
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
										{item.trend === "positive" && (
											<TrendingDown size={14} color="#22C55E" />
										)}
										<Text
											size="xs"
											c={
												item.trend === "positive"
													? "green"
													: dark
														? "gray.4"
														: "gray.5"
											}
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

			{/* ROW 2 - 3 COLUMNS */}
			<Grid gutter="lg">
				{/* LEFT: PENGELOMPOKAN UMUR */}
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
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								Pengelompokan Umur
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={250}>
							<BarChart data={ageDistributionData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={dark ? "#334155" : "#e5e7eb"}
								/>
								<XAxis
									dataKey="ageRange"
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
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
									labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
								/>
								<Bar
									dataKey="total"
									fill="#1E3A5F"
									radius={[8, 8, 0, 0]}
									maxBarSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</Grid.Col>

				{/* CENTER: DEMOGRAFI PEKERJAAN */}
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
								<Building2 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								Demografi Pekerjaan
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={250}>
							<BarChart data={jobDistributionData} layout="vertical">
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
								/>
								<YAxis
									type="category"
									dataKey="job"
									axisLine={false}
									tickLine={false}
									tick={{
										fill: dark ? "#E2E8F0" : "#374151",
										fontSize: 12,
									}}
									width={90}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
								/>
								<Bar
									dataKey="total"
									fill="#1E3A5F"
									radius={[0, 8, 8, 0]}
									maxBarSize={30}
								/>
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</Grid.Col>

				{/* RIGHT: STATISTIK DINAMIKA PENDUDUK */}
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
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								Dinamika Penduduk
							</Title>
						</Group>
						<Grid gutter="sm">
							{dynamicStats.map((stat, index) => (
								<Grid.Col key={index} span={6}>
									<Card
										p="sm"
										radius="lg"
										bg={dark ? "#334155" : "#F1F5F9"}
										style={{
											transition: "transform 0.15s ease",
											cursor: "pointer",
										}}
									>
										<Stack gap={2} align="center">
											<ThemeIcon
												color={stat.color}
												variant="filled"
												size="md"
												radius="lg"
											>
												<stat.icon size={14} />
											</ThemeIcon>
											<Text size="xs" c="dimmed" ta="center">
												{stat.title}
											</Text>
											<Text
												size="lg"
												fw={700}
												c={stat.color}
												style={{ lineHeight: 1 }}
											>
												{stat.value}
											</Text>
										</Stack>
									</Card>
								</Grid.Col>
							))}
						</Grid>
					</Card>
				</Grid.Col>
			</Grid>

			{/* ROW 3 - 3 COLUMNS */}
			<Grid gutter="lg">
				{/* LEFT: DISTRIBUSI AGAMA */}
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
								Distribusi Agama
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={religionData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={90}
									paddingAngle={2}
									dataKey="value"
								>
									{religionData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
						<Stack gap="xs" mt="md">
							{religionData.map((item, index) => (
								<Group key={index} justify="space-between">
									<Group gap="xs">
										<Box
											w={10}
											h={10}
											style={{
												backgroundColor: item.color,
												borderRadius: 2,
											}}
										/>
										<Text size="sm" c={dark ? "white" : "gray.7"}>
											{item.name}
										</Text>
									</Group>
									<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
										{item.value.toLocaleString()}
									</Text>
								</Group>
							))}
						</Stack>
					</Card>
				</Grid.Col>

				{/* CENTER: DATA PER BANJAR */}
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
								<Users size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								Data per Banjar
							</Title>
						</Group>
						<Box style={{ overflowX: "auto" }}>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr>
										<th
											style={{
												textAlign: "left",
												padding: "8px",
												fontSize: "12px",
												fontWeight: 600,
												color: dark ? "#94A3B8" : "#64748B",
												borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
											}}
										>
											Banjar
										</th>
										<th
											style={{
												textAlign: "right",
												padding: "8px",
												fontSize: "12px",
												fontWeight: 600,
												color: dark ? "#94A3B8" : "#64748B",
												borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
											}}
										>
											Penduduk
										</th>
										<th
											style={{
												textAlign: "right",
												padding: "8px",
												fontSize: "12px",
												fontWeight: 600,
												color: dark ? "#94A3B8" : "#64748B",
												borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
											}}
										>
											KK
										</th>
										<th
											style={{
												textAlign: "right",
												padding: "8px",
												fontSize: "12px",
												fontWeight: 600,
												color: dark ? "#94A3B8" : "#64748B",
												borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
											}}
										>
											Miskin
										</th>
									</tr>
								</thead>
								<tbody>
									{banjarData.map((item, index) => (
										<tr
											key={index}
											style={{
												backgroundColor:
													index % 2 === 0
														? dark
															? "#334155"
															: "#F8FAFC"
														: "transparent",
												transition: "background-color 0.15s ease",
											}}
										>
											<td
												style={{
													padding: "10px 8px",
													fontSize: "13px",
													fontWeight: 500,
													color: dark ? "#E2E8F0" : "#1E293B",
												}}
											>
												{item.banjar}
											</td>
											<td
												style={{
													padding: "10px 8px",
													textAlign: "right",
													fontSize: "13px",
													color: dark ? "#E2E8F0" : "#1E293B",
												}}
											>
												{item.population.toLocaleString()}
											</td>
											<td
												style={{
													padding: "10px 8px",
													textAlign: "right",
													fontSize: "13px",
													color: dark ? "#E2E8F0" : "#1E293B",
												}}
											>
												{item.kk.toLocaleString()}
											</td>
											<td
												style={{
													padding: "10px 8px",
													textAlign: "right",
													fontSize: "13px",
													color: "#EF4444",
													fontWeight: 600,
												}}
											>
												{item.poor.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</Box>
					</Card>
				</Grid.Col>

				{/* RIGHT: STATISTIK SEKTOR UNGGULAN */}
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
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								Sektor Unggulan
							</Title>
						</Group>
						<ResponsiveContainer width="100%" height={250}>
							<BarChart data={sektorUnggulanData} layout="vertical">
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
								/>
								<YAxis
									type="category"
									dataKey="sektor"
									axisLine={false}
									tickLine={false}
									tick={{
										fill: dark ? "#E2E8F0" : "#374151",
										fontSize: 12,
									}}
									width={90}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
								/>
								<Bar
									dataKey="value"
									fill="#1E3A5F"
									radius={[0, 8, 8, 0]}
									maxBarSize={40}
								>
									{sektorUnggulanData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill="#1E3A5F" />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default DemografiPekerjaan;
