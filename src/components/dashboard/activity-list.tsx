import {
	Box,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";

interface EventData {
	date: string;
	title: string;
}

export function ActivityList() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<EventData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchEvents() {
			try {
				const res = await apiClient.GET("/api/event/");
				if (res.data?.data) {
					setData(
						(res.data.data as any[]).map((e) => ({
							date: dayjs(e.startDate).format("D MMMM YYYY"),
							title: e.title,
						})),
					);
				}
			} catch (error) {
				console.error("Failed to fetch events", error);
			} finally {
				setLoading(false);
			}
		}

		fetchEvents();
	}, []);

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
				{loading ? (
					<Group justify="center" py="xl">
						<Loader />
					</Group>
				) : data.length > 0 ? (
					data.map((event) => (
						<Box
							key={`${event.title}-${event.date}`}
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
					))
				) : (
					<Text size="sm" c="dimmed" ta="center">
						Tidak ada kegiatan mendatang
					</Text>
				)}
			</Stack>
		</Card>
	);
}
