import {
	Box,
	Card,
	Group,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { Calendar } from "lucide-react";

interface AgendaItem {
	time: string;
	event: string;
}

interface EventCardProps {
	agendas?: AgendaItem[];
}

export function EventCard({ agendas = [] }: EventCardProps) {
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
		>
			<Group gap="xs" mb="md">
				<Calendar size={20} color={dark ? "#E2E8F0" : "#1E3A5F"} />
				<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
					Acara Hari Ini
				</Text>
			</Group>
			{agendas.length > 0 ? (
				<Stack gap="sm">
					{agendas.map((agenda, index) => (
						<Group key={index} align="flex-start" gap="md">
							<Box w={60}>
								<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
									{agenda.time}
								</Text>
							</Box>
							<Text size="sm" c={dark ? "white" : "#1E3A5F"}>
								{agenda.event}
							</Text>
						</Group>
					))}
				</Stack>
			) : (
				<Text c="dimmed" ta="center" py="md">
					Tidak ada acara hari ini
				</Text>
			)}
		</Card>
	);
}
