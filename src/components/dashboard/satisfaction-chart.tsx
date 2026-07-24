import { Box, Card, Group, Skeleton, Text, Title } from "@mantine/core";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";
import { apiClient } from "@/utils/api-client";

interface SatisfactionData {
	apiName: string;
	value: number;
	color: string;
}

// Mapping dari NOC API name ke warna dan translation key
const RATING_NAME_MAP: Record<
	string,
	{
		color: string;
		order: number;
		key: "sangatPuas" | "puas" | "cukup" | "kurang";
	}
> = {
	"Sangat Baik": { color: CHART.green, order: 0, key: "sangatPuas" },
	Baik: { color: CHART.blue, order: 1, key: "puas" },
	"Kurang Baik": { color: CHART.amber, order: 2, key: "cukup" },
	"Sangat Kurang Baik": { color: CHART.red, order: 3, key: "kurang" },
};

// Alias nama kategori seed DB (fallback) → key RATING_NAME_MAP.
// Seed lama pakai "Sangat Puas"/"Puas"/dst, NOC API pakai "Sangat Baik"/"Baik"/dst.
const FALLBACK_CATEGORY_ALIAS: Record<string, keyof typeof RATING_NAME_MAP> = {
	"Sangat Puas": "Sangat Baik",
	Puas: "Baik",
	Cukup: "Kurang Baik",
	Kurang: "Sangat Kurang Baik",
};

async function fetchSatisfaction(): Promise<SatisfactionData[]> {
	// Ambil data responden via proxy internal (server-side fetch, bebas CORS).
	const respondenRes = await apiClient.GET(
		"/api/dashboard/satisfaction-responden",
		{},
	);
	const respondenData = respondenRes.data?.data;
	if (respondenData && respondenData.length > 0) {
		return respondenData.map((d) => ({
			apiName: d.apiName,
			value: d.value,
			color: d.color,
		}));
	}

	// Fallback: pakai data dari local DB. Normalisasi category seed lama
	// ke apiName yang dikenal RATING_NAME_MAP supaya label tetap benar.
	const countsRes = await apiClient.GET("/api/dashboard/satisfaction", {});
	if (countsRes.data?.data) {
		return countsRes.data.data.map((d) => ({
			apiName: FALLBACK_CATEGORY_ALIAS[d.category] ?? d.category,
			value: d.value,
			color: d.color,
		}));
	}
	return [];
}

export function SatisfactionChart() {
	const dark = useIsDark();
	const t = useTranslate();

	const { data = [], isLoading: loading } = useApiQuery(
		["dashboard", "satisfaction"],
		fetchSatisfaction,
		{ autoRefresh: true },
	);

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
				{t.dashboard.tingkatKepuasan}
			</Title>
			<Text size="sm" c="dimmed" mb="md">
				{t.dashboard.tingkatKepuasanSubtitle}
			</Text>
			{loading ? (
				<Skeleton height={300} radius="md" />
			) : (
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie
							data={data.map((item) => ({
								...item,
								name:
									t.dashboard[RATING_NAME_MAP[item.apiName]?.key ?? "puas"] ??
									item.apiName,
							}))}
							cx="50%"
							cy="50%"
							innerRadius={80}
							outerRadius={120}
							paddingAngle={2}
							dataKey="value"
						>
							{data.map((entry) => (
								<Cell key={`cell-${entry.apiName}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--app-card)",
								borderColor: "var(--app-border)",
								borderRadius: "8px",
							}}
							itemStyle={{ color: "var(--app-text)" }}
							labelStyle={{ color: "var(--app-text)" }}
						/>
					</PieChart>
				</ResponsiveContainer>
			)}
			<Group justify="center" gap="md" mt="md">
				{data.map((item) => (
					<Group key={item.apiName} gap="xs">
						<Box
							w={12}
							h={12}
							style={{ backgroundColor: item.color, borderRadius: "50%" }}
						/>
						<Text size="sm" c={dark ? "white" : "gray.7"}>
							{t.dashboard[RATING_NAME_MAP[item.apiName]?.key ?? "puas"] ??
								item.apiName}
						</Text>
					</Group>
				))}
			</Group>
		</Card>
	);
}
