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
	AlertTriangle,
	CheckCircle,
	Clock,
	MessageCircle,
	TrendingUp,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// KPI Data
const kpiData = [
	{
		id: 1,
		title: "Interaksi Hari Ini",
		value: "61",
		subtitle: "+15% dari kemarin",
		trend: "positive",
		icon: MessageCircle,
	},
	{
		id: 2,
		title: "Jawaban Otomatis",
		value: "87%",
		subtitle: "53 dari 61 interaksi",
		icon: CheckCircle,
	},
	{
		id: 3,
		title: "Belum Ditindak",
		value: "8",
		subtitle: "Perlu respon manual",
		icon: AlertTriangle,
	},
	{
		id: 4,
		title: "Waktu Respon",
		value: "2.3 sec",
		subtitle: "Rata-rata",
		icon: Clock,
	},
];

// Chart Data
const chartData = [
	{ day: "Sen", total: 45 },
	{ day: "Sel", total: 62 },
	{ day: "Rab", total: 38 },
	{ day: "Kam", total: 75 },
	{ day: "Jum", total: 58 },
	{ day: "Sab", total: 32 },
	{ day: "Min", total: 51 },
];

// Top Topics Data
const topTopics = [
	{ topic: "Cara mengurus KTP", count: 89 },
	{ topic: "Syarat Kartu Keluarga", count: 76 },
	{ topic: "Jadwal Posyandu", count: 64 },
	{ topic: "Pengaduan jalan rusak", count: 52 },
	{ topic: "Info program bansos", count: 48 },
];

// Busy Hours Data
const busyHours = [
	{ period: "Pagi (08–12)", percentage: 30 },
	{ period: "Siang (12–16)", percentage: 40 },
	{ period: "Sore (16–20)", percentage: 20 },
	{ period: "Malam (20–08)", percentage: 10 },
];

const JennaAnalytic = () => {
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
						Interaksi Chatbot
					</Title>
				</Group>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={dark ? "#334155" : "#e5e7eb"}
						/>
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
							Topik Pertanyaan Terbanyak
						</Title>
						<Stack gap="xs">
							{topTopics.map((item, index) => (
								<Box
									key={index}
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
							Jam Tersibuk
						</Title>
						<Stack gap="md">
							{busyHours.map((item, index) => (
								<Box key={index}>
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
