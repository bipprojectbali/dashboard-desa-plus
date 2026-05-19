import {
	Box,
	Card,
	Group,
	Loader,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface SatisfactionData {
	apiName: string;
	value: number;
	color: string;
}

// Mapping dari NOC API name ke warna dan translation key
const RATING_NAME_MAP: Record<
	string,
	{ color: string; order: number; key: "sangatPuas" | "puas" | "cukup" | "kurang" }
> = {
	"Sangat Baik": { color: "#10B981", order: 0, key: "sangatPuas" },
	Baik: { color: "#3B82F6", order: 1, key: "puas" },
	"Kurang Baik": { color: "#F59E0B", order: 2, key: "cukup" },
	"Sangat Kurang Baik": { color: "#EF4444", order: 3, key: "kurang" },
};

export function SatisfactionChart() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const t = useTranslate();

	const [data, setData] = useState<SatisfactionData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSatisfaction() {
			try {
				// Fetch data responden LANGSUNG dari external API
				const externalApiUrl =
					(typeof import.meta.env !== "undefined" &&
						import.meta.env?.VITE_DESA_API_URL) ||
					"https://desa-darmasaba-stg.wibudev.com";

				const respondentsResponse = await fetch(
					`${externalApiUrl}/api/landingpage/responden/findMany`,
				);

				if (!respondentsResponse.ok) {
					throw new Error(`External API error: ${respondentsResponse.status}`);
				}

				const respondentsJson = await respondentsResponse.json();

				if (
					!respondentsJson.success ||
					!respondentsJson.data ||
					respondentsJson.data.length === 0
				) {
					throw new Error("No respondents data from external API");
				}

				// Aggregate: hitung jumlah setiap rating
				const ratingCounts: Record<string, number> = {};

				respondentsJson.data.forEach(
					(responden: { rating: { name: string } }) => {
						const ratingName = responden.rating?.name;
						if (ratingName) {
							ratingCounts[ratingName] = (ratingCounts[ratingName] || 0) + 1;
						}
					},
				);

				// Map ke format chart
				const chartData: SatisfactionData[] = Object.entries(RATING_NAME_MAP)
					.filter(([apiName]) => ratingCounts[apiName])
					.map(([apiName, mapping]) => ({
						apiName,
						value: ratingCounts[apiName] ?? 0,
						color: mapping.color,
					}))
					.sort((a, b) => a.value - b.value);

				if (chartData.length === 0) {
					throw new Error("No valid rating data found");
				}

				setData(chartData);
			} catch (error) {
				console.error("Failed to fetch satisfaction data", error);

				// Error fallback: pakai data dari local DB
				try {
					const countsRes = await apiClient.GET(
						"/api/dashboard/satisfaction",
						{},
					);
					if (countsRes.data?.data) {
						setData(
							countsRes.data.data.map((d) => ({
								apiName: d.category,
								value: d.value,
								color: d.color,
							})),
						);
					}
				} catch (fallbackError) {
					console.error("Fallback fetch also failed", fallbackError);
				}
			} finally {
				setLoading(false);
			}
		}

		fetchSatisfaction();
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
			<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
				{t.dashboard.tingkatKepuasan}
			</Title>
			<Text size="sm" c="dimmed" mb="md">
				{t.dashboard.tingkatKepuasanSubtitle}
			</Text>
			<ResponsiveContainer width="100%" height={300}>
				{loading ? (
					<Group justify="center" align="center" h="100%">
						<Loader />
					</Group>
				) : (
					<PieChart>
						<Pie
							data={data.map((item) => ({
								...item,
								name: t.dashboard[RATING_NAME_MAP[item.apiName]?.key ?? "puas"] ?? item.apiName,
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
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
							}}
						/>
					</PieChart>
				)}
			</ResponsiveContainer>
			<Group justify="center" gap="md" mt="md">
				{data.map((item) => (
					<Group key={item.apiName} gap="xs">
						<Box
							w={12}
							h={12}
							style={{ backgroundColor: item.color, borderRadius: "50%" }}
						/>
						<Text size="sm" c={dark ? "white" : "gray.7"}>
							{t.dashboard[RATING_NAME_MAP[item.apiName]?.key ?? "puas"] ?? item.apiName}
						</Text>
					</Group>
				))}
			</Group>
		</Card>
	);
}
