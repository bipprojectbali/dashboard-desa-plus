import {
	Box,
	Card,
	Group,
	Progress,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface DivisionData {
	name: string;
	value: number;
}

interface DivisionApiResponse {
	id: string;
	name: string;
	activityCount: number;
	_count?: {
		activities: number;
	};
}

async function fetchDivisions(): Promise<DivisionData[]> {
	// Repoint ke /api/noc/active-divisions (live NOC proxy, idDesa dari server default)
	const res = await apiClient.GET("/api/noc/active-divisions");
	if (res.data?.data) {
		return (res.data.data as DivisionApiResponse[]).map((d) => ({
			name: d.name,
			value: d.activityCount || 0,
		}));
	}
	return [];
}

export function DivisionProgress() {
	const dark = useIsDark();
	const t = useTranslate();

	const { data = [], isLoading: loading } = useApiQuery(
		["dashboard", "division"],
		fetchDivisions,
		{ autoRefresh: true },
	);

	const max_value = Math.max(...data.map((d) => d.value), 1);

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
			<Title order={4} c={dark ? "white" : "gray.9"} mb="lg">
				{t.dashboard.divisiTeraktif}
			</Title>
			<Stack gap="sm">
				{loading ? (
					<Stack gap="sm">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} height={36} radius="sm" />
						))}
					</Stack>
				) : data.length > 0 ? (
					data.map((divisi) => (
						<Box key={divisi.name}>
							<Group justify="space-between" mb={5}>
								<Text size="sm" fw={500} c={dark ? "white" : "gray.7"}>
									{divisi.name}
								</Text>
								<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
									{divisi.value} {t.dashboard.kegiatan}
								</Text>
							</Group>
							<Progress
								value={(divisi.value / max_value) * 100}
								size="sm"
								radius="xl"
								color="blue"
								animated
							/>
						</Box>
					))
				) : (
					<Text size="sm" c="dimmed" ta="center">
						{t.dashboard.tidakAdaDataDivisi}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
