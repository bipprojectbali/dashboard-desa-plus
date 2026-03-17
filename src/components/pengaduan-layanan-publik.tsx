import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Grid,
	GridCol,
	Group,
	List,
	Select,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconCheck,
	IconChevronRight,
	IconClock,
	IconMessage,
} from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
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

const PengaduanLayananPublik = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Summary data
	const summaryData = {
		total: 42,
		baru: 14,
		diproses: 14,
		selesai: 14,
	};

	// Tren pengaduan data
	const trenData = [
		{ bulan: "Jan", jumlah: 30 },
		{ bulan: "Feb", jumlah: 50 },
		{ bulan: "Mar", jumlah: 42 },
		{ bulan: "Apr", jumlah: 38 },
		{ bulan: "Mei", jumlah: 45 },
		{ bulan: "Jun", jumlah: 42 },
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
			status: "diproses",
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
			status: "diproses",
		},
	];

	// Ide inovatif data
	const ideInovatif = [
		{
			nama: "Andi Prasetyo",
			judul: "Penerapan Smart Village",
			kategori: "Teknologi",
		},
		{
			nama: "Rina Kusuma",
			judul: "Program Ekowisata Desa",
			kategori: "Ekonomi",
		},
		{
			nama: "Bambang Suryono",
			judul: "Peningkatan Sanitasi",
			kategori: "Kesehatan",
		},
		{
			nama: "Lina Marlina",
			judul: "Pusat Kreatif Anak Muda",
			kategori: "Pendidikan",
		},
	];

	const [activeTab, setActiveTab] = useState<"complaints" | "services">(
		"complaints",
	);
	const [newComplaint, setNewComplaint] = useState({
		title: "",
		category: "",
		description: "",
	});

	// Sample data for complaints
	const complaints = [
		{
			id: 1,
			title: "Jalan Rusak di Jalan Raya",
			category: "Infrastruktur",
			status: "Pending",
			priority: "High",
			date: "2024-02-01",
			reporter: "Bapak Ahmad",
		},
		{
			id: 2,
			title: "Pemadaman Listrik Berkelanjutan",
			category: "Utilitas",
			status: "In Progress",
			priority: "Medium",
			date: "2024-02-03",
			reporter: "Ibu Sari",
		},
		{
			id: 3,
			title: "Pelayanan Administrasi Lambat",
			category: "Administrasi",
			status: "Resolved",
			priority: "Low",
			date: "2024-01-28",
			reporter: "Pak Joko",
		},
		{
			id: 4,
			title: "Kebersihan Lingkungan",
			category: "Sanitasi",
			status: "Pending",
			priority: "Medium",
			date: "2024-02-05",
			reporter: "Bu Dewi",
		},
	];

	// Sample data for public services
	const services = [
		{
			id: 1,
			name: "Pembuatan KTP",
			description:
				"Pelayanan pembuatan Kartu Tanda Penduduk baru atau perpanjangan",
			status: "Available",
			category: "Administrasi",
			lastUpdated: "2024-02-01",
		},
		{
			id: 2,
			name: "Pembuatan Surat Keterangan Usaha",
			description: "Surat keterangan untuk keperluan usaha atau perizinan",
			status: "Available",
			category: "Administrasi",
			lastUpdated: "2024-02-02",
		},
		{
			id: 3,
			name: "Pelayanan Kesehatan",
			description: "Pelayanan kesehatan dasar di puskesmas desa",
			status: "Available",
			category: "Kesehatan",
			lastUpdated: "2024-01-30",
		},
		{
			id: 4,
			name: "Program Bantuan Sosial",
			description:
				"Informasi dan pendaftaran program bantuan sosial dari pemerintah",
			status: "Limited",
			category: "Sosial",
			lastUpdated: "2024-02-04",
		},
	];

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setNewComplaint((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (value: string | null) => {
		setNewComplaint((prev) => ({
			...prev,
			category: value || "", // Ensure category is always a string
		}));
	};

	const handleSubmitComplaint = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitting complaint:", newComplaint);
		// Here you would typically send the complaint to your backend
		alert("Pengaduan berhasil dikirim!");
		setNewComplaint({ title: "", category: "", description: "" });
	};

	// Render complaint table rows
	const complaintRows = complaints.map((complaint) => (
		<Table.Tr key={complaint.id}>
			<Table.Td className="font-medium">
				<Text c={dark ? "white" : "dark.3"}>{complaint.title}</Text>
			</Table.Td>
			<Table.Td>
				<Text c={dark ? "white" : "dark.3"}>{complaint.category}</Text>
			</Table.Td>
			<Table.Td>
				<Badge
					variant="filled"
					color={
						complaint.status === "Resolved"
							? "green"
							: complaint.status === "In Progress"
								? "yellow"
								: "red"
					}
				>
					{complaint.status}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Badge
					variant="filled"
					color={
						complaint.priority === "High"
							? "red"
							: complaint.priority === "Medium"
								? "yellow"
								: "blue"
					}
				>
					{complaint.priority}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Text c={dark ? "white" : "dark.3"}>{complaint.date}</Text>
			</Table.Td>
		</Table.Tr>
	));

	// Status badge color mapping
	const getStatusColor = (status: string) => {
		switch (status) {
			case "baru":
				return "red";
			case "diproses":
				return "yellow";
			case "selesai":
				return "green";
			default:
				return "gray";
		}
	};

	return (
		<Stack gap="lg">
			{activeTab === "complaints" ? (
				<>
					{/* Summary Cards */}
					<Grid gutter="md">
						<GridCol span={{ base: 12, md: 6, lg: 3 }}>
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
											Total Pengaduan
										</Text>
										<Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
											{summaryData.total}
										</Text>
									</Stack>
									<Badge
										variant="light"
										color="darmasaba-blue"
										p={8}
										radius="md"
									>
										<IconMessage size={20} />
									</Badge>
								</Group>
							</Card>
						</GridCol>

						<GridCol span={{ base: 12, md: 6, lg: 3 }}>
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
											Baru
										</Text>
										<Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
											{summaryData.baru}
										</Text>
									</Stack>
									<Badge variant="light" color="red" p={8} radius="md">
										<IconAlertTriangle size={20} />
									</Badge>
								</Group>
							</Card>
						</GridCol>

						<GridCol span={{ base: 12, md: 6, lg: 3 }}>
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
											Diproses
										</Text>
										<Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
											{summaryData.diproses}
										</Text>
									</Stack>
									<Badge variant="light" color="yellow" p={8} radius="md">
										<IconClock size={20} />
									</Badge>
								</Group>
							</Card>
						</GridCol>

						<GridCol span={{ base: 12, md: 6, lg: 3 }}>
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
											Selesai
										</Text>
										<Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
											{summaryData.selesai}
										</Text>
									</Stack>
									<Badge variant="light" color="green" p={8} radius="md">
										<IconCheck size={20} />
									</Badge>
								</Group>
							</Card>
						</GridCol>
					</Grid>

					{/* Grafik Tren Pengaduan */}
					<Card
						p="md"
						radius="md"
						withBorder
						bg={dark ? "#141D34" : "white"}
						style={{ borderColor: dark ? "#141D34" : "white" }}
					>
						<Title order={4} mb="md" c={dark ? "dark.0" : "black"}>
							Grafik Tren Pengaduan
						</Title>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={trenData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={
										dark
											? "var(--mantine-color-gray-7)"
											: "var(--mantine-color-gray-3)"
									}
								/>
								<XAxis
									dataKey="bulan"
									axisLine={false}
									tickLine={false}
									tick={{
										fill: dark
											? "var(--mantine-color-text)"
											: "var(--mantine-color-text)",
									}}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{
										fill: dark
											? "var(--mantine-color-text)"
											: "var(--mantine-color-text)",
									}}
								/>
								<Tooltip
									contentStyle={
										dark
											? {
													backgroundColor: "var(--mantine-color-dark-7)",
													borderColor: "var(--mantine-color-dark-6)",
												}
											: {}
									}
								/>
								<Line
									type="monotone"
									dataKey="jumlah"
									stroke={
										dark
											? "var(--mantine-color-blue-6)"
											: "var(--mantine-color-blue-filled)"
									}
									strokeWidth={2}
									dot={{
										stroke: dark
											? "var(--mantine-color-blue-6)"
											: "var(--mantine-color-blue-filled)",
										strokeWidth: 2,
										r: 4,
									}}
									activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</Card>

					{/* Surat Terbanyak & Pengajuan Terbaru & Ide Inovatif */}
					<Grid gutter="md">
						{/* Surat Terbanyak */}
						<GridCol span={{ base: 12, lg: 4 }}>
							<Card
								p="md"
								radius="md"
								withBorder
								bg={dark ? "#141D34" : "white"}
								style={{ borderColor: dark ? "#141D34" : "white" }}
								h="100%"
							>
								<Title order={4} mb="md" c={dark ? "dark.0" : "black"}>
									Surat Terbanyak
								</Title>
								<ResponsiveContainer width="100%" height={250}>
									<BarChart data={suratData} layout="horizontal">
										<CartesianGrid
											strokeDasharray="3 3"
											horizontal={false}
											stroke={
												dark
													? "var(--mantine-color-gray-7)"
													: "var(--mantine-color-gray-3)"
											}
										/>
										<XAxis
											dataKey="jumlah"
											axisLine={false}
											tickLine={false}
											tick={{
												fill: dark
													? "var(--mantine-color-text)"
													: "var(--mantine-color-text)",
											}}
										/>
										<YAxis
											dataKey="jenis"
											type="category"
											axisLine={false}
											tickLine={false}
											tick={{
												fill: dark
													? "var(--mantine-color-text)"
													: "var(--mantine-color-text)",
											}}
											width={80}
										/>
										<Tooltip
											contentStyle={
												dark
													? {
															backgroundColor: "var(--mantine-color-dark-7)",
															borderColor: "var(--mantine-color-dark-6)",
														}
													: {}
											}
										/>
										<Bar
											dataKey="jumlah"
											fill={
												dark
													? "var(--mantine-color-blue-6)"
													: "var(--mantine-color-blue-filled)"
											}
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</Card>
						</GridCol>

						{/* Pengajuan Terbaru */}
						<GridCol span={{ base: 12, lg: 4 }}>
							<Card
								p="md"
								radius="md"
								withBorder
								bg={dark ? "#141D34" : "white"}
								style={{ borderColor: dark ? "#141D34" : "white" }}
								h="100%"
							>
								<Title order={4} mb="md" c={dark ? "dark.0" : "black"}>
									Pengajuan Terbaru
								</Title>
								{pengajuanTerbaru.map((item, index) => (
									<Box key={index}>
										<Group justify="space-between">
											<Stack gap={0}>
												<Text fw={500} c={dark ? "dark.0" : "black"}>
													{item.nama}
												</Text>
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{item.jenis}
												</Text>
											</Stack>
											<Stack gap={0} align="flex-end">
												<Badge
													color={getStatusColor(item.status)}
													variant="light"
												>
													{item.status}
												</Badge>
												<Text size="xs" c={dark ? "dark.4" : "dimmed"}>
													{item.waktu}
												</Text>
											</Stack>
										</Group>
										<Divider my="sm" />
									</Box>
								))}
							</Card>
						</GridCol>

						{/* Ajuan Ide Inovatif */}
						<GridCol span={{ base: 12, lg: 4 }}>
							<Card
								p="md"
								radius="md"
								withBorder
								bg={dark ? "#141D34" : "white"}
								style={{ borderColor: dark ? "#141D34" : "white" }}
								h="100%"
							>
								<Title order={4} mb="md" c={dark ? "dark.0" : "black"}>
									Ajuan Ide Inovatif
								</Title>
								{ideInovatif.map((item, index) => (
									<Box key={index}>
										<Group justify="space-between">
											<Stack gap={0}>
												<Text fw={500} c={dark ? "dark.0" : "black"}>
													{item.judul}
												</Text>
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{item.nama}
												</Text>
											</Stack>
											<Group>
												<Badge color="blue" variant="light">
													{item.kategori}
												</Badge>
												<ActionIcon variant="subtle" color="darmasaba-blue">
													<IconChevronRight size={16} />
												</ActionIcon>
											</Group>
										</Group>
										<Divider my="sm" />
									</Box>
								))}
							</Card>
						</GridCol>
					</Grid>

					{/* Complaint Submission Form and List */}
					<Grid gutter="md">
						{/* Complaint Submission Form */}
						<GridCol span={{ base: 12, lg: 4 }}>
							<Card
								p="md"
								withBorder
								radius="md"
								h="100%"
								bg={dark ? "#141D34" : "white"}
								style={{ borderColor: dark ? "#141D34" : "white" }}
							>
								<Card.Section withBorder inheritPadding py="xs">
									<Title order={3} py="xs">
										Ajukan Pengaduan
									</Title>
								</Card.Section>
								<Card.Section>
									<form onSubmit={handleSubmitComplaint}>
										<Stack gap="md" p={"sm"}>
											<TextInput
												label="Judul Pengaduan"
												id="title"
												name="title"
												value={newComplaint.title}
												onChange={handleInputChange}
												placeholder="Masukkan judul pengaduan"
												required
												withAsterisk
											/>

											<Select
												label="Kategori"
												id="category"
												name="category"
												value={newComplaint.category}
												onChange={handleSelectChange}
												placeholder="Pilih kategori"
												data={[
													{ value: "infrastruktur", label: "Infrastruktur" },
													{ value: "administrasi", label: "Administrasi" },
													{ value: "utilitas", label: "Utilitas" },
													{ value: "sanitasi", label: "Sanitasi" },
													{ value: "kesehatan", label: "Kesehatan" },
													{ value: "pendidikan", label: "Pendidikan" },
												]}
												clearable
											/>

											<Textarea
												label="Deskripsi"
												id="description"
												name="description"
												value={newComplaint.description}
												onChange={handleInputChange}
												placeholder="Jelaskan pengaduan Anda secara detail..."
												minRows={4}
												required
												withAsterisk
											/>

											<Button type="submit" mt="md" color="darmasaba-blue">
												Kirim Pengaduan
											</Button>
										</Stack>
									</form>
								</Card.Section>
							</Card>
						</GridCol>

						{/* Complaints List */}
						<GridCol span={{ base: 12, lg: 8 }}>
							<Card
								withBorder
								radius="md"
								bg={dark ? "#141D34" : "white"}
								style={{ borderColor: dark ? "#141D34" : "white" }}
							>
								<Card.Section withBorder inheritPadding py="xs">
									<Title order={3} py="xs">
										Daftar Pengaduan
									</Title>
								</Card.Section>
								<Card.Section py="md" px="xs">
									<Table withColumnBorders>
										<Table.Thead>
											<Table.Tr>
												<Table.Th>
													<Text c={dark ? "white" : "dark.3"}>Judul</Text>
												</Table.Th>
												<Table.Th>
													<Text c={dark ? "white" : "dark.3"}>Kategori</Text>
												</Table.Th>
												<Table.Th>
													<Text c={dark ? "white" : "dark.3"}>Status</Text>
												</Table.Th>
												<Table.Th>
													<Text c={dark ? "white" : "dark.3"}>Prioritas</Text>
												</Table.Th>
												<Table.Th>
													<Text c={dark ? "white" : "dark.3"}>Tanggal</Text>
												</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>{complaintRows}</Table.Tbody>
									</Table>
								</Card.Section>
							</Card>
						</GridCol>
					</Grid>
				</>
			) : (
				<Stack gap="lg">
					<Card withBorder radius="md">
						<Card.Section withBorder inheritPadding py="xs">
							<Title order={3} py="xs">
								Layanan Publik Tersedia
							</Title>
						</Card.Section>
						<Card.Section pt="md">
							<Grid gutter="md">
								{services.map((service) => (
									<GridCol key={service.id} span={{ base: 12, md: 6, lg: 4 }}>
										<Card withBorder radius="md" h="100%">
											<Title order={4} mb="sm">
												{service.name}
											</Title>
											<Text size="sm" c={dark ? "white" : "dark.3"} mb="md">
												{service.description}
											</Text>
											<Group justify="space-between">
												<Badge
													variant="filled"
													color={
														service.status === "Available"
															? "green"
															: service.status === "Limited"
																? "yellow"
																: "red"
													}
												>
													{service.status}
												</Badge>
												<Text size="sm" c={dark ? "white" : "dark.3"}>
													{service.category}
												</Text>
											</Group>
											<Text size="xs" c={dark ? "white" : "dark.3"} mt="sm">
												Terakhir diperbarui: {service.lastUpdated}
											</Text>
										</Card>
									</GridCol>
								))}
							</Grid>
						</Card.Section>
					</Card>

					<Card withBorder radius="md">
						<Card.Section withBorder inheritPadding py="xs">
							<Title order={3} py="xs">
								Statistik Layanan
							</Title>
						</Card.Section>
						<Card.Section pt="md">
							<Grid gutter="md">
								<GridCol span={{ base: 12, md: 4 }}>
									<Card p="md" bg={dark ? "dark.7" : "gray.0"} radius="md">
										<Title order={4} mb="xs">
											Jumlah Layanan Tersedia
										</Title>
										<Text size="xl" fw={700} c="darmasaba-blue">
											12
										</Text>
									</Card>
								</GridCol>
								<GridCol span={{ base: 12, md: 4 }}>
									<Card p="md" bg={dark ? "dark.7" : "gray.0"} radius="md">
										<Title order={4} mb="xs">
											Layanan Terpopuler
										</Title>
										<Text size="xl" fw={700} c="darmasaba-success">
											4
										</Text>
									</Card>
								</GridCol>
								<GridCol span={{ base: 12, md: 4 }}>
									<Card p="md" bg={dark ? "dark.7" : "gray.0"} radius="md">
										<Title order={4} mb="xs">
											Permintaan Baru
										</Title>
										<Text size="xl" fw={700} c="darmasaba-warning">
											23
										</Text>
									</Card>
								</GridCol>
							</Grid>
						</Card.Section>
					</Card>
				</Stack>
			)}
		</Stack>
	);
};

export default PengaduanLayananPublik;
