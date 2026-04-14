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

// External API base URL
const externalApiUrl =
	(typeof import.meta.env !== "undefined" &&
		import.meta.env?.VITE_DESA_API_URL) ||
	"https://desa-darmasaba-stg.wibudev.com";

// Data Interfaces
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

interface SectorData {
	sektor: string;
	value: number;
}

interface DashboardSummary {
	total: number;
	heads: number;
	poor: number;
}

const DemografiPekerjaan = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [stats, setStats] = useState<DashboardSummary>({
		total: 0,
		heads: 0,
		poor: 0,
	});
	const [ageData, setAgeData] = useState<AgeData[]>([]);
	const [jobData, setJobData] = useState<JobData[]>([]);
	const [religionData, setReligionData] = useState<ReligionData[]>([]);
	const [banjarData, setBanjarData] = useState<BanjarData[]>([]);
	const [sektorData, setSektorData] = useState<SectorData[]>([]);
	const [loading, setLoading] = useState(true);

	// Dynamic stats
	const [births, setBirths] = useState(0);
	const [deaths, setDeaths] = useState(0);
	const [moveIn, setMoveIn] = useState(0);
	const [moveOut, setMoveOut] = useState(0);

	useEffect(() => {
		async function fetchData() {
			try {
				console.log("📊 Fetching demografi data from external API...");

				// Fetch all data in parallel
				const [
					summaryRes,
					banjarRes,
					ageRes,
					jobRes,
					religionRes,
					birthsRes,
					deathsRes,
					migrationRes,
					sectorRes,
				] = await Promise.all([
					fetch(`${externalApiUrl}/api/kependudukan/dashboard/summary`),
					fetch(`${externalApiUrl}/api/kependudukan/data-banjar`),
					fetch(`${externalApiUrl}/api/kependudukan/distribusi-umur`),
					fetch(`${externalApiUrl}/api/ekonomi/demografi-pekerjaan`),
					fetch(`${externalApiUrl}/api/kependudukan/distribusi-agama`),
					fetch(`${externalApiUrl}/api/kesehatan/kelahiran/findMany`),
					fetch(`${externalApiUrl}/api/kesehatan/kematian/findMany`),
					fetch(`${externalApiUrl}/api/kependudukan/migrasi-penduduk`),
					fetch(`${externalApiUrl}/api/ekonomi/sektor-unggulan-desa`),
				]);

				// Helper to parse response
				const parseRes = async (res: Response, name: string) => {
					if (!res.ok) {
						console.warn(`⚠️ Failed to fetch ${name}: ${res.status}`);
						return null;
					}
					const json = await res.json();
					if (!json.success || !json.data) {
						console.warn(`⚠️ No data for ${name}`);
						return null;
					}
					console.log(`✅ ${name} data:`, json.data);
					return json.data;
				};

				// Parse Dashboard Summary
				const summaryData = await parseRes(summaryRes, "Dashboard Summary");
				if (summaryData) {
					setStats({
						total: summaryData.total || 0,
						heads: summaryData.heads || 0,
						poor: summaryData.poor || 0,
					});
				}

				// Parse Banjar Data
				const banjarList = await parseRes(banjarRes, "Banjar Data");
				if (banjarList && Array.isArray(banjarList)) {
					setBanjarData(
						banjarList.map((b: any) => ({
							id: b.id || b._id || String(Math.random()),
							name: b.name || b.nama || "Unknown",
							totalPopulation: b.totalPopulation || b.totalPenduduk || 0,
							totalKK: b.totalKK || b.jumlahKK || 0,
							totalPoor: b.totalPoor || b.jumlahMiskin || 0,
						})),
					);
				}

				// Parse Age Distribution
				const ageList = await parseRes(ageRes, "Age Distribution");
				if (ageList && Array.isArray(ageList)) {
					setAgeData(
						ageList.map((a: any) => ({
							ageRange: a.range || a.ageRange || a.kelompokUmur || "Unknown",
							total: Number(a.total || a.count || a.jumlah || 0),
						})),
					);
				}

				// Parse Occupation Data
				const jobList = await parseRes(jobRes, "Occupation Data");
				if (jobList && Array.isArray(jobList)) {
					setJobData(
						jobList.map((j: any) => ({
							job: j.job || j.pekerjaan || j.namaPekerjaan || "Lainnya",
							total: Number(j.total || j.count || j.jumlah || 0),
						})),
					);
				}

				// Parse Religion Distribution
				const religionList = await parseRes(
					religionRes,
					"Religion Distribution",
				);
				if (religionList && Array.isArray(religionList)) {
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
						religionList.map((r: any) => ({
							name: r.name || r.agama || r.religion || "Unknown",
							value: Number(r.value || r.count || r.jumlah || 0),
							color:
								religionColors[r.name || r.agama || r.religion] || "#94A3B8",
						})),
					);
				}

				// Parse Births
				const birthsList = await parseRes(birthsRes, "Births Data");
				if (birthsList && Array.isArray(birthsList)) {
					setBirths(birthsList.length);
				}

				// Parse Deaths
				const deathsList = await parseRes(deathsRes, "Deaths Data");
				if (deathsList && Array.isArray(deathsList)) {
					setDeaths(deathsList.length);
				}

				// Parse Migration
				const migrationList = await parseRes(migrationRes, "Migration Data");
				if (migrationList && Array.isArray(migrationList)) {
					const迁入 = migrationList.filter(
						(m: any) =>
							m.type === "in" ||
							m.jenis === "masuk" ||
							m.arah === "masuk",
					).length;
					const 迁出 = migrationList.filter(
						(m: any) =>
							m.type === "out" ||
							m.jenis === "keluar" ||
							m.arah === "keluar",
					).length;
					setMoveIn(迁入);
					setMoveOut(迁出);
				}

				// Parse Sector Data
				const sectorList = await parseRes(sectorRes, "Sector Data");
				if (sectorList && Array.isArray(sectorList)) {
					setSektorData(
						sectorList.map((s: any) => ({
							sektor: s.sektor || s.sektorUnggulan || s.namaSektor || "Unknown",
							value: Number(s.value || s.nilai || s.jumlah || 0),
						})),
					);
				}
			} catch (error) {
				console.error("❌ Failed to fetch demografi data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// Mock data fallback
	useEffect(() => {
		if (!loading) {
			let hasData = false;
			if (stats.total > 0) hasData = true;
			if (ageData.length > 0) hasData = true;
			if (jobData.length > 0) hasData = true;
			if (religionData.length > 0) hasData = true;

			if (!hasData) {
				console.log("⚠️ No data from API, using mock data fallback");
				setStats({ total: 3245, heads: 892, poor: 45 });
				setBanjarData([
					{ id: "1", name: "Banjar Dinas", totalPopulation: 845, totalKK: 234, totalPoor: 12 },
					{ id: "2", name: "Banjar Anyar", totalPopulation: 723, totalKK: 198, totalPoor: 8 },
					{ id: "3", name: "Banjar Tengah", totalPopulation: 654, totalKK: 178, totalPoor: 15 },
					{ id: "4", name: "Banjar Kelod", totalPopulation: 567, totalKK: 156, totalPoor: 7 },
					{ id: "5", name: "Banjar Kaja", totalPopulation: 456, totalKK: 126, totalPoor: 3 },
				]);
				setAgeData([
					{ ageRange: "0-16", total: 345 },
					{ ageRange: "17-25", total: 489 },
					{ ageRange: "26-35", total: 567 },
					{ ageRange: "36-45", total: 623 },
					{ ageRange: "46-55", total: 478 },
					{ ageRange: "56-65", total: 389 },
					{ ageRange: "65+", total: 354 },
				]);
				setJobData([
					{ job: "Petani", total: 892 },
					{ job: "Pedagang", total: 456 },
					{ job: "PNS", total: 234 },
					{ job: "Buruh", total: 378 },
					{ job: "Wiraswasta", total: 567 },
					{ job: "Nelayan", total: 123 },
					{ job: "Guru", total: 89 },
					{ job: "Lainnya", total: 156 },
				]);
				const religionColors: Record<string, string> = {
					HINDU: "#EF4444",
					ISLAM: "#3B82F6",
					KRISTEN: "#22C55E",
					KATOLIK: "#A855F7",
					BUDDHA: "#FACC15",
					LAINNYA: "#94A3B8",
				};
				setReligionData([
					{ name: "HINDU", value: 1850, color: religionColors.HINDU },
					{ name: "ISLAM", value: 980, color: religionColors.ISLAM },
					{ name: "KRISTEN", value: 245, color: religionColors.KRISTEN },
					{ name: "KATOLIK", value: 120, color: religionColors.KATOLIK },
					{ name: "BUDDHA", value: 45, color: religionColors.BUDDHA },
					{ name: "LAINNYA", value: 5, color: religionColors.LAINNYA },
				]);
				setBirths(12);
				setDeaths(3);
				setMoveIn(8);
				setMoveOut(5);
				setSektorData([
					{ sektor: "Pertanian", value: 65 },
					{ sektor: "Perdagangan", value: 45 },
					{ sektor: "Industri", value: 38 },
					{ sektor: "Jasa", value: 52 },
				]);
			}
		}
	}, [loading]);

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
			value: births.toString(),
			subtitle: "Tahun ini",
			icon: Baby,
		},
		{
			id: 4,
			title: "Kemiskinan",
			value: stats.poor.toLocaleString(),
			subtitle: "Keluarga Prasejahtera",
			trend: "positive" as const,
			icon: TrendingDown,
		},
	];

	// Dynamic Stats Data
	const dynamicStats = [
		{
			title: "Kelahiran",
			value: births.toString(),
			icon: Baby,
			color: "#22C55E",
		},
		{
			title: "Kematian",
			value: deaths.toString(),
			icon: TrendingDown,
			color: "#EF4444",
		},
		{
			title: "Pindah Masuk",
			value: moveIn.toString(),
			icon: Users,
			color: "#3B82F6",
		},
		{
			title: "Pindah Keluar",
			value: moveOut.toString(),
			icon: Users,
			color: "#F97316",
		},
	];

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
							<BarChart data={sektorData} layout="vertical">
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
									{sektorData.map((entry) => (
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
