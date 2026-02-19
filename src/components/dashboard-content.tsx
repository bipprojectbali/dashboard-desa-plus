import {
	Calendar,
	CheckCircle,
	FileText,
	MessageCircle,
	Users,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip, // Added Tooltip import
	XAxis,
	YAxis,
} from "recharts";

// Import Mantine components

import {
	ActionIcon,
	Badge,
	Box,
	Card, // Added for icon containers
	Grid,
	Group,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme, // Add this import
} from "@mantine/core";

const barChartData = [
	{ month: "Jan", value: 145 },
	{ month: "Feb", value: 165 },
	{ month: "Mar", value: 195 },
	{ month: "Apr", value: 155 },
	{ month: "Mei", value: 205 },
	{ month: "Jun", value: 185 },
];

const pieChartData = [
	{ name: "Puas", value: 25 },
	{ name: "Cukup", value: 25 },
	{ name: "Kurang", value: 25 },
	{ name: "Sangat puas", value: 25 },
];

const COLORS = ["#4E5BA6", "#F4C542", "#8CC63F", "#E57373"];

const divisiData = [
	{ name: "Kesejahteraan", value: 37 },
	{ name: "Pemerintahan", value: 26 },
	{ name: "Keuangan", value: 17 },
	{ name: "Sekretaris Desa", value: 15 },
];

const eventData = [
	{ date: "1 Oktober 2025", title: "Hari Kesaktian Pancasila" },
	{ date: "15 Oktober 2025", title: "Davest" },
	{ date: "19 Oktober 2025", title: "Rapat Koordinasi" },
];

