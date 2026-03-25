import {
	Badge,
	Button,
	Card,
	Grid,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { CheckCircle, Clock, FileText, MessageCircle } from "lucide-react";
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

// Summary data
const summaryData = [
	{
		title: "Total Pengaduan",
		value: 42,
		subtitle: "Bulan ini",
		icon: MessageCircle,
		color: "#1E3A5F",
	},
	{
		title: "Baru",
		value: 14,
		subtitle: "Belum diproses",
		icon: FileText,
		color: "#1E3A5F",
	},
	{
		title: "Diproses",
		value: 14,
		subtitle: "Sedang ditangani",
		icon: Clock,
		color: "#1E3A5F",
	},
	{
		title: "Selesai",
		value: 14,
		subtitle: "Terselesaikan",
		icon: CheckCircle,
		color: "#1E3A5F",
	},
];

// Tren pengaduan data
const trenData = [
	{ bulan: "Apr", jumlah: 35 },
	{ bulan: "Mei", jumlah: 48 },
	{ bulan: "Jun", jumlah: 42 },
	{ bulan: "Jul", jumlah: 55 },
	{ bulan: "Agu", jumlah: 50 },
	{ bulan: "Sep", jumlah: 58 },
	{ bulan: "Okt", jumlah: 52 },
];

// Surat terbanyak data
const suratData = [
	{ jenis: "KTP", jumlah: 24 },
	{ jenis: "KK", jumlah: 18 },
	{ jenis: "Domisili", jumlah: 15 },
	{ jenis: "Usaha", jumlah: 12 },
	{ jenis: "Lainnya", jumlah: 8 },
];

// Pengajuan terbaru data
const pengajuanTerbaru = [
	{
		nama: "Budi Santoso",
		jenis: "Ketertiban Umum",
		waktu: "2 jam yang lalu",
		status: "baru",
	},
	{
		nama: "Siti Rahayu",
		jenis: "Pelayanan Kesehatan",
		waktu: "5 jam yang lalu",
		status: "proses",
	},
	{
		nama: "Ahmad Fauzi",
		jenis: "Infrastruktur",
		waktu: "1 hari yang lalu",
		status: "selesai",
	},
	{
		nama: "Dewi Lestari",
		jenis: "Administrasi",
		waktu: "1 hari yang lalu",
		status: "baru",
	},
	{
		nama: "Joko Widodo",
		jenis: "Keamanan",
		waktu: "2 hari yang lalu",
		status: "proses",
	},
];

// Ide inovatif data
const ideInovatif = [
	{
		nama: "Andi Prasetyo",
		judul: "Penerapan Smart Village",
		waktu: "3 hari yang lalu",
		kategori: "Teknologi",
	},
	{
		nama: "Rina Kusuma",
		judul: "Program Ekowisata Desa",
		waktu: "5 hari yang lalu",
		kategori: "Ekonomi",
	},
	{
		nama: "Bambang Suryono",
		judul: "Peningkatan Sanitasi",
		waktu: "1 minggu yang lalu",
		kategori: "Kesehatan",
	},
	{
		nama: "Lina Marlina",
		judul: "Pusat Kreatif Anak Muda",
		waktu: "2 minggu yang lalu",
		kategori: "Pendidikan",
	},
];

const getStatusColor = (status: string) => {
	switch (status) {
		case "baru":
			return "red";
		case "proses":
			return "blue";
		case "selesai":
			return "green";
		default:
			return "gray";
	}
};

const PengaduanLayananPublik = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Stack gap="lg">
			{/* TOP SECTION - 4 STAT CARDS */}
			<Grid gutter="md">
				{summaryData.map((item, index) => (
					<Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
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
									style={{
										transition: "transform 0.15s ease",
									}}
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
						Tren Pengaduan
					</Title>
				</Group>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={trenData}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={dark ? "#334155" : "#e5e7eb"}
						/>
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
							Surat Terbanyak
						</Title>
						<ResponsiveContainer width="100%" height={250}>
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
								<Bar dataKey="jumlah" fill="#396aaaff" radius={[0, 4, 4, 0]} />
							</BarChart>
						</ResponsiveContainer>
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
							Pengajuan Terbaru
						</Title>
						<Stack gap="sm">
							{pengajuanTerbaru.map((item, index) => (
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
												{item.nama}
											</Text>
											<Text size="sm" c="dimmed">
												{item.jenis}
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
												{item.waktu}
											</Text>
										</Stack>
									</Group>
								</Card>
							))}
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
							Ajuan Ide Inovatif
						</Title>
						<Stack gap="sm">
							{ideInovatif.map((item, index) => (
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
												{item.judul}
											</Text>
											<Text size="sm" c="dimmed">
												{item.nama}
											</Text>
											<Text size="xs" c="dimmed">
												{item.waktu}
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
							))}
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default PengaduanLayananPublik;
