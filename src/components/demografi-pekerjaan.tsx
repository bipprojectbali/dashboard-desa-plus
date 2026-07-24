import {
	Alert,
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
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import {
	Baby,
	BarChart3,
	Building2,
	Home,
	PieChart as PieChartIcon,
	TrendingDown,
	Users,
} from "lucide-react";
import { useEffect } from "react";
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { CHART } from "@/theme";
import { apiClient } from "@/utils/api-client";

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

interface DemografiAll {
	stats: DashboardSummary;
	ageData: AgeData[];
	jobData: JobData[];
	religionData: ReligionData[];
	banjarData: BanjarData[];
	sektorData: SectorData[];
	births: number;
	deaths: number;
	moveIn: number;
	moveOut: number;
}

const EMPTY_DEMOGRAFI: DemografiAll = {
	stats: { total: 0, heads: 0, poor: 0 },
	ageData: [],
	jobData: [],
	religionData: [],
	banjarData: [],
	sektorData: [],
	births: 0,
	deaths: 0,
	moveIn: 0,
	moveOut: 0,
};

// Mengambil 9 endpoint demografi sekaligus dengan Promise.allSettled agar tahan
// terhadap kegagalan sebagian — hasil digabung ke satu objek untuk cache.
async function fetchDemografiAll(): Promise<DemografiAll> {
	const result: DemografiAll = {
		stats: { total: 0, heads: 0, poor: 0 },
		ageData: [],
		jobData: [],
		religionData: [],
		banjarData: [],
		sektorData: [],
		births: 0,
		deaths: 0,
		moveIn: 0,
		moveOut: 0,
	};

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

	const getVal = (index: number) => {
		const res = results[index];
		if (!res) return { data: null, error: "Result not found" };
		if (res.status === "fulfilled") return res.value;
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

	const parseRes = (res: any, name: string) => {
		if (!res || !res.data) return null;
		if (!res.data.success) {
			console.warn(`⚠️ Failed to fetch ${name}:`, res.data.error || res.error);
			return null;
		}
		if (!res.data.data) return null;
		return res.data.data;
	};

	// Parse Dashboard Summary
	const summaryData = parseRes(summaryRes, "Dashboard Summary");
	if (summaryData) {
		const s = summaryData.summary || {};
		result.stats = {
			total: s.totalPenduduk || summaryData.total || 0,
			heads: s.totalKK || summaryData.heads || 0,
			poor: s.totalKemiskinan || summaryData.poor || 0,
		};

		const d = summaryData.dinamika || {};
		if (d.kelahiran !== undefined) result.births = d.kelahiran;
		if (d.kematian !== undefined) result.deaths = d.kematian;
		if (d.pindahMasuk !== undefined) {
			const inCount = Array.isArray(d.pindahMasuk)
				? d.pindahMasuk.length
				: d.pindahMasuk;
			result.moveIn = Number(inCount) || 0;
		}
		if (d.pindahKeluar !== undefined) {
			const outCount = Array.isArray(d.pindahKeluar)
				? d.pindahKeluar.length
				: d.pindahKeluar;
			result.moveOut = Number(outCount) || 0;
		}
	}

	// Parse Banjar Data
	const banjarList = parseRes(banjarRes, "Banjar Data");
	if (banjarList && Array.isArray(banjarList)) {
		result.banjarData = banjarList.slice(0, 10).map((b: any) => ({
			id: b.id || b._id || String(Math.random()),
			name: b.nama || b.name || "Unknown",
			totalPopulation: b.penduduk || b.totalPopulation || 0,
			totalKK: b.kk || b.totalKK || 0,
			totalPoor: b.miskin || b.totalPoor || 0,
		}));
	}

	// Parse Age Distribution
	const ageList = parseRes(ageRes, "Age Distribution");
	if (ageList && Array.isArray(ageList)) {
		result.ageData = ageList.map((a: any) => ({
			ageRange:
				a.rentangUmur || a.range || a.ageRange || a.kelompokUmur || "Unknown",
			total: Number(a.jumlah || a.total || a.count || 0),
		}));
	}

	// Parse Occupation Data
	const jobList = parseRes(jobRes, "Occupation Data");
	if (jobList && Array.isArray(jobList)) {
		result.jobData = jobList.map((j: any) => ({
			job: j.pekerjaan || j.namaPekerjaan || j.job || "Lainnya",
			total: Number(
				j.jumlah ||
					j.total ||
					j.count ||
					Number(j.lakiLaki || 0) + Number(j.perempuan || 0) ||
					0,
			),
		}));
	}

	// Parse Religion Distribution
	const religionList = parseRes(religionRes, "Religion Distribution");
	if (religionList && Array.isArray(religionList)) {
		const religionColors: Record<string, string> = {
			HINDU: CHART.red,
			ISLAM: CHART.blue,
			KRISTEN: CHART.green,
			KATOLIK: CHART.grape,
			BUDDHA: CHART.amber,
			KONGHUCU: CHART.orange,
			LAINNYA: CHART.gray,
		};
		result.religionData = religionList.map((r: any) => ({
			name: r.agama || r.religion || r.name || "Unknown",
			value: Number(r.jumlah || r.value || r.count || 0),
			color: religionColors[r.agama || r.religion || r.name] || CHART.gray,
		}));
	}

	// Parse Births
	const birthsList = parseRes(birthsRes, "Births Data");
	if (birthsList && Array.isArray(birthsList)) {
		result.births = birthsList.length;
	}

	// Parse Deaths
	const deathsList = parseRes(deathsRes, "Deaths Data");
	if (deathsList && Array.isArray(deathsList)) {
		result.deaths = deathsList.length;
	}

	// Parse Migration
	const migrationList = parseRes(migrationRes, "Migration Data");
	if (migrationList && Array.isArray(migrationList)) {
		result.moveIn = migrationList.filter(
			(m: any) =>
				m.jenis === "MASUK" ||
				m.jenis === "masuk" ||
				m.type === "in" ||
				m.arah === "masuk",
		).length;
		result.moveOut = migrationList.filter(
			(m: any) =>
				m.jenis === "KELUAR" ||
				m.jenis === "keluar" ||
				m.type === "out" ||
				m.arah === "keluar",
		).length;
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
			if (Array.isArray(possibleArray)) sectorList = possibleArray;
		}
		if (Array.isArray(sectorList)) {
			result.sektorData = sectorList.map((s: any) => ({
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
			}));
		}
	}

	return result;
}

const DemografiPekerjaan = () => {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const {
		data = EMPTY_DEMOGRAFI,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["demografi", "all"], fetchDemografiAll, {
		autoRefresh: true,
	});
	const {
		stats,
		ageData,
		jobData,
		religionData,
		banjarData,
		sektorData,
		births,
		deaths,
		moveIn,
		moveOut,
	} = data;
	const error = isError
		? "Gagal memuat data demografi. Periksa koneksi dan coba lagi."
		: null;

	// Listen for sync complete event to refresh data
	useEffect(() => {
		const handleSyncComplete = () => {
			refetch();
		};

		window.addEventListener("demografi-sync-complete", handleSyncComplete);
		return () => {
			window.removeEventListener("demografi-sync-complete", handleSyncComplete);
		};
	}, [refetch]);

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: t.demografiPekerjaan.totalPenduduk,
			value: stats.total.toLocaleString(),
			subtitle: t.demografiPekerjaan.aktifTerdaftar,
			icon: Users,
		},
		{
			id: 2,
			title: t.demografiPekerjaan.kepalaKeluarga,
			value: stats.heads.toLocaleString(),
			subtitle: t.demografiPekerjaan.totalKk,
			icon: Home,
		},
		{
			id: 3,
			title: t.demografiPekerjaan.kelahiran,
			value: births.toString(),
			subtitle: t.demografiPekerjaan.tahunIni,
			icon: Baby,
		},
		{
			id: 4,
			title: t.demografiPekerjaan.kemiskinan,
			value: stats.poor.toLocaleString(),
			subtitle: t.demografiPekerjaan.keluargaPrasejahtera,
			trend: "positive" as const,
			icon: TrendingDown,
		},
	];

	// Dynamic Stats Data
	const dynamicStats = [
		{
			title: t.demografiPekerjaan.kelahiran,
			value: births.toString(),
			icon: Baby,
			color: CHART.green,
		},
		{
			title: t.demografiPekerjaan.kematian,
			value: deaths.toString(),
			icon: TrendingDown,
			color: CHART.red,
		},
		{
			title: t.demografiPekerjaan.pindahMasuk,
			value: moveIn.toString(),
			icon: Users,
			color: CHART.blue,
		},
		{
			title: t.demografiPekerjaan.pindahKeluar,
			value: moveOut.toString(),
			icon: Users,
			color: CHART.orange,
		},
	];

	const handleExport = () => {
		const a = document.createElement("a");
		a.href = "/api/demografi/export";
		a.download = `laporan-demografi-${new Date().toISOString().slice(0, 10)}.pdf`;
		a.click();
	};

	return (
		<Stack gap="lg">
			{/* {izinExportData && (
				<Group justify="flex-end">
					<Button
						variant="light"
						color="teal"
						size="sm"
						leftSection={<IconDownload size={16} />}
						onClick={handleExport}
					>
						Download Laporan
					</Button>
				</Group>
			)} */}
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
				{loading
					? Array.from({ length: 4 }).map((_, i) => (
							<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
								<Skeleton height={100} radius="xl" />
							</Grid.Col>
						))
					: kpiData.map((item) => (
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
													<TrendingDown size={14} color={CHART.green} />
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.pengelompokanUmur}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : ageData.length === 0 ? (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data kelompok umur.
								</Text>
							</Group>
						) : (
							<ResponsiveContainer width="100%" height={250}>
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
										itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
										labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
									/>
									<Bar
										dataKey="total"
										fill="#396aaaff"
										radius={[8, 8, 0, 0]}
										maxBarSize={40}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<Building2 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.demografiPekerjaan}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : jobData.length === 0 ? (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data demografi pekerjaan.
								</Text>
							</Group>
						) : (
							<ResponsiveContainer width="100%" height={250}>
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
										itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
										labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
									/>
									<Bar
										dataKey="total"
										fill="#396aaaff"
										radius={[0, 8, 8, 0]}
										maxBarSize={30}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.dinamikaPenduduk}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={160} radius="md" />
						) : (
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
						)}
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<PieChartIcon size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.distribusiAgama}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : religionData.length === 0 ? (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data distribusi agama.
								</Text>
							</Group>
						) : (
							<>
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
											stroke="none"
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
											itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
											labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
										/>
									</PieChart>
								</ResponsiveContainer>
								<Stack gap="xs" mt="md">
									{religionData.map((item) => (
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
							</>
						)}
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<Users size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.dataPerBanjar}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : banjarData.length === 0 ? (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data per banjar.
								</Text>
							</Group>
						) : (
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
												{t.demografiPekerjaan.banjar}
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
												{t.demografiPekerjaan.penduduk}
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
												{t.demografiPekerjaan.kk}
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
												{t.demografiPekerjaan.miskin}
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
														color: CHART.red,
														fontWeight: 600,
													}}
												>
													{(item.totalPoor || 0).toLocaleString()}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</Box>
						)}
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
							<ThemeIcon
								color="darmasaba-navy.7"
								variant="filled"
								size="sm"
								radius="sm"
							>
								<BarChart3 size={14} />
							</ThemeIcon>
							<Title order={4} c={dark ? "white" : "gray.9"}>
								{t.demografiPekerjaan.sektorUnggulan}
							</Title>
						</Group>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : sektorData.length === 0 ? (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data sektor unggulan.
								</Text>
							</Group>
						) : (
							<ResponsiveContainer width="100%" height={250}>
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
										itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
										labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
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
						)}
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default DemografiPekerjaan;