export function DashboardContent() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	return (
		<Stack gap="lg">
			{/* Stats Cards */}
			<Grid gutter="md">
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						h="100%"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group justify="space-between" align="flex-start" w="100%">
							<Box style={{ flex: 1 }}>
								<Text size="sm" c="dimmed" mb="xs">
									Surat Minggu Ini
								</Text>
								<Group align="baseline" gap="xs">
									<Text size="xl" fw={700}>
										99
									</Text>
								</Group>
								<Text size="sm" c="dimmed" mt="xs">
									14 baru, 14 diproses
								</Text>
								<Text size="sm" c="red" mt="xs">
									12% dari minggu lalu ↗ +12%
								</Text>
							</Box>
							<ThemeIcon
								variant="filled"
								size="xl"
								radius="xl"
								color={dark ? "gray" : "darmasaba-blue"}
							>
								<FileText style={{ width: "70%", height: "70%" }} />
							</ThemeIcon>
						</Group>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						h="100%"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group justify="space-between" align="flex-start" w="100%">
							<Box style={{ flex: 1 }}>
								<Text size="sm" c="dimmed" mb="xs">
									Pengaduan Aktif
								</Text>
								<Group align="baseline" gap="xs">
									<Text size="xl" fw={700}>
										28
									</Text>
								</Group>
								<Text size="sm" c="dimmed" mt="xs">
									14 baru, 14 diproses
								</Text>
							</Box>
							<ThemeIcon
								variant="filled"
								size="xl"
								radius="xl"
								color={dark ? "gray" : "darmasaba-blue"}
							>
								<MessageCircle style={{ width: "70%", height: "70%" }} />
							</ThemeIcon>
						</Group>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						h="100%"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group justify="space-between" align="flex-start" w="100%">
							<Box style={{ flex: 1 }}>
								<Text size="sm" c="dimmed" mb="xs">
									Layanan Selesai
								</Text>
								<Group align="baseline" gap="xs">
									<Text size="xl" fw={700}>
										156
									</Text>
								</Group>
								<Text size="sm" c="dimmed" mt="xs">
									bulan ini
								</Text>
								<Text size="sm" c="red" mt="xs">
									+8%
								</Text>
							</Box>
							<ThemeIcon
								variant="filled"
								size="xl"
								radius="xl"
								color={dark ? "gray" : "darmasaba-blue"}
							>
								<CheckCircle style={{ width: "70%", height: "70%" }} />
							</ThemeIcon>
						</Group>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						h="100%"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group justify="space-between" align="flex-start" w="100%">
							<Box style={{ flex: 1 }}>
								<Text size="sm" c="dimmed" mb="xs">
									Kepuasan Warga
								</Text>
								<Group align="baseline" gap="xs">
									<Text size="xl" fw={700}>
										87.2%
									</Text>
								</Group>
								<Text size="sm" c="dimmed" mt="xs">
									dari 482 responden
								</Text>
							</Box>
							<ThemeIcon
								variant="filled"
								size="xl"
								radius="xl"
								color={dark ? "gray" : "darmasaba-blue"}
							>
								<Users style={{ width: "70%", height: "70%" }} />
							</ThemeIcon>
						</Group>
					</Card>
				</Grid.Col>
			</Grid>
			<Grid gutter="lg">
				{/* Bar Chart */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group justify="space-between" mb="md">
							<Box>
								<Title order={4} mb={5}>
									Statistik Pengajuan Surat
								</Title>
								<Text size="sm" c="dimmed">
									Trend pengajuan surat 6 bulan terakhir
								</Text>
							</Box>
							<ActionIcon variant="subtle" size="lg" radius="md">
								{/* Original SVG converted to a generic Icon placeholder */}
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M8 5L13 10L8 15"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</ActionIcon>
						</Group>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={barChartData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke="var(--mantine-color-gray-3)"
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "var(--mantine-color-text)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									ticks={[0, 55, 110, 165, 220]}
									tick={{ fill: "var(--mantine-color-text)" }}
								/>
								<Tooltip />
								<Bar
									dataKey="value"
									fill="var(--mantine-color-blue-filled)"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</Grid.Col>

				{/* Pie Chart */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Title order={4} mb={5}>
							Tingkat Kepuasan
						</Title>
						<Text size="sm" c="dimmed" mb="md">
							Tingkat kepuasan layanan
						</Text>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={pieChartData}
									cx="50%"
									cy="50%"
									innerRadius={80}
									outerRadius={120}
									paddingAngle={2}
									dataKey="value"
								>
									{pieChartData.map((_entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
						<Group justify="center" gap="md" mt="md">
							<Group gap="xs">
								<Box
									w={12}
									h={12}
									style={{ backgroundColor: COLORS[0], borderRadius: "50%" }}
								/>
								<Text size="sm">Sangat puas (0%)</Text>
							</Group>
							<Group gap="xs">
								<Box
									w={12}
									h={12}
									style={{ backgroundColor: COLORS[1], borderRadius: "50%" }}
								/>
								<Text size="sm">Puas (0%)</Text>
							</Group>
							<Group gap="xs">
								<Box
									w={12}
									h={12}
									style={{ backgroundColor: COLORS[2], borderRadius: "50%" }}
								/>
								<Text size="sm">Cukup (0%)</Text>
							</Group>
							<Group gap="xs">
								<Box
									w={12}
									h={12}
									style={{ backgroundColor: COLORS[3], borderRadius: "50%" }}
								/>
								<Text size="sm">Kurang (0%)</Text>
							</Group>
						</Group>
					</Card>
				</Grid.Col>
			</Grid>

			{/* Bottom Section */}
			<Grid gutter="lg">
				{/* Divisi Teraktif */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group gap="xs" mb="lg">
							<Box>
								{/* Original SVG icon */}
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										x="3"
										y="3"
										width="7"
										height="7"
										rx="1"
										fill="currentColor"
									/>
									<rect
										x="3"
										y="14"
										width="7"
										height="7"
										rx="1"
										fill="currentColor"
									/>
									<rect
										x="14"
										y="3"
										width="7"
										height="7"
										rx="1"
										fill="currentColor"
									/>
									<rect
										x="14"
										y="14"
										width="7"
										height="7"
										rx="1"
										fill="currentColor"
									/>
								</svg>
							</Box>
							<Title order={4}>Divisi Teraktif</Title>
						</Group>
						<Stack gap="sm">
							{divisiData.map((divisi, index) => (
								<Box key={index}>
									<Group justify="space-between" mb={5}>
										<Text size="sm" fw={500}>
											{divisi.name}
										</Text>
										<Text size="sm" fw={600}>
											{divisi.value} Kegiatan
										</Text>
									</Group>
									<Progress
										value={(divisi.value / 37) * 100}
										size="sm"
										radius="xl"
										color="blue"
									/>
								</Box>
							))}
						</Stack>
					</Card>
				</Grid.Col>

				{/* Kalender */}
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						style={{ borderColor: dark ? "#141D34" : "white" }}
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
					>
						<Group gap="xs" mb="lg">
							<Calendar style={{ width: 20, height: 20 }} />
							<Title order={4}>Kalender & Kegiatan Mendatang</Title>
						</Group>
						<Stack gap="md">
							{eventData.map((event, index) => (
								<Box
									key={index}
									style={{
										borderLeft: "4px solid var(--mantine-color-blue-filled)",
										paddingLeft: 12,
									}}
								>
									<Text size="sm" c="dimmed">
										{event.date}
									</Text>
									<Text fw={500}>{event.title}</Text>
								</Box>
							))}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>

			{/* APBDes Chart */}
			<Card
				p="md"
				style={{ borderColor: dark ? "#141D34" : "white" }}
				radius="md"
				withBorder
				bg={dark ? "#141D34" : "white"}
			>
				<Title order={4} mb="lg">
					Grafik APBDes
				</Title>
				<Stack gap="xs">
					<Group align="center" gap="md">
						<Text size="sm" fw={500} w={60}>
							Belanja
						</Text>
						<Progress
							value={70}
							size="lg"
							radius="xl"
							color="blue"
							style={{ flex: 1 }}
						/>
					</Group>
					<Group align="center" gap="md">
						<Text size="sm" fw={500} w={60}>
							Pendapatan
						</Text>
						<Progress
							value={90}
							size="lg"
							radius="xl"
							color="green"
							style={{ flex: 1 }}
						/>
					</Group>
					<Group align="center" gap="md">
						<Text size="sm" fw={500} w={60}>
							Pembangunan
						</Text>
						<Progress
							value={50}
							size="lg"
							radius="xl"
							color="orange"
							style={{ flex: 1 }}
						/>
					</Group>
				</Stack>
			</Card>
		</Stack>
	);
}
