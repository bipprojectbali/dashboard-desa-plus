import {
	Alert,
	Badge,
	Button,
	Card,
	Center,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
	CheckCircle,
	Clock,
	FileText,
	Inbox,
	MessageCircle,
	XCircle,
} from "lucide-react";
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
import { deriveDitolak } from "@/api/transforms/noc-pengaduan";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";

dayjs.extend(relativeTime);

// ─── Types ────────────────────────────────────────────────────────────────────

type PengaduanData = {
	stats: {
		total: number;
		baru: number;
		diproses: number;
		selesai: number;
		ditolak?: number;
	};
	trends: { bulan: string; count: number }[];
	surat_terbanyak: { jenis: string; count: number }[];
	pengajuan_terbaru: {
		id: string;
		kategori: string;
		sub_kategori: string | null;
		status: string;
		created_at: string;
	}[];
	musrenbang: {
		id: string;
		judul: string;
		nama_pengusul: string;
		created_at: string;
	}[];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

async function fetchPengaduan(): Promise<PengaduanData> {
	const r = await fetch("/api/noc/pengaduan");
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return (await r.json()) as PengaduanData;
}

function usePengaduanNoc() {
	const query = useApiQuery(["pengaduan", "noc"], fetchPengaduan, {
		autoRefresh: true,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.isError
			? "Gagal memuat data pengaduan. Periksa koneksi dan coba lagi."
			: null,
		refresh: () => query.refetch(),
	};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function EmptyState({
	message,
	height = 200,
}: {
	message: string;
	height?: number;
}) {
	return (
		<Center h={height}>
			<Stack align="center" gap="xs">
				<Inbox size={32} color="gray" />
				<Text size="sm" c="dimmed" ta="center">
					{message}
				</Text>
			</Stack>
		</Center>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

const PengaduanLayananPublik = () => {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const { data, loading, error, refresh } = usePengaduanNoc();

	const stats = data?.stats ?? { total: 0, baru: 0, diproses: 0, selesai: 0 };
	const ditolak = deriveDitolak(stats);
	const trends = (data?.trends ?? []).map((item) => ({
		bulan: item.bulan,
		jumlah: item.count,
	}));
	const suratTerbanyak = (data?.surat_terbanyak ?? []).map((item) => ({
		jenis: item.jenis,
		jumlah: item.count,
	}));
	const pengajuanTerbaru = (data?.pengajuan_terbaru ?? []).slice(0, 5);
	const musrenbang = (data?.musrenbang ?? []).slice(0, 5);

	const summaryData = [
		{
			title: t.pengaduanLayanan.totalPengaduan,
			value: stats.total,
			subtitle: t.pengaduanLayanan.bulanIni,
			icon: MessageCircle,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.baru,
			value: stats.baru,
			subtitle: t.pengaduanLayanan.belumDiproses,
			icon: FileText,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.diproses,
			value: stats.diproses,
			subtitle: t.pengaduanLayanan.sedangDitangani,
			icon: Clock,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.selesai,
			value: stats.selesai,
			subtitle: t.pengaduanLayanan.terselesaikan,
			icon: CheckCircle,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.ditolak,
			value: ditolak,
			subtitle: t.pengaduanLayanan.tidakDitindaklanjuti,
			icon: XCircle,
			color: "darmasaba-navy.7",
		},
	];

	return (
		<Stack gap="lg">
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
						onClick={refresh}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter="md">
				{loading
					? Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton array
							<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 2.4 }}>
								<Skeleton height={100} radius="xl" />
							</Grid.Col>
						))
					: summaryData.map((item) => (
							<Grid.Col key={item.title} span={{ base: 12, sm: 6, lg: 2.4 }}>
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
				) : trends.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart
							data={trends}
							margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
						>
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
								tickMargin={12}
								padding={{ left: 24, right: 24 }}
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
								itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
								labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							/>
							<Line
								type="monotone"
								dataKey="jumlah"
								stroke="#396aaaff"
								strokeWidth={2}
								dot={{
									fill: "var(--mantine-color-darmasaba-navy-7)",
									strokeWidth: 2,
									r: 4,
								}}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<EmptyState
						message={t.pengaduanLayanan.tidakAdaDataPengaduan}
						height={300}
					/>
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
						) : suratTerbanyak.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<BarChart
									data={suratTerbanyak}
									layout="vertical"
									margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
								>
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
										tickMargin={8}
										tick={{ fill: dark ? "#E2E8F0" : "#374151", fontSize: 12 }}
										width={128}
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
										dataKey="jumlah"
										fill="#396aaaff"
										radius={[0, 4, 4, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<EmptyState
								message={t.pengaduanLayanan.tidakAdaDataPengaduan}
								height={250}
							/>
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
							) : pengajuanTerbaru.length > 0 ? (
								pengajuanTerbaru.map((item) => (
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
												<Text
													fw={600}
													c={dark ? "white" : "gray.9"}
													tt="capitalize"
												>
													{item.kategori}
												</Text>
												{item.sub_kategori && (
													<Text size="sm" c="dimmed" tt="capitalize">
														{item.sub_kategori}
													</Text>
												)}
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
													{dayjs(item.created_at).fromNow()}
												</Text>
											</Stack>
										</Group>
									</Card>
								))
							) : (
								<EmptyState message={t.pengaduanLayanan.tidakAdaPengajuan} />
							)}
						</Stack>
					</Card>
				</Grid.Col>

				{/* RIGHT: MUSRENBANG */}
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
							) : musrenbang.length > 0 ? (
								musrenbang.map((item) => (
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
												{item.judul}
											</Text>
											<Text size="sm" c="dimmed">
												{item.nama_pengusul}
											</Text>
											<Text size="xs" c="dimmed">
												{dayjs(item.created_at).fromNow()}
											</Text>
										</Stack>
									</Card>
								))
							) : (
								<EmptyState message={t.pengaduanLayanan.tidakAdaIde} />
							)}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default PengaduanLayananPublik;
