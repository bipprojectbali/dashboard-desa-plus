import {
	Card,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";

interface EventItem {
	id: string;
	nama: string;
	tanggal: string;
	lokasi: string;
}

interface EventCalendarProps {
	data?: EventItem[];
}

export const EventCalendar = ({ data }: EventCalendarProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: EventItem[] = [
		{
			id: "1",
			nama: "Hari Kesaktian Pancasila",
			tanggal: "1 Oktober 2025",
			lokasi: "Balai Desa",
		},
		{
			id: "2",
			nama: "Festival Budaya Desa",
			tanggal: "20 Mei 2026",
			lokasi: "Lapangan Desa",
		},
		{
			id: "3",
			nama: "Perayaan HUT Desa",
			tanggal: "17 Agustus 2026",
			lokasi: "Balai Desa",
		},
	];

	const displayData = data || defaultData;

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#141D34" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				Kalender Event Budaya
			</Title>
			<Stack gap="sm">
				{displayData.map((event) => (
					<Card
						key={event.id}
						p="md"
						radius="md"
						withBorder
						bg={dark ? "#263852ff" : "#F1F5F9"}
						style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
						hoverable
					>
						<Group justify="space-between" mb="xs">
							<Group gap="sm" align="center">
								<ThemeIcon
									color="darmasaba-blue"
									size="md"
									radius="xl"
									variant="light"
								>
									<IconCalendarEvent size={16} />
								</ThemeIcon>
								<Text fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
									{event.nama}
								</Text>
							</Group>
							<Text size="sm" c={dark ? "dark.3" : "dimmed"} fw={500}>
								{event.lokasi}
							</Text>
						</Group>
						<Group pl={36}>
							<Text size="sm" c={dark ? "dark.4" : "gray.6"}>
								{event.tanggal}
							</Text>
						</Group>
					</Card>
				))}
			</Stack>
		</Card>
	);
};
