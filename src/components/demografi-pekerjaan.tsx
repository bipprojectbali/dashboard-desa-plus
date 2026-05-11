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
import { useCallback, useEffect, useState } from "react";
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
import { useSnapshot } from "valtio";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { i18nStore } from "@/store/i18n";
import { apiClient } from "@/utils/api-client";

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
	const { tampilkanGrid } = useSnapshot(i18nStore);

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

	// Fetch data function (can be called externally after sync)
	const fetchData = useCallback(async () => {
		try {
			console.log("📊 Fetching demografi data from internal API...");
			setLoading(true);

			// Fetch all data using Promise.allSettled for better resilience
			// If one endpoint fails, the others can still load
			const results = await Promise.allSettled([
				apiClient.GET("/api/demografi/summary", {}),
				apiClient.GET("/api/demografi/banjar", {}),
				apiClient.GET("/api/demografi/age", {}),
				apiClient.GET("/api/demografi/occupation", {}),
				apiClient.GET("/api/demografi/religion", {}),
				apiClient.GET("/api/demografi/births", {}),
				apiClient.GET("/api/demografi/deaths", {}),
				apiClient.GET("/api/demografi/migration", {}),
				apiClient.GET("/api/demografi/sectors", {}),
			]);

			// Helper to get value from settled promise
			const getVal = (index: number) => {
				const res = results[index];
				if (!res) return { data: null, error: "Result not found" };

				if (res.status === "fulfilled") {
					return res.value;
				}
				// Type narrowing: if not fulfilled, it must be rejected and have a reason
				const reason = (res as PromiseRejectedResult).reason;
				console.error(`❌ Request ${index} failed:`, reason);
				return { data: null, error: reason };
			};

			const summaryRes = getVal(0);
			const banjarRes = getVal(1);
			const ageRes = getVal(2);
			const jobRes = getVal(3);
			const religionRes = getVal(4);
			const birthsRes = getVal(5);
			const deathsRes = getVal(6);
			const migrationRes = getVal(7);
			const sectorRes = getVal(8);

			// Helper to parse response
			const parseRes = (res: any, name: string) => {
				if (!res || !res.data) {
					console.warn(`⚠️ No response or data for ${name}`);
					return null;
				}
				if (!res.data.success) {
					console.warn(
						`⚠️ Failed to fetch ${name}:`,
						res.data.error || res.error,
					);
					return null;
				}
				if (!res.data.data) {
					console.warn(`⚠️ No data field for ${name}`);
					return null;
				}
				console.log(`✅ ${name} data:`, res.data.data);
				return res.data.data;
			};

			// Parse Dashboard Summary
			const summaryData = parseRes(summaryRes, "Dashboard Summary");
			if (summaryData) {
				const s = summaryData.summary || {};
				setStats({
					total: s.totalPenduduk || summaryData.total || 0,
					heads: s.totalKK || summaryData.heads || 0,
					poor: s.totalKemiskinan || summaryData.poor || 0,
				});

				const d = summaryData.dinamika || {};
				if (d.kelahiran !== undefined) setBirths(d.kelahiran);
				if (d.kematian !== undefined) setDeaths(d.kematian);
				if (d.pindahMasuk !== undefined) {
					const inCount = Array.isArray(d.pindahMasuk)
						? d.pindahMasuk.length
						: d.pindahMasuk;
					setMoveIn(Number(inCount) || 0);
				}
				if (d.pindahKeluar !== undefined) {
					const outCount = Array.isArray(d.pindahKeluar)
						? d.pindahKeluar.length
						: d.pindahKeluar;
					setMoveOut(Number(outCount) || 0);
				}
			}

			// Parse Banjar Data
			const banjarList = parseRes(banjarRes, "Banjar Data");
			if (banjarList && Array.isArray(banjarList)) {
				// Sort by population or just take first 10 as "latest/top"
				setBanjarData(
					banjarList.slice(0, 10).map((b: any) => ({
						id: b.id || b._id || String(Math.random()),
						name: b.nama || b.name || "Unknown",
						totalPopulation: b.penduduk || b.totalPopulation || 0,
						totalKK: b.kk || b.totalKK || 0,
						totalPoor: b.miskin || b.totalPoor || 0,
					})),
				);
			}

			// Parse Age Distribution
			const ageList = parseRes(ageRes, "Age Distribution");
			if (ageList && Array.isArray(ageList)) {
				setAgeData(
					ageList.map((a: any) => ({
						ageRange:
							a.rentangUmur ||
							a.range ||
							a.ageRange ||
							a.kelompokUmur ||
							"Unknown",
						total: Number(a.jumlah || a.total || a.count || 0),
					})),
				);
			}

			// Parse Occupation Data
			const jobList = parseRes(jobRes, "Occupation Data");
			if (jobList && Array.isArray(jobList)) {
				setJobData(
					jobList.map((j: any) => ({
						job: j.pekerjaan || j.namaPekerjaan || j.job || "Lainnya",
						total: Number(
							j.jumlah ||
								j.total ||
								j.count ||
								Number(j.lakiLaki || 0) + Number(j.perempuan || 0) ||
								0,
						),
					})),
				);
			}

			// Parse Religion Distribution
			const religionList = parseRes(religionRes, "Religion Distribution");
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
						name: r.agama || r.religion || r.name || "Unknown",
						value: Number(r.jumlah || r.value || r.count || 0),
						color: religionColors[r.agama || r.religion || r.name] || "#94A3B8",
					})),
				);
			}

			// Parse Births
			const birthsList = parseRes(birthsRes, "Births Data");
			if (birthsList && Array.isArray(birthsList)) {
				setBirths(birthsList.length);
			}

			// Parse Deaths
			const deathsList = parseRes(deathsRes, "Deaths Data");
			if (deathsList && Array.isArray(deathsList)) {
				setDeaths(deathsList.length);
			}

			// Parse Migration
			const migrationList = parseRes(migrationRes, "Migration Data");
			if (migrationList && Array.isArray(migrationList)) {
				const moveInCount = migrationList.filter(
					(m: any) =>
						m.jenis === "MASUK" ||
						m.jenis === "masuk" ||
						m.type === "in" ||
						m.arah === "masuk",
				).length;
				const moveOutCount = migrationList.filter(
					(m: any) =>
						m.jenis === "KELUAR" ||
						m.jenis === "keluar" ||
						m.type === "out" ||
						m.arah === "keluar",
				).length;
				setMoveIn(moveInCount);
				setMoveOut(moveOutCount);
			}

			// Parse Sector Data
			let sectorList = parseRes(sectorRes, "Sector Data");
			if (sectorList) {
				if (!Array.isArray(sectorList) && typeof sectorList === "object") {
					const possibleArray =
						sectorList.data ||
						sectorList.list ||
						sectorList.sectors ||
						sectorList.items;
					if (Array.isArray(possibleArray)) {
						sectorList = possibleArray;
					}
				}

				if (Array.isArray(sectorList)) {
					console.log("📍 Mapping sector data:", sectorList);
					setSektorData(
						sectorList.map((s: any) => ({
							sektor:
								s.name ||
								s.nama ||
								s.sektor ||
								s.sektorUnggulan ||
								s.sektor_unggulan ||
								s.namaSektor ||
								"Unknown",
							value: Number(
								s.value ?? s.nilai ?? s.jumlah ?? s.total ?? s.count ?? 0,
							),
						})),
					);
				}
			}
		} catch (error) {
			console.error("❌ Failed to fetch demografi data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useAutoRefresh(fetchData);

	// Listen for sync complete event to refresh data
	useEffect(() => {
		const handleSyncComplete = () => {
			console.log("🔄 Sync complete event received, refreshing data...");
			setLoading(true);
			fetchData();
		};

		window.addEventListener("demografi-sync-complete", handleSyncComplete);
		return () => {
			window.removeEventListener("demografi-sync-complete", handleSyncComplete);
		};
	}, [fetchData]);

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
									{tampilkanGrid && (
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke={dark ? "#334155" : "#e5e7eb"}
										/>
									)}
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
							{loading ? (
								<Group justify="center" align="center" h="100%">
									<Loader />
								</Group>
							) : (
								<BarChart data={sektorData} layout="vertical">
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
									/>
									<YAxis
										type="category"
										dataKey="sektor"
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
							)}
						</ResponsiveContainer>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default DemografiPekerjaan;
