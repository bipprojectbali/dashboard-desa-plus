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
	Line,
	LineChart,
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

interface TrendData {
	label: string;
	total: number;
}

interface InnovationIdea {
	id: string;
	name: string;
	alamat: string;
	namaIde: string;
	deskripsi: string;
	masalah: string;
	benefit: string;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
}

interface PelayananPerJenisData {
	jenis: string;
	jumlah: number;
}

interface PengajuanTerbaruData {
	jenis: string;
	status: string;
	namaWarga: string;
	durasi: string;
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
			return "orange";
		case "antrian":
			return "orange";
		case "diterima":
			return "blue";
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
	const [pengajuanTerbaru, setPengajuanTerbaru] = useState<
		PengajuanTerbaruData[]
	>([]);
	const [trendData, setTrendData] = useState<TrendData[]>([]);
	const [suratData, setSuratData] = useState<PelayananPerJenisData[]>([]);
	const [innovationIdeas, setInnovationIdeas] = useState<InnovationIdea[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const nocApiToken = getEnv("NOC_API_TOKEN", "");

				// Fetch all NOC APIs in parallel
				const [
					pengaduanResponse,
					pelayananResponse,
					pengajuanTerbaruResponse,
					pengajuanHistoryResponse,
				] = await Promise.all([
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
					fetch("/api/noc/pengajuan-terbaru", {
						method: "GET",
						headers: {
							Authorization: `Bearer ${nocApiToken}`,
							"Content-Type": "application/json",
						},
					}),
					fetch("/api/noc/pengaduan-history", {
						method: "GET",
						headers: {
							Authorization: `Bearer ${nocApiToken}`,
							"Content-Type": "application/json",
						},
					}),
				]);

				let pengaduanData: PengaduanCountData | null = null;
				let pelayananData: PelayananPerJenisData[] = [];
				let pengajuanTerbaruData: PengajuanTerbaruData[] = [];
				let pengajuanHistoryData: TrendData[] = [];

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

				if (pengajuanTerbaruResponse.ok) {
					pengajuanTerbaruData = await pengajuanTerbaruResponse.json();
					console.log("📊 Pengajuan terbaru response:", pengajuanTerbaruData);
					setPengajuanTerbaru(pengajuanTerbaruData);
				}

				if (pengajuanHistoryResponse.ok) {
					pengajuanHistoryData = await pengajuanHistoryResponse.json();
					console.log("📊 Pengajuan history response:", pengajuanHistoryData);
					setTrendData(pengajuanHistoryData);
				}

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
				}

				// Fetch innovation ideas from external Desa API
				const desaApiUrl = getEnv(
					"VITE_DESA_API_URL",
					"https://desa-darmasaba-stg.wibudev.com",
				);
				const innovationResponse = await fetch(
					`${desaApiUrl}/api/inovasi/ajukanideinovatif/find-many`,
				);

				if (innovationResponse.ok) {
					const innovationData = await innovationResponse.json();
					console.log("💡 Innovation ideas response:", innovationData);

					if (innovationData.success && innovationData.data) {
						// Take only first 3 for display
						setInnovationIdeas(innovationData.data.slice(0, 3));
					}
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

			{/* MAIN CHART - TREN PENGAJUAN */}
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
						Tren Pengaduan
					</Title>
				</Group>
				<ResponsiveContainer width="100%" height={300}>
					{loading ? (
						<Group justify="center" align="center" h="100%">
							<Loader />
						</Group>
					) : trendData.length > 0 ? (
						<LineChart data={trendData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
							<XAxis
								dataKey="label"
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
									`${value ?? 0} pengajuan`,
									"Jumlah",
								]}
							/>
							<Line
								type="monotone"
								dataKey="total"
								stroke="#396aaaff"
								strokeWidth={2}
								dot={{
									fill: "#1E3A5F",
									strokeWidth: 2,
									r: 4,
								}}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					) : (
						<Group justify="center" align="center" h="100%">
							<Text size="sm" c="dimmed">
								Tidak ada data tren pengaduan
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
								allowDecimals={false}
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
									`${Math.round(value ?? 0)} surat`,
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
							) : pengajuanTerbaru.length > 0 ? (
								pengajuanTerbaru.map((item, index) => (
									<Card
										key={index}
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
													{item.jenis}
												</Text>
												<Text size="sm" c="dimmed">
													{item.namaWarga}
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
													{item.durasi}
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

				{/* RIGHT: AJUKAN IDE INOVATIF */}
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
							Ajukan Ide Inovatif
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
										<Stack gap={0}>
											<Text fw={600} c={dark ? "white" : "gray.9"}>
												{item.namaIde}
											</Text>
											<Text size="sm" c="dimmed">
												{item.name}
											</Text>
											<Text
												size="xs"
												c="dimmed"
												mt={2}
												style={{
													overflow: "hidden",
													textOverflow: "ellipsis",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
												}}
												dangerouslySetInnerHTML={{
													__html:
														item.deskripsi.length > 100
															? `${item.deskripsi.substring(0, 100)}...`
															: item.deskripsi,
												}}
											/>
											<Text size="xs" c="dimmed" mt={4}>
												{dayjs(item.createdAt).fromNow()}
											</Text>
										</Stack>
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
