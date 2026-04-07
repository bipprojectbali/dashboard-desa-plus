import {
	Box,
	Card,
	Grid,
	Group,
	Loader,
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
import { useEffect, useState } from "react";
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
import { apiClient } from "@/utils/api-client";

// Sektor Unggulan Data (Mock for now)
const sektorUnggulanData = [
	{ sektor: "Pertanian", value: 65 },
	{ sektor: "Perdagangan", value: 45 },
	{ sektor: "Industri", value: 38 },
	{ sektor: "Jasa", value: 52 },
];

interface AgeData {
	ageRange: string;
	total: number;
}

interface JobData {
	job: string;
	total: number;
}

interface ReligionData {
	name: string;
	value: number;
	color: string;
}

interface BanjarData {
	id: string;
	name: string;
	totalPopulation: number;
	totalKK: number;
	totalPoor: number;
}

interface ReligionResponse {
	religion: string;
	_count: {
		_all: number;
	};
}

interface OccupationResponse {
	occupation: string | null;
	_count: {
		_all: number;
	};
}

interface AgeGroupResponse {
	range: string;
	count: number | string;
}

const DemografiPekerjaan = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [stats, setStats] = useState({
		total: 0,
		heads: 0,
		poor: 0,
	});
	const [ageData, setAgeData] = useState<AgeData[]>([]);
	const [jobData, setJobData] = useState<JobData[]>([]);
	const [religionData, setReligionData] = useState<ReligionData[]>([]);
	const [banjarData, setBanjarData] = useState<BanjarData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [statsRes, banjarRes, demoRes] = await Promise.all([
					apiClient.GET("/api/resident/stats"),
					apiClient.GET("/api/resident/banjar-stats"),
					apiClient.GET("/api/resident/demographics"),
				]);

				if (statsRes.data?.data) setStats(statsRes.data.data);
				if (banjarRes.data?.data)
					setBanjarData(banjarRes.data.data as BanjarData[]);
				if (demoRes.data?.data) {
					const { religion, occupation, ageGroups } = demoRes.data.data;

					const religionColors: Record<string, string> = {
						HINDU: "#EF4444",
						ISLAM: "#3B82F6",
						KRISTEN: "#22C55E",
						KATOLIK: "#A855F7",
						BUDDHA: "#FACC15",
						KONGHUCU: "#F97316",
						LAINNYA: "#94A3B8",
					};

					setReligionData(
						(religion as ReligionResponse[]).map((r) => ({
							name: r.religion,
							value: r._count._all,
							color: religionColors[r.religion] || "#94A3B8",
						})),
					);

					setJobData(
						(occupation as OccupationResponse[]).map((o) => ({
							job: o.occupation || "Lainnya",
							total: o._count._all,
						})),
					);

					setAgeData(
						(ageGroups as AgeGroupResponse[]).map((a) => ({
							ageRange: a.range,
							total: Number(a.count),
						})),
					);
				}
			} catch (error) {
				console.error("Failed to fetch demografi data", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: "Total Penduduk",
			value: stats.total.toLocaleString(),
			subtitle: "Aktif terdaftar",
			icon: Users,
		},
		{
			id: 2,
			title: "Kepala Keluarga",
			value: stats.heads.toLocaleString(),
			subtitle: "Total KK",
			icon: Home,
		},
		{
			id: 3,
			title: "Kelahiran",
			value: "0",
			subtitle: "Tahun ini",
			icon: Baby,
		},
		{
			id: 4,
			title: "Kemiskinan",
			value: stats.poor.toLocaleString(),
			subtitle: "Keluarga Prasejahtera",
			trend: "positive",
			icon: TrendingDown,
		},
	];

	// Dynamic Stats Data (Mock for now as no records in DB yet)
	const dynamicStats = [
		{
			title: "Kelahiran",
			value: "0",
			icon: Baby,
			color: "#22C55E",
		},
		{
			title: "Kematian",
			value: "0",
			icon: TrendingDown,
			color: "#EF4444",
		},
		{
			title: "Pindah Masuk",
			value: "0",
			icon: Users,
			color: "#3B82F6",
		},
		{
			title: "Pindah Keluar",
			value: "0",
			icon: Users,
			color: "#3B82F6",
		},
	];

	return (
		<Stack gap={{ base: "md", md: "lg" }}>
			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter={{ base: "xs", md: "md" }}>
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
			<Grid gutter={{ base: "xs", md: "lg" }}>
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
							{loading ? (
								<Group justify="center" align="center" h="100%">
									<Loader />
								</Group>
							) : (
								<BarChart data={ageData}>
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
										fill="#396aaaff"
										radius={[8, 8, 0, 0]}
										maxBarSize={40}
									/>
								</BarChart>
							)}
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
							{loading ? (
								<Group justify="center" align="center" h="100%">
									<Loader />
								</Group>
							) : (
								<BarChart data={jobData} layout="vertical">
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
										fill="#396aaaff"
										radius={[0, 8, 8, 0]}
										maxBarSize={30}
									/>
								</BarChart>
							)}
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
							{dynamicStats.map((stat) => (
								<Grid.Col key={stat.title} span={6}>
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
			<Grid gutter={{ base: "xs", md: "lg" }}>
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
							{loading ? (
								<Group justify="center" align="center" h="100%">
									<Loader />
								</Group>
							) : (
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
										{religionData.map((entry) => (
											<Cell key={`cell-${entry.name}`} fill={entry.color} />
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
							)}
						</ResponsiveContainer>
						<Stack gap="xs" mt="md">
							{!loading &&
								religionData.map((item) => (
									<Group key={item.name} justify="space-between">
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
							{loading ? (
								<Group justify="center" py="xl">
									<Loader />
								</Group>
							) : (
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
										{banjarData.map((item) => (
											<tr
												key={item.id}
												style={{
													backgroundColor:
														banjarData.indexOf(item) % 2 === 0
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
													{item.name}
												</td>
												<td
													style={{
														padding: "10px 8px",
														textAlign: "right",
														fontSize: "13px",
														color: dark ? "#E2E8F0" : "#1E293B",
													}}
												>
													{(item.totalPopulation || 0).toLocaleString()}
												</td>
												<td
													style={{
														padding: "10px 8px",
														textAlign: "right",
														fontSize: "13px",
														color: dark ? "#E2E8F0" : "#1E293B",
													}}
												>
													{(item.totalKK || 0).toLocaleString()}
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
													{(item.totalPoor || 0).toLocaleString()}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
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
									fill="#396aaaff"
									radius={[0, 8, 8, 0]}
									maxBarSize={40}
								>
									{sektorUnggulanData.map((entry) => (
										<Cell key={`cell-${entry.sektor}`} fill="#396aaaff" />
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
