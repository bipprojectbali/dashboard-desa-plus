import {
	Badge,
	Button,
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CheckCircle, Clock, FileText, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { apiClient } from "@/utils/api-client";
import { getEnv } from "@/utils/env";

dayjs.extend(relativeTime);

interface PengaduanCountData {
	antrian: number;
	diterima: number;
	dikerjakan: number;
	ditolak: number;
	selesai: number;
	aktif: number;
	total: number;
}

interface ChartData {
	name: string;
	value: number;
	color: string;
}

interface InnovationIdea {
	id: string;
	title: string;
	description: string;
	category: string;
	submitterName: string;
	submitterContact?: string;
	status: string;
	createdAt: string;
}

interface PelayananPerJenisData {
	jenis: string;
	jumlah: number;
}

interface Complaint {
	id: string;
	title: string;
	category: string;
	status: string;
	createdAt: string;
}

const getStatusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "baru":
			return "red";
		case "diproses":
		case "proses":
			return "blue";
		case "selesai":
			return "green";
		default:
			return "gray";
	}
};

// Helper function to truncate long text
const truncateText = (text: string, maxLength: number) => {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength)}...`;
};

const PengaduanLayananPublik = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [stats, setStats] = useState({
		total: 0,
		baru: 0,
		proses: 0,
		selesai: 0,
	});
	const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
	const [chartData, setChartData] = useState<ChartData[]>([]);
	const [suratData, setSuratData] = useState<PelayananPerJenisData[]>([]);
	const [innovationIdeas, setInnovationIdeas] = useState<InnovationIdea[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const nocApiToken = getEnv("NOC_API_TOKEN", "");

				// Fetch pengaduan count and pelayanan per jenis in parallel
				const [pengaduanResponse, pelayananResponse] = await Promise.all([
					fetch("/api/noc/pengaduan-count", {
						method: "GET",
						headers: {
							Authorization: `Bearer ${nocApiToken}`,
							"Content-Type": "application/json",
						},
					}),
					fetch("/api/noc/pelayanan-perjenis", {
						method: "GET",
						headers: {
							Authorization: `Bearer ${nocApiToken}`,
							"Content-Type": "application/json",
						},
					}),
				]);

				let pengaduanData: PengaduanCountData | null = null;
				let pelayananData: PelayananPerJenisData[] = [];

				if (pengaduanResponse.ok) {
					pengaduanData = await pengaduanResponse.json();
					console.log("📊 Pengaduan count response:", pengaduanData);
				}

				if (pelayananResponse.ok) {
					pelayananData = await pelayananResponse.json();
					console.log("📊 Pelayanan per jenis response:", pelayananData);

					// Only take top 5 with highest count for better chart display
					const sortedData = [...pelayananData]
						.sort((a, b) => b.jumlah - a.jumlah)
						.slice(0, 5);

					setSuratData(sortedData);
				}

				// Fetch recent complaints and innovation ideas
				const [recentRes, ideasRes] = await Promise.all([
					apiClient.GET("/api/complaint/recent"),
					apiClient.GET("/api/complaint/innovation-ideas"),
				]);

				// Map NOC API data to stats
				if (pengaduanData) {
					const mappedStats = {
						total: pengaduanData.total ?? 0,
						baru: pengaduanData.antrian ?? 0,
						proses:
							(pengaduanData.diterima ?? 0) + (pengaduanData.dikerjakan ?? 0),
						selesai: pengaduanData.selesai ?? 0,
						ditolak: pengaduanData.ditolak ?? 0,
						aktif: pengaduanData.aktif ?? 0,
					};
					setStats(mappedStats);

					// Create chart data from status counts
					const chartItems: ChartData[] = [
						{
							name: "Antrian",
							value: pengaduanData.antrian ?? 0,
							color: "#EF4444",
						},
						{
							name: "Diterima",
							value: pengaduanData.diterima ?? 0,
							color: "#3B82F6",
						},
						{
							name: "Dikerjakan",
							value: pengaduanData.dikerjakan ?? 0,
							color: "#F59E0B",
						},
						{
							name: "Ditolak",
							value: pengaduanData.ditolak ?? 0,
							color: "#6B7280",
						},
						{
							name: "Selesai",
							value: pengaduanData.selesai ?? 0,
							color: "#10B981",
						},
					].filter((item) => item.value > 0); // Only show items with data

					setChartData(chartItems);
				}

				if (recentRes.data?.data) {
					setRecentComplaints(recentRes.data.data as Complaint[]);
				}
				if (ideasRes.data?.data) {
					setInnovationIdeas(ideasRes.data.data as InnovationIdea[]);
				}
			} catch (error) {
				console.error("Failed to fetch complaint data", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const summaryData = [
		{
			title: "Total Pengaduan",
			value: stats.total,
			subtitle: "Bulan ini",
			icon: MessageCircle,
			color: "#1E3A5F",
		},
		{
			title: "Baru",
			value: stats.baru,
			subtitle: "Belum diproses",
			icon: FileText,
			color: "#1E3A5F",
		},
		{
			title: "Diproses",
			value: stats.proses,
			subtitle: "Sedang ditangani",
			icon: Clock,
			color: "#1E3A5F",
		},
		{
			title: "Selesai",
			value: stats.selesai,
			subtitle: "Terselesaikan",
			icon: CheckCircle,
			color: "#1E3A5F",
		},
	];

	return (
		<Stack gap={"md"}>
			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter={{ base: "xs", md: "md" }}>
				{summaryData.map((item) => (
					<Grid.Col key={item.title} span={{ base: 12, sm: 6, lg: 3 }}>
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
							<Group justify="space-between" align="center" w="100%">
								<Stack gap={2}>
									<Text size="sm" c="dimmed">
										{item.title}
									</Text>
									<Text size="xl" fw={700} c={dark ? "white" : "gray.9"}>
										{loading ? <Loader size="xs" /> : item.value}
									</Text>
									<Text size="xs" c="dimmed">
										{item.subtitle}
									</Text>
								</Stack>
								<ThemeIcon
									color={item.color}
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

			{/* MAIN CHART - STATUS PENGAJUAN */}
			<Card
				p="md"
				radius="xl"
				withBorder
				bg={dark ? "#1E293B" : "white"}
				style={{
					borderColor: dark ? "#334155" : "white",
					boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				}}
			>
				<Group justify="space-between" mb="md">
					<Title order={4} c={dark ? "white" : "gray.9"}>
						Status Pengaduan
					</Title>
				</Group>
				<ResponsiveContainer width="100%" height={300}>
					{loading ? (
						<Group justify="center" align="center" h="100%">
							<Loader />
						</Group>
					) : chartData.length > 0 ? (
						<BarChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
								allowDecimals={false}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1E293B" : "white",
									borderColor: dark ? "#334155" : "#e5e7eb",
									borderRadius: "8px",
								}}
								labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
								formatter={(value: number | undefined) => [
									`${value ?? 0} pengaduan`,
									"Jumlah",
								]}
							/>
							<Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
						</BarChart>
					) : (
						<Group justify="center" align="center" h="100%">
							<Text size="sm" c="dimmed">
								Tidak ada data pengaduan
							</Text>
						</Group>
					)}
				</ResponsiveContainer>
			</Card>

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
				<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
					Surat Terbanyak
				</Title>
				<ResponsiveContainer width="100%" height={250}>
					{loading ? (
						<Group justify="center" align="center" h="100%">
							<Loader />
						</Group>
					) : suratData.length > 0 ? (
						<BarChart data={suratData} layout="vertical">
							<CartesianGrid
								strokeDasharray="3 3"
								horizontal={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
							<XAxis
								type="number"
								axisLine={false}
								tickLine={false}
								tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
							/>
							<YAxis
								type="category"
								dataKey="jenis"
								axisLine={false}
								tickLine={false}
								width={140}
								tick={{
									fill: dark ? "#E2E8F0" : "#374151",
									fontSize: 11,
								}}
								tickFormatter={(value) => truncateText(value, 25)}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1E293B" : "white",
									borderColor: dark ? "#334155" : "#e5e7eb",
									borderRadius: "8px",
									maxWidth: 300,
								}}
								labelStyle={{
									color: dark ? "#E2E8F0" : "#374151",
									fontSize: 12,
									fontWeight: 600,
								}}
								formatter={(value: any): [string, string] => [
									`${value ?? 0} surat`,
									"Jumlah",
								]}
							/>
							<Bar dataKey="jumlah" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
						</BarChart>
					) : (
						<Group justify="center" align="center" h="100%">
							<Text size="sm" c="dimmed">
								Tidak ada data surat
							</Text>
						</Group>
					)}
				</ResponsiveContainer>
			</Card>

			{/* BOTTOM SECTION - 2 COLUMNS */}
			<Grid gutter={{ base: "xs", md: "md" }}>
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
						<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
							Pengajuan Surat Terbaru
						</Title>
						<Stack gap="sm">
							{loading ? (
								<Group justify="center" py="xl">
									<Loader />
								</Group>
							) : recentComplaints.length > 0 ? (
								recentComplaints.map((item) => (
									<Card
										key={item.id}
										p="sm"
										radius="md"
										withBorder
										bg={dark ? "#334155" : "#F1F5F9"}
										style={{
											borderColor: "transparent",
											transition: "background-color 0.15s ease",
										}}
									>
										<Group justify="space-between">
											<Stack gap={0}>
												<Text fw={600} c={dark ? "white" : "gray.9"}>
													{item.title}
												</Text>
												<Text size="sm" c="dimmed">
													{item.category}
												</Text>
											</Stack>
											<Stack gap={0} align="flex-end">
												<Badge
													color={getStatusColor(item.status)}
													variant="light"
													radius="sm"
												>
													{item.status}
												</Badge>
												<Text size="xs" c="dimmed">
													{dayjs(item.createdAt).fromNow()}
												</Text>
											</Stack>
										</Group>
									</Card>
								))
							) : (
								<Text c="dimmed" ta="center">
									Tidak ada pengajuan terbaru
								</Text>
							)}
						</Stack>
					</Card>
				</Grid.Col>

				{/* RIGHT: AJUAN IDE INOVATIF */}
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
						<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
							Ajuan Ide Inovatif
						</Title>
						<Stack gap="sm">
							{loading ? (
								<Group justify="center" py="xl">
									<Loader />
								</Group>
							) : innovationIdeas.length > 0 ? (
								innovationIdeas.map((item) => (
									<Card
										key={item.id}
										p="sm"
										radius="md"
										withBorder
										bg={dark ? "#334155" : "#F1F5F9"}
										style={{
											borderColor: "transparent",
											transition: "background-color 0.15s ease",
										}}
									>
										<Group justify="space-between">
											<Stack gap={0}>
												<Text fw={600} c={dark ? "white" : "gray.9"}>
													{item.title}
												</Text>
												<Text size="sm" c="dimmed">
													{item.submitterName}
												</Text>
												<Text size="xs" c="dimmed">
													{dayjs(item.createdAt).fromNow()}
												</Text>
											</Stack>
											<Button
												size="xs"
												variant="light"
												color="darmasaba-blue"
												radius="md"
											>
												Detail
											</Button>
										</Group>
									</Card>
								))
							) : (
								<Text c="dimmed" ta="center">
									Tidak ada ide inovatif
								</Text>
							)}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default PengaduanLayananPublik;
