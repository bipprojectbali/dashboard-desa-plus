import { Card, Text, useMantineColorScheme } from "@mantine/core";
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

const documentData = [
	{ name: "Gambar", jumlah: 300, color: "#FACC15" },
	{ name: "Dokumen", jumlah: 310, color: "#22C55E" },
];

export function DocumentChart() {
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
				Jumlah Dokumen
			</Text>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={documentData}>
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
						{documentData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}
