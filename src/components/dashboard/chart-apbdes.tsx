import {
	Card,
	Group,
	Loader,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { apiClient } from "@/utils/api-client";

interface ApbdesData {
	name: string;
	value: number;
	color: string;
}

export function ChartAPBDes() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<ApbdesData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchApbdes() {
			try {
				const res = await apiClient.GET("/api/dashboard/budget");
				if (res.data?.data) {
					setData(
						res.data.data.map((d) => ({
							name: d.category,
							value: d.percentage,
							color: d.color,
						})),
					);
				}
			} catch (error) {
				console.error("Failed to fetch APBDes data", error);
			} finally {
				setLoading(false);
			}
		}

		fetchApbdes();
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
			<Title order={4} c={dark ? "white" : "gray.9"} mb="lg">
				Grafik APBDes
			</Title>
			<Stack gap="xs">
				{loading ? (
					<Group justify="center" py="xl">
						<Loader />
					</Group>
				) : data.length > 0 ? (
					data.map((item) => (
						<Group key={item.name} align="center" gap="md">
							<Text size="sm" fw={500} w={100} c={dark ? "white" : "gray.7"}>
								{item.name}
							</Text>
							<ResponsiveContainer width="100%" height={12} style={{ flex: 1 }}>
								<BarChart
									layout="vertical"
									data={[item]}
									margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
								>
									<XAxis type="number" hide domain={[0, 100]} />
									<YAxis type="category" hide dataKey="name" />
									<Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={12}>
										<Cell fill={item.color} />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
							<Text size="sm" fw={600} w={40} ta="right" c={dark ? "white" : "gray.9"}>
								{item.value}%
							</Text>
						</Group>
					))
				) : (
					<Text size="sm" c="dimmed" ta="center">
						Tidak ada data APBDes
					</Text>
				)}
			</Stack>
		</Card>
	);
}
