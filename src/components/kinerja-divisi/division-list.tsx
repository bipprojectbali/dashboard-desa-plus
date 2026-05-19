import {
	Card,
	Group,
	Loader,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface DivisionItem {
	name: string;
	count: number;
}

interface DivisionApiResponse {
	name: string;
	activityCount: number;
	_count?: {
		activities: number;
	};
}

export function DivisionList() {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [divisions, setDivisions] = useState<DivisionItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDivisions() {
			try {
				const { data } = await apiClient.GET("/api/division/");
				if (data?.data) {
					const mapped = (data.data as DivisionApiResponse[]).map((div) => ({
						name: div.name,
						count: div.activityCount || 0,
					}));
					setDivisions(mapped);
				}
			} catch (error) {
				console.error("Failed to fetch divisions", error);
			} finally {
				setLoading(false);
			}
		}

		fetchDivisions();
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
			<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"} mb="md">
				{t.dashboard.divisiTeraktif}
			</Text>
			<Stack gap="xs">
				{loading ? (
					<Group justify="center" py="xl">
						<Loader size="sm" />
					</Group>
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
						{t.dashboard.tidakAdaDataDivisi}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
