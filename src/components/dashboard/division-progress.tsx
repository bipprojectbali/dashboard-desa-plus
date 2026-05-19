import {
	Box,
	Card,
	Group,
	Loader,
	Progress,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
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

export function DivisionProgress() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const t = useTranslate();

	const [data, setData] = useState<DivisionData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDivisions() {
			try {
				const res = await apiClient.GET("/api/division/");
				if (res.data?.data) {
					setData(
						(res.data.data as DivisionApiResponse[]).map((d) => ({
							name: d.name,
							value: d.activityCount || 0,
						})),
					);
				}
			} catch (error) {
				console.error("Failed to fetch division stats", error);
			} finally {
				setLoading(false);
			}
		}

		fetchDivisions();
	}, []);

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
					<Group justify="center" py="xl">
						<Loader />
					</Group>
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
