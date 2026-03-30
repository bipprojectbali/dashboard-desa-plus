import {
	Card,
	Group,
	Loader,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { apiClient } from "@/utils/api-client";

interface DocumentData {
	name: string;
	jumlah: number;
	color: string;
}

export function DocumentChart() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<DocumentData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDocumentStats() {
			try {
				const res = await apiClient.GET("/api/division/documents/stats");
				if (res.data?.data) {
					setData(res.data.data);
				}
			} catch (error) {
				console.error("Failed to fetch document stats", error);
			} finally {
				setLoading(false);
			}
		}

		fetchDocumentStats();
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
				Jumlah Dokumen
			</Text>
			{loading ? (
				<Group justify="center" py="xl">
					<Loader />
				</Group>
			) : data.length > 0 ? (
				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={data}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={dark ? "#334155" : "#e5e7eb"}
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
							allowDecimals={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
							}}
							labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
							{data.map((entry) => (
								<Cell key={`cell-${entry.name}`} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<Group justify="center" py="xl">
					<Text size="sm" c="dimmed">
						Tidak ada dokumen
					</Text>
				</Group>
			)}
		</Card>
	);
}
