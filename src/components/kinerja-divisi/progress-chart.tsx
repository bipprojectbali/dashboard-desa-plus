import {
	Box,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { apiClient } from "@/utils/api-client";

interface ProgressData {
	name: string;
	value: number;
	color: string;
}

interface ActivityStats {
	total: number;
	counts: {
		selesai: number;
		berjalan: number;
		tertunda: number;
		dibatalkan: number;
	};
	percentages: {
		selesai: number;
		berjalan: number;
		tertunda: number;
		dibatalkan: number;
	};
}

export function ProgressChart() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<ProgressData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchActivityStats() {
			try {
				const res = await apiClient.GET("/api/division/activities/stats");
				if (res.data?.data) {
					const stats = res.data.data as ActivityStats;
					const chartData: ProgressData[] = [
						{
							name: "Selesai",
							value: stats.percentages.selesai,
							color: "#22C55E",
						},
						{
							name: "Dikerjakan",
							value: stats.percentages.berjalan,
							color: "#F59E0B",
						},
						{
							name: "Segera Dikerjakan",
							value: stats.percentages.tertunda,
							color: "#3B82F6",
						},
						{
							name: "Dibatalkan",
							value: stats.percentages.dibatalkan,
							color: "#EF4444",
						},
					];
					setData(chartData);
				}
			} catch (error) {
				console.error("Failed to fetch activity stats", error);
			} finally {
				setLoading(false);
			}
		}

		fetchActivityStats();
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
				Progres Kegiatan
			</Text>
			{loading ? (
				<Group justify="center" py="xl">
					<Loader />
				</Group>
			) : (
				<>
					<ResponsiveContainer width="100%" height={200}>
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								paddingAngle={2}
								dataKey="value"
							>
								{data.map((entry) => (
									<Cell key={`cell-${entry.name}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1E293B" : "white",
									borderColor: dark ? "#334155" : "#e5e7eb",
									borderRadius: "8px",
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
					<Stack gap="xs" mt="md">
						{data.map((item) => (
							<Group key={item.name} justify="space-between">
								<Group gap="xs">
									<Box
										w={12}
										h={12}
										style={{ backgroundColor: item.color, borderRadius: 2 }}
									/>
									<Text size="sm" c={dark ? "white" : "gray.7"}>
										{item.name}
									</Text>
								</Group>
								<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
									{item.value.toFixed(2)}%
								</Text>
							</Group>
						))}
					</Stack>
				</>
			)}
		</Card>
	);
}
