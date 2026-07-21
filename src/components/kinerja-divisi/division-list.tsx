import { Card, Group, Skeleton, Stack, Text } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface DivisionItem {
	name: string;
	count: number;
}

async function fetchDivisionList(): Promise<DivisionItem[]> {
	const { data } = await apiClient.GET("/api/noc/active-divisions");
	return (data?.data ?? []).map((d) => ({
		name: d.name,
		count: d.activityCount || 0,
	}));
}

export function DivisionList() {
	const t = useTranslate();
	const dark = useIsDark();

	const { data: divisions = [], isLoading: loading } = useApiQuery(
		["kinerja", "division-list"],
		fetchDivisionList,
	);

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
			<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"} mb="md">
				{t.kinerjaDivisi.divisiTeraktif}
			</Text>
			<Stack gap="xs">
				{loading ? (
					<Stack gap="xs">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} height={40} radius="md" />
						))}
					</Stack>
				) : divisions.length > 0 ? (
					divisions.map((division) => (
						<Group
							key={division.name}
							justify="space-between"
							align="center"
							style={{
								padding: "8px 12px",
								borderRadius: 8,
								backgroundColor: dark ? "#334155" : "#F1F5F9",
								transition: "background-color 0.2s",
								cursor: "pointer",
							}}
						>
							<Text size="sm" c={dark ? "white" : "#1E3A5F"}>
								{division.name}
							</Text>
							<Group gap="xs">
								<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
									{division.count}
								</Text>
								<ChevronRight size={16} color={dark ? "#94A3B8" : "#64748B"} />
							</Group>
						</Group>
					))
				) : (
					<Text size="xs" c="dimmed" ta="center">
						{t.kinerjaDivisi.tidakAdaDataDivisi}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
