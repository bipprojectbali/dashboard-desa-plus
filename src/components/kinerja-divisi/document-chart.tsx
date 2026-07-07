import {
	Card,
	Group,
	Skeleton,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface DocumentData {
	label: string;
	value: number;
	color: string;
}

async function fetchDocumentStats(): Promise<DocumentData[]> {
	const res = await apiClient.GET("/api/noc/diagram-jumlah-document", {
		params: {
			query: {
				idDesa: "desa1",
			},
		},
	});
	return res.data?.data ?? [];
}

export function DocumentChart() {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const { data = [], isLoading: loading } = useApiQuery(
		["kinerja", "document-diagram"],
		fetchDocumentStats,
	);

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
				{t.kinerjaDivisi.jumlahDokumen}
			</Text>
			{loading ? (
				<Skeleton height={200} radius="md" />
			) : data.length > 0 ? (
				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={data}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={dark ? "#334155" : "#e5e7eb"}
						/>
						<XAxis
							dataKey="label"
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
						<Bar dataKey="value" radius={[4, 4, 0, 0]}>
							{data.map((entry) => (
								<Cell key={`cell-${entry.label}`} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<Group justify="center" py="xl">
					<Text size="sm" c="dimmed">
						{t.kinerjaDivisi.tidakAdaDokumen}
					</Text>
				</Group>
			)}
		</Card>
	);
}
