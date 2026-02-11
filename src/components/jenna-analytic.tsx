import React from "react";
import {
	Button,
	Card,
	Badge,
	Progress,
	Title,
	Text,
	Group,
	Stack,
	Grid,
	Table,
	Box,
} from "@mantine/core";

// Sample Data
const kpiData = [
	{
		id: 1,
		title: "Interaksi Hari Ini",
		value: "61",
		delta: "+15% dari kemarin",
		deltaType: "positive",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6 text-muted-foreground"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H16.5m-13.5 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
				/>
			</svg>
		),
	},
	{
		id: 2,
		title: "Jawaban Otomatis",
		value: "87%",
		sub: "53 dari 61 interaksi",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6 text-muted-foreground"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.473-1.688 3.342-.48.485-.926.97-1.378 1.44c-1.472 1.58-2.306 2.787-2.91 3.514-.15.18-.207.33-.207.33A.75.75 0 0 1 15 21h-3c-1.104 0-2.08-.542-2.657-1.455-.139-.201-.264-.406-.38-.614l-.014-.025C8.85 18.067 8.156 17.2 7.5 16.325.728 12.56.728 7.44 7.5 3.675c3.04-.482 5.584.47 7.042 1.956.674.672 1.228 1.462 1.696 2.307.426.786.793 1.582 1.113 2.392h.001Z"
				/>
			</svg>
		),
	},
	{
		id: 3,
		title: "Belum Ditindak",
		value: "8",
		sub: "Perlu respon manual",
		deltaType: "negative",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6 text-muted-foreground"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
				/>
			</svg>
		),
	},
	{
		id: 4,
		title: "Waktu Respon",
		value: "2.3 sec",
		sub: "Rata-rata",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6 text-muted-foreground"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		),
	},
];

const chartData = [
	{ day: "Sen", total: 100 },
	{ day: "Sel", total: 120 },
	{ day: "Rab", total: 90 },
	{ day: "Kam", total: 150 },
	{ day: "Jum", total: 110 },
	{ day: "Sab", total: 80 },
	{ day: "Min", total: 130 },
];

const topTopics = [
	{ topic: "Cara mengurus KTP", count: 89 },
	{ topic: "Syarat Kartu Keluarga", count: 76 },
	{ topic: "Jadwal Posyandu", count: 64 },
	{ topic: "Pengaduan jalan rusak", count: 52 },
	{ topic: "Info program bansos", count: 48 },
];

const busyHours = [
	{ period: "Pagi (08–12)", percentage: 30 },
	{ period: "Siang (12–16)", percentage: 40 },
	{ period: "Sore (16–20)", percentage: 20 },
	{ period: "Malam (20–08)", percentage: 10 },
];

const JennaAnalytic = () => {
	return (
		<Box p="md">
			<Stack gap="xl">
				<Group justify="space-between" align="center">
					<Title order={1} fw={700}>
						Jenna Analytic
					</Title>
					<Button variant="filled">Export Data</Button>
				</Group>

				{/* KPI Cards */}
				<Grid gutter="lg">
					{kpiData.map((kpi) => (
						<Grid.Col key={kpi.id} span={{ base: 12, md: 6, lg: 3 }}>
							<Card shadow="sm" padding="lg" radius="md" withBorder>
								<Group justify="space-between" align="flex-start" mb="xs">
									<Text size="sm" fw={500} c="dimmed">
										{kpi.title}
									</Text>
									{React.cloneElement(kpi.icon, {
										className: "h-6 w-6", // Keeping classes for now, can be replaced by Mantine Icon component if available or styled with sx prop
										color: "var(--mantine-color-dimmed)", // Set color via prop
									})}
								</Group>
								<Title order={3} fw={700} mt="xs">
									{kpi.value}
								</Title>
								{kpi.delta && (
									<Text
										size="xs"
										c={
											kpi.deltaType === "positive"
												? "green"
												: kpi.deltaType === "negative"
													? "red"
													: "dimmed"
										}
										mt={4}
									>
										{kpi.delta}
									</Text>
								)}
								{kpi.sub && (
									<Text size="xs" c="dimmed" mt={2}>
										{kpi.sub}
									</Text>
								)}
							</Card>
						</Grid.Col>
					))}
				</Grid>

				{/* Charts and Lists Section */}
				<Grid gutter="lg">
					{/* Grafik Interaksi Chatbot (now Table) */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card shadow="sm" padding="lg" radius="md" withBorder>
							<Title order={3} fw={500} mb="md">
								Interaksi Chatbot
							</Title>
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Day</Table.Th>
										<Table.Th>Total Interactions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{chartData.map((item, index) => (
										<Table.Tr key={index}>
											<Table.Td>{item.day}</Table.Td>
											<Table.Td>{item.total}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Card>
					</Grid.Col>

					{/* Topik Pertanyaan Terbanyak & Jam Tersibuk */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Stack gap="lg">
							{/* Topik Pertanyaan Terbanyak */}
							<Card shadow="sm" padding="lg" radius="md" withBorder>
								<Title order={3} fw={500} mb="md">
									Topik Pertanyaan Terbanyak
								</Title>
								<Stack gap="xs">
									{topTopics.map((item, index) => (
										<Group
											key={index}
											justify="space-between"
											align="center"
											p="xs"
											style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}
										>
											<Text size="sm" fw={500}>
												{item.topic}
											</Text>
											<Badge variant="light" color="gray">
												{item.count}x
											</Badge>
										</Group>
									))}
								</Stack>
							</Card>

							{/* Jam Tersibuk */}
							<Card shadow="sm" padding="lg" radius="md" withBorder>
								<Title order={3} fw={500} mb="md">
									Jam Tersibuk
								</Title>
								<Stack gap="sm">
									{busyHours.map((item, index) => (
										<Group key={index} align="center">
											<Text w={80} size="sm">
												{item.period}
											</Text>
											<Progress value={item.percentage} flex={1} />
											<Text size="sm" fw={500}>
												{item.percentage}%
											</Text>
										</Group>
									))}
								</Stack>
							</Card>
						</Stack>
					</Grid.Col>
				</Grid>
			</Stack>
		</Box>
	);

}
export default JennaAnalytic;

