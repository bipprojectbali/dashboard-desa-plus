import {
	ActionIcon,
	Box,
	Card,
	Group,
	Loader,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { apiClient } from "@/utils/api-client";

interface ChartData {
	month: string;
	value: number;
}

export function ChartSurat() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<ChartData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchTrends() {
			try {
				const res = await apiClient.GET("/api/complaint/service-trends");
				console.log("Service trends response:", res);
				if (res.data?.data) {
					const chartData = (res.data.data as { month: string; count: number }[]).map((d) => ({
						month: d.month,
						value: Number(d.count),
					}));
					console.log("Mapped chart data:", chartData);
					setData(chartData);
				} else {
					console.log("No data in response");
				}
			} catch (error) {
				console.error("Failed to fetch service trends", error);
			} finally {
				setLoading(false);
			}
		}

		fetchTrends();
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
			<Group justify="space-between" mb="md">
				<Box>
					<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
						Statistik Pengajuan Surat
					</Title>
					<Text size="sm" c="dimmed">
						Trend pengajuan surat 6 bulan terakhir
					</Text>
				</Box>
				<ActionIcon variant="subtle" size="lg" radius="md">
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Tampilkan Detail"
					>
						<title>Tampilkan Detail</title>
						<path
							d="M8 5L13 10L8 15"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</ActionIcon>
			</Group>
			<ResponsiveContainer width="100%" height={300}>
				{loading ? (
					<Group justify="center" align="center" h="100%">
						<Loader />
					</Group>
				) : (
					<BarChart data={data}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={dark ? "#334155" : "#e5e7eb"}
						/>
						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
								boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
							}}
							labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Bar
							dataKey="value"
							fill="var(--mantine-color-blue-filled)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				)}
			</ResponsiveContainer>
		</Card>
	);
}
