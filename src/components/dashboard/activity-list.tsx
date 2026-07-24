import { Box, Card, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface EventData {
	date: string;
	title: string;
}

async function fetchUpcomingEvents(): Promise<EventData[]> {
	const res = await apiClient.GET("/api/noc/upcoming-events", {
		params: { query: { idDesa: "desa1", limit: "10" } },
	});
	if (res.data?.data) {
		return (res.data.data as { startDate: string; title: string }[]).map(
			(e) => ({
				date: dayjs(e.startDate).format("D MMMM YYYY"),
				title: e.title,
			}),
		);
	}
	return [];
}

export function ActivityList() {
	const dark = useIsDark();
	const t = useTranslate();

	const { data = [], isLoading: loading } = useApiQuery(
		["dashboard", "upcoming-events"],
		fetchUpcomingEvents,
		{ autoRefresh: true },
	);

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="lg">
				<Calendar style={{ width: 20, height: 20, color: "var(--app-text)" }} />
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.dashboard.kalenderKegiatan}
				</Title>
			</Group>
			<Stack gap="md">
				{loading ? (
					<Stack gap="md">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} height={40} radius="sm" />
						))}
					</Stack>
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
						{t.dashboard.tidakAdaKegiatan}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
