import {
	Box,
	Card,
	Group,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { Calendar } from "lucide-react";

interface EventData {
	date: string;
	title: string;
}

const events: EventData[] = [
	{ date: "1 Oktober 2025", title: "Hari Kesaktian Pancasila" },
	{ date: "15 Oktober 2025", title: "Davest" },
	{ date: "19 Oktober 2025", title: "Rapat Koordinasi" },
];

export function ActivityList() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: dark
					? "0 1px 3px 0 rgb(0 0 0 / 0.1)"
					: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="lg">
				<Calendar
					style={{ width: 20, height: 20 }}
					color={dark ? "#E2E8F0" : "#1E3A5F"}
				/>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					Kalender & Kegiatan Mendatang
				</Title>
			</Group>
			<Stack gap="md">
				{events.map((event, index) => (
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
						<Text fw={500} c={dark ? "white" : "gray.9"}>
							{event.title}
						</Text>
					</Box>
				))}
			</Stack>
		</Card>
	);
}
