import {
	Badge,
	Box,
	Card,
	Center,
	Grid,
	Group,
	Loader,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	MessageCircle,
	TrendingUp,
} from "lucide-react";
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
import { useSnapshot } from "valtio";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";

type JennaAnalyticsData = {
	stats: {
		interaksiHariIni: number;
		changeFromYesterday: number;
		jawabanOtomatis: number;
		jawabanOtomatisCount: number;
		waktuRespon: string;
		belumDitindak: number;
	};
	chartMingguan: Array<{ day: string; count: number }>;
	topTopics: Array<{ topic: string; count: number }>;
	jamTersibuk: Array<{ slot: string; pct: number }>;
};

const JennaAnalytic = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const [data, setData] = useState<JennaAnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const apiUrl = import.meta.env.VITE_JENNA_API_URL;
		const apiToken = import.meta.env.VITE_JENNA_API_TOKEN;
		if (!apiUrl || !apiToken) {
			setError("Jenna API not configured");
			setLoading(false);
			return;
		}
		fetch(`${apiUrl}/api/noc/jenna/analytics`, {
			headers: { Authorization: `Bearer ${apiToken}` },
		})
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then(setData)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<Center h={400}>
				<Loader size="md" />
			</Center>
		);
	}

	if (error) {
		return (
			<Center h={400}>
				<Stack align="center" gap="sm">
					<AlertTriangle size={32} color="#ef4444" />
					<Text c="red" fw={500}>{error}</Text>
				</Stack>
			</Center>
		);
	}

	const change = data?.stats.changeFromYesterday ?? 0;

	const kpiData = [
		{
			id: 1,
			title: t.jennaAnalytic.interaksiHariIni,
			value: data?.stats.interaksiHariIni.toString() ?? "—",
			subtitle: `${change >= 0 ? "+" : ""}${change}% ${t.jennaAnalytic.plusDariKemarin}`,
			trend: change >= 0 ? "positive" : undefined,
			icon: MessageCircle,
		},
		{
			id: 2,
			title: t.jennaAnalytic.jawabanOtomatis,
			value: data ? `${data.stats.jawabanOtomatis}%` : "—",
			subtitle: `dari ${data?.stats.interaksiHariIni ?? 0} interaksi`,
			icon: CheckCircle,
		},
		{
			id: 3,
			title: t.jennaAnalytic.belumDitindak,
			value: data?.stats.belumDitindak.toString() ?? "—",
			subtitle: t.jennaAnalytic.perluResponManual,
			icon: AlertTriangle,
		},
		{
			id: 4,
			title: t.jennaAnalytic.waktuRespon,
			value: data?.stats.waktuRespon ?? "—",
			subtitle: t.jennaAnalytic.rataRata,
			icon: Clock,
		},
	];

	const chartData = (data?.chartMingguan ?? []).map((item) => ({
		day: item.day,
		total: item.count,
	}));

	const topTopics = data?.topTopics ?? [];

	const busyHours = (data?.jamTersibuk ?? []).map((item) => ({
		period: item.slot,
		percentage: item.pct,
	}));

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
											<TrendingUp size={14} color="#22C55E" />
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

			{/* MAIN CHART - INTERAKSI CHATBOT */}
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
						{t.jennaAnalytic.interaksiChatbot}
					</Title>
				</Group>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
						)}
						<XAxis
							dataKey="day"
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
							}}
							labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							cursor={{ fill: dark ? "#334155" : "#f3f4f6" }}
						/>
						<Bar
							dataKey="total"
							fill="#396aaaff"
							radius={[8, 8, 0, 0]}
							maxBarSize={60}
						/>
					</BarChart>
				</ResponsiveContainer>
			</Card>

			{/* BOTTOM SECTION - 2 COLUMNS */}
			<Grid gutter="lg">
				{/* LEFT: TOPIK PERTANYAAN TERBANYAK */}
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
							{t.jennaAnalytic.topikPertanyaan}
						</Title>
						<Stack gap="xs">
							{topTopics.map((item) => (
								<Box
									key={item.topic}
									p="sm"
									bg={dark ? "#334155" : "#F1F5F9"}
									style={{
										transition: "background-color 0.15s ease",
										cursor: "pointer",
									}}
								>
									<Group justify="space-between">
										<Text size="sm" fw={500} c={dark ? "white" : "gray.9"}>
											{item.topic}
										</Text>
										<Badge
											variant="light"
											color="darmasaba-blue"
											radius="sm"
											fw={600}
										>
											{item.count}x
										</Badge>
									</Group>
								</Box>
							))}
						</Stack>
					</Card>
				</Grid.Col>

				{/* RIGHT: JAM TERSIBUK */}
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
							{t.jennaAnalytic.jamTersibuk}
						</Title>
						<Stack gap="md">
							{busyHours.map((item) => (
								<Box key={item.period}>
									<Group justify="space-between" mb={5}>
										<Text size="sm" fw={500} c={dark ? "white" : "gray.9"}>
											{item.period}
										</Text>
										<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
											{item.percentage}%
										</Text>
									</Group>
									<Progress
										value={item.percentage}
										size="lg"
										radius="xl"
										color="#1E3A5F"
										animated
									/>
								</Box>
							))}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default JennaAnalytic;
