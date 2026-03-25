import {
	Box,
	Card,
	Group,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const progressData = [
	{ name: "Selesai", value: 83.33, color: "#22C55E" },
	{ name: "Dikerjakan", value: 16.67, color: "#F59E0B" },
	{ name: "Segera Dikerjakan", value: 0, color: "#3B82F6" },
	{ name: "Dibatalkan", value: 0, color: "#EF4444" },
];

export function ProgressChart() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

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
			<ResponsiveContainer width="100%" height={200}>
				<PieChart>
					<Pie
						data={progressData}
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={80}
						paddingAngle={2}
						dataKey="value"
					>
						{progressData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
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
				{progressData.map((item, index) => (
					<Group key={index} justify="space-between">
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
		</Card>
	);
}
