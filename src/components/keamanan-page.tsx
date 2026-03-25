import {
	Badge,
	Box,
	Card,
	Grid,
	GridCol,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconCamera,
	IconClock,
	IconMapPin
} from "@tabler/icons-react";

const KeamananPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Sample data for KPI cards
	const kpiData = [
		{
			title: "CCTV Aktif",
			value: 20,
			subtitle: "Kamera Online",
			icon: <IconCamera size={24} />,
			color: "darmasaba-success",
		},
		{
			title: "Laporan Keamanan",
			value: 15,
			subtitle: "Minggu ini",
			icon: <IconAlertTriangle size={24} />,
			color: "darmasaba-danger",
		},
	];

	// Sample data for CCTV locations
	const cctvLocations = [
		{
			id: "CCTV-01",
			lat: -8.5,
			lng: 115.2,
			status: "active",
			lastSeen: "2 jam yang lalu",
			location: "Balai Desa",
		},
		{
			id: "CCTV-02",
			lat: -8.6,
			lng: 115.3,
			status: "active",
			lastSeen: "1 jam yang lalu",
			location: "Pintu Masuk Desa",
		},
		{
			id: "CCTV-03",
			lat: -8.4,
			lng: 115.1,
			status: "offline",
			lastSeen: "1 hari yang lalu",
			location: "Taman Desa",
		},
		{
			id: "CCTV-04",
			lat: -8.7,
			lng: 115.4,
			status: "active",
			lastSeen: "30 menit yang lalu",
			location: "Pasar Desa",
		},
	];

	// Sample data for security reports
	const securityReports = [
		{
			id: "REP-001",
			title: "Pencurian Motor",
			reportedAt: "2 jam yang lalu",
			date: "12 Feb 2026, 14:30",
			location: "Jl. Kecubung 20",
			status: "baru",
		},
		{
			id: "REP-002",
			title: "Kerusuhan Antar Warga",
			reportedAt: "4 jam yang lalu",
			date: "12 Feb 2026, 12:15",
			location: "RT 05 RW 02",
			status: "baru",
		},
		{
			id: "REP-003",
			title: "Kebakaran Rumah",
			reportedAt: "1 hari yang lalu",
			date: "11 Feb 2026, 08:45",
			location: "Jl. Flamboyan 15",
			status: "diproses",
		},
		{
			id: "REP-004",
			title: "Kehilangan Barang",
			reportedAt: "2 hari yang lalu",
			date: "10 Feb 2026, 16:20",
			location: "Taman Desa",
			status: "selesai",
		},
	];

	return (
		<Stack gap="lg">
			<Grid gutter="md">
				{/* Peta Keamanan CCTV */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<Stack gap={"xs"}>
						{/* KPI Cards */}
						<Grid gutter="md">
							{kpiData.map((kpi, index) => (
								<GridCol key={index} span={{ base: 12, sm: 6, md: 6 }}>
									<Card
										p="md"
										radius="md"
										withBorder
										bg={dark ? "#141D34" : "white"}
										style={{ borderColor: dark ? "#141D34" : "white" }}
										h="100%"
									>
										<Group justify="space-between" align="center">
											<Stack gap={0}>
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{kpi.subtitle}
												</Text>
												<Group gap="xs" align="center">
													<Text
														size="xl"
														fw={700}
														c={dark ? "dark.0" : "black"}
													>
														{kpi.value}
													</Text>
													<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
														{kpi.title}
													</Text>
												</Group>
											</Stack>
											<ThemeIcon
												variant="light"
												color={kpi.color}
												size="xl"
												radius="xl"
											>
												{kpi.icon}
											</ThemeIcon>
										</Group>
									</Card>
								</GridCol>
							))}
						</Grid>
						<Card
							p="md"
							radius="md"
							withBorder
							bg={dark ? "#141D34" : "white"}
							style={{ borderColor: dark ? "#141D34" : "white" }}
							h="100%"
						>
							<Title order={3} mb="md" c={dark ? "dark.0" : "black"}>
								Peta Keamanan CCTV
							</Title>
							<Text size="sm" c={dark ? "dark.3" : "dimmed"} mb="md">
								Titik Lokasi CCTV
							</Text>

							{/* Placeholder for map */}
							<Box
								style={{
									backgroundColor: dark ? "#2d3748" : "#e2e8f0",
									borderRadius: "8px",
									height: "400px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Stack align="center">
									<IconMapPin
										size={48}
										stroke={1.5}
										color={dark ? "#94a3b8" : "#64748b"}
									/>
									<Text c={dark ? "dark.3" : "dimmed"}>Peta Lokasi CCTV</Text>
									<Text size="sm" c={dark ? "dark.3" : "dimmed"} ta="center">
										Integrasi dengan Google Maps atau Mapbox akan ditampilkan di
										sini
									</Text>
								</Stack>
							</Box>

							{/* CCTV Locations List */}
							<Stack mt="md" gap="sm">
								<Title order={4} c={dark ? "dark.0" : "black"}>
									Daftar CCTV
								</Title>
								{cctvLocations.map((cctv, index) => (
									<Card
										key={index}
										p="md"
										radius="md"
										withBorder
										bg={dark ? "#263852ff" : "#F1F5F9"}
										style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
									>
										<Group justify="space-between">
											<Stack gap={0}>
												<Group gap="xs">
													<Text fw={500} c={dark ? "dark.0" : "black"}>
														{cctv.id}
													</Text>
													<Badge
														variant="dot"
														color={cctv.status === "active" ? "green" : "gray"}
													>
														{cctv.status === "active" ? "Online" : "Offline"}
													</Badge>
												</Group>
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{cctv.location}
												</Text>
											</Stack>
											<Group gap="xs">
												<IconClock size={16} stroke={1.5} />
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{cctv.lastSeen}
												</Text>
											</Group>
										</Group>
									</Card>
								))}
							</Stack>
						</Card>
					</Stack>
				</GridCol>

				{/* Daftar Laporan Keamanan */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<Card
						p="md"
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
						style={{ borderColor: dark ? "#141D34" : "white" }}
						h="100%"
					>
						<Stack gap="sm">
							{securityReports.map((report, index) => (
								<Card
									key={index}
									p="md"
									radius="md"
									withBorder
									bg={dark ? "#263852ff" : "#F1F5F9"}
									style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
								>
									<Group justify="space-between" mb="sm">
										<Text fw={500} c={dark ? "dark.0" : "black"}>
											{report.title}
										</Text>
										<Badge
											variant="light"
											color={
												report.status === "baru"
													? "red"
													: report.status === "diproses"
														? "yellow"
														: "green"
											}
										>
											{report.status}
										</Badge>
									</Group>

									<Group justify="space-between">
										<Group gap="xs">
											<IconMapPin size={16} stroke={1.5} />
											<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
												{report.location}
											</Text>
										</Group>
										<Group gap="xs">
											<IconClock size={16} stroke={1.5} />
											<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
												{report.reportedAt}
											</Text>
										</Group>
									</Group>

									<Text size="sm" c={dark ? "dark.3" : "dimmed"} mt="sm">
										{report.date}
									</Text>
								</Card>
							))}
						</Stack>
					</Card>
				</GridCol>
			</Grid>
		</Stack>
	);
};

export default KeamananPage;
