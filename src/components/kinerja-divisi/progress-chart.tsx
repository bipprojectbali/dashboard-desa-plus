import {
	Box,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslate } from "@/hooks/useTranslate";
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
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<ProgressData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchActivityStats() {
			try {
				const res = await apiClient.GET("/api/noc/diagram-progres-kegiatan", {
					params: { query: { idDesa: "desa1" } },
				});
				if (res.data?.data) {
					const rawData = res.data.data;
					const labels = [
						"Segera Dikerjakan",
						"Dikerjakan",
						"Selesai",
						"Dibatalkan",
					];

					const chartData: ProgressData[] = rawData.map(
						(d: any, index: number) => ({
							name: d.label || labels[index] || "Lainnya",
							value: Number(d.value) || 0,
							color: d.color,
						}),
					);

					setData(chartData);
				}
			} catch (error) {
				console.error("Failed to fetch activity progress from NOC", error);
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
				{t.kinerjaDivisi.progresKegiatan}
			</Text>
			{loading ? (
				<Skeleton height={200} radius="md" />
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
