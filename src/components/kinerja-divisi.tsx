import {
	Stack,
	Grid,
	GridCol,
	Group,
	Text,
	Title,
	ActionIcon,
	Progress as MantineProgress,
	Box,
	Badge as MantineBadge,
	Card,
	useMantineColorScheme,
	ThemeIcon,
	List,
	Divider,
	Skeleton
} from "@mantine/core";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const KinerjaDivisi = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === 'dark';

	// Data for division progress chart
	const divisionProgressData = [
		{ name: "Sekretariat", selesai: 12, berjalan: 5, tertunda: 2 },
		{ name: "Keuangan", selesai: 8, berjalan: 7, tertunda: 1 },
		{ name: "Sosial", selesai: 10, berjalan: 3, tertunda: 4 },
		{ name: "Humas", selesai: 6, berjalan: 9, tertunda: 3 },
	];

	// Division task summaries
	const divisionTasks = [
		{
			name: "Sekretariat",
			tasks: [
				{ title: "Laporan Bulanan", status: "selesai" },
				{ title: "Arsip Dokumen", status: "berjalan" },
				{ title: "Undangan Rapat", status: "tertunda" },
			]
		},
		{
			name: "Keuangan",
			tasks: [
				{ title: "Laporan APBDes", status: "selesai" },
				{ title: "Verifikasi Dana", status: "tertunda" },
				{ title: "Pengeluaran Harian", status: "berjalan" },
			]
		},
		{
			name: "Sosial",
			tasks: [
				{ title: "Program Bantuan", status: "selesai" },
				{ title: "Kegiatan Posyandu", status: "berjalan" },
				{ title: "Monitoring Stunting", status: "tertunda" },
			]
		},
		{
			name: "Humas",
			tasks: [
				{ title: "Publikasi Kegiatan", status: "selesai" },
				{ title: "Koordinasi Media", status: "berjalan" },
				{ title: "Laporan Kegiatan", status: "tertunda" },
			]
		},
	];

	// Archive items
	const archiveItems = [
		{ name: "Surat Keputusan", count: 12 },
		{ name: "Laporan Keuangan", count: 8 },
		{ name: "Dokumentasi", count: 24 },
		{ name: "Notulensi Rapat", count: 15 },
	];

	// Activity progress
	const activityProgress = [
		{ name: "Pembangunan Jalan", progress: 75, date: "15 Feb 2026", status: "berjalan" },
		{ name: "Posyandu Bulanan", progress: 100, date: "10 Feb 2026", status: "selesai" },
		{ name: "Vaksinasi Massal", progress: 45, date: "20 Feb 2026", status: "berjalan" },
		{ name: "Festival Budaya", progress: 20, date: "5 Mar 2026", status: "berjalan" },
	];

	// Document statistics
	const documentStats = [
		{ name: "Gambar", value: 42 },
		{ name: "Dokumen", value: 87 },
	];

	// Activity progress statistics
	const activityProgressStats = [
		{ name: "Selesai", value: 12 },
		{ name: "Dikerjakan", value: 8 },
		{ name: "Segera Dikerjakan", value: 5 },
		{ name: "Dibatalkan", value: 2 },
	];

	const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];
	const STATUS_COLORS: Record<string, string> = {
		selesai: 'green',
		berjalan: 'blue',
		tertunda: 'red',
		proses: 'yellow'
	};

	// Discussion data
	const discussions = [
		{ title: "Pembahasan APBDes 2026", sender: "Kepala Desa", timestamp: "2 jam yang lalu" },
		{ title: "Kegiatan Posyandu", sender: "Divisi Sosial", timestamp: "5 jam yang lalu" },
		{ title: "Festival Budaya", sender: "Divisi Humas", timestamp: "1 hari yang lalu" },
	];

	// Today's agenda
	const todayAgenda = [
		{ time: "09:00", event: "Rapat Evaluasi Bulanan" },
		{ time: "14:00", event: "Koordinasi Program Bantuan" },
	];

	return (
		<Stack gap="lg">
			{/* Grafik Progres Tugas per Divisi */}
			<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }} >
				<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
					Grafik Progres Tugas per Divisi
				</Title>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={divisionProgressData}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? "#141D34" : "white"} />
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "var(--mantine-color-text)" : "var(--mantine-color-text)" }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "var(--mantine-color-text)" : "var(--mantine-color-text)" }}
						/>
						<Tooltip
							contentStyle={dark
								? { backgroundColor: 'var(--mantine-color-dark-7)', borderColor: 'var(--mantine-color-dark-6)' }
								: {}}
						/>
						<Bar dataKey="selesai" stackId="a" fill="#10B981" name="Selesai" radius={[4, 4, 0, 0]} />
						<Bar dataKey="berjalan" stackId="a" fill="#3B82F6" name="Berjalan" radius={[4, 4, 0, 0]} />
						<Bar dataKey="tertunda" stackId="a" fill="#EF4444" name="Tertunda" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</Card>

			{/* Ringkasan Tugas per Divisi */}
			<Grid gutter="md">
				{divisionTasks.map((division, index) => (
					<GridCol key={index} span={{ base: 12, md: 6, lg: 3 }}>
						<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }} h="100%">
							<Title order={4} mb="sm" c={dark ? 'white' : 'darmasaba-navy'}>
								{division.name}
							</Title>
							<Stack gap="sm">
								{division.tasks.map((task, taskIndex) => (
									<Box key={taskIndex}>
										<Group justify="space-between">
											<Text size="sm" c={dark ? 'white' : 'darmasaba-navy'}>{task.title}</Text>
											<MantineBadge
												color={STATUS_COLORS[task.status] || 'gray'}
												variant="light"
											>
												{task.status}
											</MantineBadge>
										</Group>
									</Box>
								))}
							</Stack>
						</Card>
					</GridCol>
				))}
			</Grid>

			{/* Arsip Digital Perangkat Desa */}
			<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
				<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
					Arsip Digital Perangkat Desa
				</Title>
				<Grid gutter="md">
					{archiveItems.map((item, index) => (
						<GridCol key={index} span={{ base: 12, md: 6, lg: 3 }}>
							<Card p="md" radius="md" withBorder bg={dark ? "#263852ff" : "#F1F5F9"} style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}>
								<Group justify="space-between">
									<Text c={dark ? 'white' : 'darmasaba-navy'} fw={500}>{item.name}</Text>
									<Text c={dark ? 'white' : 'darmasaba-navy'} fw={700}>{item.count}</Text>
								</Group>
							</Card>
						</GridCol>
					))}
				</Grid>
			</Card>

			{/* Kartu Progres Kegiatan */}
			<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
				<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
					Progres Kegiatan / Program
				</Title>
				<Stack gap="md">
					{activityProgress.map((activity, index) => (
						<Card key={index} p="md" radius="md" withBorder bg={dark ? "#263852ff" : "#F1F5F9"} style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}>
							<Group justify="space-between" mb="sm">
								<Text c={dark ? 'white' : 'darmasaba-navy'} fw={500}>{activity.name}</Text>
								<MantineBadge
									color={STATUS_COLORS[activity.status] || 'gray'}
									variant="light"
								>
									{activity.status}
								</MantineBadge>
							</Group>
							<Group justify="space-between">
								<MantineProgress
									value={activity.progress}
									size="sm"
									radius="xl"
									color={activity.progress === 100 ? "green" : "blue"}
									w="calc(100% - 80px)"
								/>
								<Text size="sm" c={dark ? 'white' : 'darmasaba-navy'}>{activity.progress}%</Text>
							</Group>
							<Text size="sm" c="dimmed" mt="sm">{activity.date}</Text>
						</Card>
					))}
				</Stack>
			</Card>

			{/* Statistik Dokumen & Progres Kegiatan */}
			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 6 }}>
					<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
						<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
							Jumlah Dokumen
						</Title>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={documentStats}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? "#141D34" : "white"} />
								<XAxis
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "var(--mantine-color-text)" : "var(--mantine-color-text)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "var(--mantine-color-text)" : "var(--mantine-color-text)" }}
								/>
								<Tooltip
									contentStyle={dark
										? { backgroundColor: 'var(--mantine-color-dark-7)', borderColor: 'var(--mantine-color-dark-6)' }
										: {}}
								/>
								<Bar dataKey="value" fill={dark ? "var(--mantine-color-blue-6)" : "var(--mantine-color-blue-filled)"} radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</Card>
				</GridCol>

				<GridCol span={{ base: 12, lg: 6 }}>
					<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
						<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
							Progres Kegiatan
						</Title>
						<ResponsiveContainer width="100%" height={200}>
							<PieChart>
								<Pie
									data={activityProgressStats}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
								>
									{activityProgressStats.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={dark
										? { backgroundColor: 'var(--mantine-color-dark-7)', borderColor: 'var(--mantine-color-dark-6)' }
										: {}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</Card>
				</GridCol>
			</Grid>

			{/* Diskusi Internal */}
			<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
				<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
					Diskusi Internal
				</Title>
				<Stack gap="sm">
					{discussions.map((discussion, index) => (
						<Card key={index} p="md" radius="md" withBorder bg={dark ? "#263852ff" : "#F1F5F9"} style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}>
							<Group justify="space-between">
								<Text c={dark ? 'white' : 'darmasaba-navy'} fw={500}>{discussion.title}</Text>
								<Text size="sm" c="dimmed">{discussion.timestamp}</Text>
							</Group>
							<Text size="sm" c="dimmed">{discussion.sender}</Text>
						</Card>
					))}
				</Stack>
			</Card>

			{/* Agenda / Acara Hari Ini */}
			<Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
				<Title order={4} mb="md" c={dark ? 'white' : 'darmasaba-navy'}>
					Agenda / Acara Hari Ini
				</Title>
				{todayAgenda.length > 0 ? (
					<Stack gap="sm">
						{todayAgenda.map((agenda, index) => (
							<Group key={index} align="flex-start">
								<Box w={60}>
									<Text c="dimmed">{agenda.time}</Text>
								</Box>
								<Divider orientation="vertical" mx="sm" />
								<Text c={dark ? 'white' : 'darmasaba-navy'}>{agenda.event}</Text>
							</Group>
						))}
					</Stack>
				) : (
					<Text c="dimmed" ta="center" py="md">
						Tidak ada acara hari ini
					</Text>
				)}
			</Card>
		</Stack>
	);
};

export default KinerjaDivisi;