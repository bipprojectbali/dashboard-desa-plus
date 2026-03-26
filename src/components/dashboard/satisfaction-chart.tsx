import {
	Box,
	Card,
	Group,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const satisfactionData = [
	{ name: "Sangat Puas", value: 25, color: "#4E5BA6" },
	{ name: "Puas", value: 25, color: "#F4C542" },
	{ name: "Cukup", value: 25, color: "#8CC63F" },
	{ name: "Kurang", value: 25, color: "#E57373" },
];

export function SatisfactionChart() {
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
			<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
				Tingkat Kepuasan
			</Title>
			<Text size="sm" c="dimmed" mb="md">
				Tingkat kepuasan layanan
			</Text>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart>
					<Pie
						data={satisfactionData}
						cx="50%"
						cy="50%"
						innerRadius={80}
						outerRadius={120}
						paddingAngle={2}
						dataKey="value"
					>
						{satisfactionData.map((entry) => (
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
			<Group justify="center" gap="md" mt="md">
				{satisfactionData.map((item) => (
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
