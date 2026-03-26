import {
	Card,
	Group,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	Bar,
	BarChart,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const apbdesData = [
	{ name: "Belanja", value: 70, color: "#3B82F6" },
	{ name: "Pangan", value: 45, color: "#22C55E" },
	{ name: "Pembiayaan", value: 55, color: "#FACC15" },
	{ name: "Pendapatan", value: 90, color: "#3B82F6" },
];

export function ChartAPBDes() {
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
			<Title order={4} c={dark ? "white" : "gray.9"} mb="lg">
				Grafik APBDes
			</Title>
			<Stack gap="xs">
				{apbdesData.map((item) => (
					<Group key={item.name} align="center" gap="md">
						<Text size="sm" fw={500} w={100} c={dark ? "white" : "gray.7"}>
							{item.name}
						</Text>
						<ResponsiveContainer width="100%" height={20}>
							<BarChart layout="vertical" data={[item]}>
								<XAxis type="number" hide domain={[0, 100]} />
								<YAxis type="category" hide dataKey="name" />
								<Tooltip
									formatter={(value: number | string | undefined) => [
										`${value}%`,
										"",
									]}
									contentStyle={{
										backgroundColor: dark ? "#1E293B" : "white",
										borderColor: dark ? "#334155" : "#e5e7eb",
										borderRadius: "8px",
									}}
								/>
								<Bar dataKey="value" radius={[4, 4, 4, 4]}>
									<Cell fill={item.color} />
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</Group>
				))}
			</Stack>
		</Card>
	);
}
