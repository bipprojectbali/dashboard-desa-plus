import { Box, Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { Calendar } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface AgendaItem {
	time: string;
	event: string;
}

interface EventCardProps {
	agendas?: AgendaItem[];
}

async function fetchTodayEvents(): Promise<AgendaItem[]> {
	const res = await apiClient.GET("/api/noc/upcoming-events", {
		params: { query: { idDesa: "desa1", filter: "today", limit: "5" } },
	});
	if (res.data?.data) {
		return (res.data.data as { time: string; title: string }[]).map((e) => ({
			time: e.time,
			event: e.title,
		}));
	}
	return [];
}

export function EventCard({ agendas: propAgendas }: EventCardProps) {
	const t = useTranslate();
	const dark = useIsDark();

	// Hanya fetch bila agenda tidak disediakan lewat props.
	const shouldFetch = !propAgendas || propAgendas.length === 0;
	const { data: fetchedAgendas = [], isLoading } = useApiQuery(
		["kinerja", "upcoming-events"],
		fetchTodayEvents,
		{ enabled: shouldFetch },
	);

	const agendas = shouldFetch ? fetchedAgendas : propAgendas;
	const loading = shouldFetch && isLoading;

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
			<Group gap="xs" mb="md">
				<Calendar size={20} color={dark ? "#E2E8F0" : "#1E3A5F"} />
				<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
					{t.kinerjaDivisi.acaraHariIni}
				</Text>
			</Group>
			{loading ? (
				<Stack gap="sm">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} height={32} radius="sm" />
					))}
				</Stack>
			) : agendas.length > 0 ? (
				<Stack gap="sm">
					{agendas.map((agenda) => (
						<Group
							key={`${agenda.time}-${agenda.event}`}
							align="flex-start"
							gap="md"
						>
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
					{t.kinerjaDivisi.tidakAdaAcara}
				</Text>
			)}
		</Card>
	);
}
