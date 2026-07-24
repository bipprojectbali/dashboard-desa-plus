import {
	ActionIcon,
	Box,
	Card,
	Group,
	Skeleton,
	Text,
	Title,
} from "@mantine/core";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";
import { apiClient } from "@/utils/api-client";

interface ChartData {
	month: string;
	value: number;
}

async function fetchServiceTrends(): Promise<ChartData[]> {
	const res = await apiClient.GET("/api/complaint/service-trends");

	if (
		res.data?.data &&
		Array.isArray(res.data.data) &&
		res.data.data.length > 0
	) {
		return (res.data.data as { month: string; count: number }[]).map((d) => ({
			month: d.month,
			value: Number(d.count),
		}));
	}
	return [];
}

export function ChartSurat() {
	const dark = useIsDark();
	const t = useTranslate();

	const { data = [], isLoading: loading } = useApiQuery(
		["dashboard", "service-trends"],
		fetchServiceTrends,
		{ autoRefresh: true },
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
			<Group justify="space-between" mb="md">
				<Box>
					<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
						{t.dashboard.statistikSurat}
					</Title>
					<Text size="sm" c="dimmed">
						{t.dashboard.trendSurat}
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
						aria-label={t.dashboard.tampilkanDetail}
					>
						<title>{t.dashboard.tampilkanDetail}</title>
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
			<Box style={{ width: "100%", height: 300 }}>
				{loading ? (
					<Skeleton height={300} radius="md" />
				) : data.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
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
								allowDecimals={false}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1E293B" : "white",
									borderColor: dark ? "#334155" : "#e5e7eb",
									borderRadius: "8px",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								}}
								itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
								labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							/>
							<Bar dataKey="value" fill={CHART.blue} radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				) : (
					<Group justify="center" align="center" h="100%">
						<Text size="sm" c="dimmed">
							{t.dashboard.tidakAdaDataSurat}
						</Text>
					</Group>
				)}
			</Box>
		</Card>
	);
}
