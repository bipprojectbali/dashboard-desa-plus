import {
	Alert,
	Badge,
	Button,
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CheckCircle, Clock, FileText, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { useSnapshot } from "valtio";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { apiClient } from "@/utils/api-client";
import type { InnovationIdea as InnovationIdeaType } from "./layanan/innovation-idea-modal";
import { InnovationIdeaModal } from "./layanan/innovation-idea-modal";

dayjs.extend(relativeTime);

interface TrendData {
	bulan: string;
	jumlah: number;
}

type InnovationIdea = InnovationIdeaType;

interface ServiceStat {
	jenis: string;
	jumlah: number;
}

interface ServiceApiResponse {
	letterType: string;
	_count: {
		_all: number;
	};
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

const PengaduanLayananPublik = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const [stats, setStats] = useState({
		total: 0,
		baru: 0,
		proses: 0,
		selesai: 0,
	});
	const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
	const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
	const [trendData, setTrendData] = useState<TrendData[]>([]);
	const [innovationIdeas, setInnovationIdeas] = useState<InnovationIdea[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedIdea, setSelectedIdea] = useState<InnovationIdea | null>(null);
	const [ideaModalOpen, setIdeaModalOpen] = useState(false);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [statsRes, recentRes, serviceRes, trendsRes, ideasRes] =
				await Promise.all([
					apiClient.GET("/api/complaint/stats"),
					apiClient.GET("/api/complaint/recent"),
					apiClient.GET("/api/complaint/service-stats"),
					apiClient.GET("/api/complaint/trends"),
					apiClient.GET("/api/complaint/innovation-ideas"),
				]);

			if (statsRes.data?.data) setStats(statsRes.data.data);
			if (recentRes.data?.data)
				setRecentComplaints(recentRes.data.data as Complaint[]);
			if (serviceRes.data?.data) {
				const mappedService = (
					serviceRes.data.data as ServiceApiResponse[]
				).map((item) => ({
					jenis: item.letterType,
					jumlah: item._count?._all || 0,
				}));
				setServiceStats(mappedService);
			}
			if (trendsRes.data?.data) {
				const mappedTrends = (
					trendsRes.data.data as { month: string; count: number }[]
				).map((item) => ({
					bulan: item.month,
					jumlah: item.count,
				}));
				setTrendData(mappedTrends);
			}
			if (ideasRes.data?.data) {
				setInnovationIdeas(ideasRes.data.data as InnovationIdea[]);
			}
		} catch (err) {
			console.error("Failed to fetch complaint data", err);
			setError("Gagal memuat data pengaduan. Periksa koneksi dan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useAutoRefresh(fetchData);

	const summaryData = [
		{
			title: t.pengaduanLayanan.totalPengaduan,
			value: stats.total,
			subtitle: t.pengaduanLayanan.bulanIni,
			icon: MessageCircle,
			color: "#1E3A5F",
		},
		{
			title: t.pengaduanLayanan.baru,
			value: stats.baru,
			subtitle: t.pengaduanLayanan.belumDiproses,
			icon: FileText,
			color: "#1E3A5F",
		},
		{
			title: t.pengaduanLayanan.diproses,
			value: stats.proses,
			subtitle: t.pengaduanLayanan.sedangDitangani,
			icon: Clock,
			color: "#1E3A5F",
		},
		{
			title: t.pengaduanLayanan.selesai,
			value: stats.selesai,
			subtitle: t.pengaduanLayanan.terselesaikan,
			icon: CheckCircle,
			color: "#1E3A5F",
		},
	];

	return (
		<Stack gap="lg">
			<InnovationIdeaModal
				idea={selectedIdea}
				opened={ideaModalOpen}
				onClose={() => setIdeaModalOpen(false)}
			/>
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
						onClick={fetchData}
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
					: summaryData.map((item) => (
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
												{item.value}
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

			{/* MAIN CHART - TREN PENGADUAN */}
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
						{t.pengaduanLayanan.trenPengaduan}
					</Title>
				</Group>
				{loading ? (
					<Skeleton height={300} radius="md" />
				) : trendData.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={trendData}>
							{tampilkanGrid && (
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={dark ? "#334155" : "#e5e7eb"}
								/>
							)}
							<XAxis
								dataKey="bulan"
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
							/>
							<Line
								type="monotone"
								dataKey="jumlah"
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
					</ResponsiveContainer>
				) : (
					<Group justify="center" align="center" h={300}>
						<Text size="sm" c="dimmed">
							{t.pengaduanLayanan.tidakAdaDataPengaduan}
						</Text>
					</Group>
				)}
			</Card>

			{/* BOTTOM SECTION - 3 COLUMNS */}
			<Grid gutter="md">
				{/* LEFT: SURAT TERBANYAK */}
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
						<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
							{t.pengaduanLayanan.suratTerbanyak}
						</Title>
						{loading ? (
							<Skeleton height={250} radius="md" />
						) : serviceStats.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={serviceStats} layout="vertical">
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
										tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
									/>
									<YAxis
										type="category"
										dataKey="jenis"
										axisLine={false}
										tickLine={false}
										tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
										width={80}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: dark ? "#1E293B" : "white",
											borderColor: dark ? "#334155" : "#e5e7eb",
											borderRadius: "8px",
										}}
									/>
									<Bar
										dataKey="jumlah"
										fill="#396aaaff"
										radius={[0, 4, 4, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<Group justify="center" align="center" h={250}>
								<Text size="sm" c="dimmed">
									Belum ada data surat.
								</Text>
							</Group>
						)}
					</Card>
				</Grid.Col>

				{/* CENTER: PENGAJUAN TERBARU */}
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
						<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
							{t.pengaduanLayanan.pengajuanTerbaru}
						</Title>
						<Stack gap="sm">
							{loading ? (
								<Skeleton height={180} radius="md" />
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
									{t.pengaduanLayanan.tidakAdaPengajuan}
								</Text>
							)}
						</Stack>
					</Card>
				</Grid.Col>

				{/* RIGHT: AJUAN IDE INOVATIF */}
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
						<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
							{t.pengaduanLayanan.ajuanIdeInovatif}
						</Title>
						<Stack gap="sm">
							{loading ? (
								<Skeleton height={180} radius="md" />
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
												onClick={() => {
													setSelectedIdea(item);
													setIdeaModalOpen(true);
												}}
											>
												{t.pengaduanLayanan.detail}
											</Button>
										</Group>
									</Card>
								))
							) : (
								<Text c="dimmed" ta="center">
									{t.pengaduanLayanan.tidakAdaIde}
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
