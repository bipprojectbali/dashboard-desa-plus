import {
	Box,
	Card,
	Group,
	Loader,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { apiClient } from "@/utils/api-client";

interface SatisfactionData {
	name: string;
	value: number;
	color: string;
}

export function SatisfactionChart() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<SatisfactionData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSatisfaction() {
			try {
				const res = await apiClient.GET("/api/dashboard/satisfaction");
				if (res.data?.data) {
					setData(
						res.data.data.map((d) => ({
							name: d.category,
							value: d.value,
							color: d.color,
						})),
					);
				}
			} catch (error) {
				console.error("Failed to fetch satisfaction data", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSatisfaction();
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
			<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
				Tingkat Kepuasan
			</Title>
			<Text size="sm" c="dimmed" mb="md">
				Tingkat kepuasan layanan
			</Text>
			<ResponsiveContainer width="100%" height={300}>
				{loading ? (
					<Group justify="center" align="center" h="100%">
						<Loader />
					</Group>
				) : (
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={80}
							outerRadius={120}
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
				)}
			</ResponsiveContainer>
			<Group justify="center" gap="md" mt="md">
				{data.map((item) => (
					<Group key={item.name} gap="xs">
						<Box
							w={12}
							h={12}
							style={{ backgroundColor: item.color, borderRadius: "50%" }}
						/>
						<Text size="sm" c={dark ? "white" : "gray.7"}>
							{item.name}
						</Text>
					</Group>
				))}
			</Group>
		</Card>
	);
}
