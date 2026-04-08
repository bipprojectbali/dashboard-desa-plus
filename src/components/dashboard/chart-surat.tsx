import {
	ActionIcon,
	Box,
	Card,
	Group,
	Loader,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getEnv } from "@/utils/env";

interface ChartData {
	month: string;
	value: number;
}

const REFRESH_EVENT_NAME = "noc-sync-completed";

export function ChartSurat() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [data, setData] = useState<ChartData[]>([]);
	const [loading, setLoading] = useState(true);

	async function fetchPengajuanHistory() {
		try {
			const response = await fetch("/api/noc/pengajuan-history", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${getEnv("NOC_API_TOKEN", "")}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const res = await response.json();
			console.log("📊 Pengajuan history response:", res);

			// API returns array directly: [{ label: "November", total: 0 }, ...]
			if (Array.isArray(res) && res.length > 0) {
				const chartData = res.map((item: { label: string; total: number }) => ({
					month: item.label,
					value: Number(item.total),
				}));
				console.log("📈 Mapped chart data:", chartData);
				console.log("✅ Chart data count:", chartData.length);
				setData(chartData);
			} else {
				console.warn("⚠️ No data in response or empty array");
				console.log("Response structure:", JSON.stringify(res, null, 2));
				setData([]);
			}
		} catch (error) {
			console.error("❌ Failed to fetch pengajuan history", error);
			console.log("Error details:", error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchPengajuanHistory();

		// Listen for sync completion event
		const handleSyncComplete = () => {
			console.log("🔄 Sync complete event received, refreshing chart data...");
			setLoading(true);
			fetchPengajuanHistory();
		};

		window.addEventListener(REFRESH_EVENT_NAME, handleSyncComplete);

		return () => {
			window.removeEventListener(REFRESH_EVENT_NAME, handleSyncComplete);
		};
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
			<Group justify="space-between" mb="md">
				<Box>
					<Title order={4} c={dark ? "white" : "gray.9"} mb={5}>
						Statistik Pengajuan Surat
					</Title>
					<Text size="sm" c="dimmed">
						Trend pengajuan surat 6 bulan terakhir
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
						aria-label="Tampilkan Detail"
					>
						<title>Tampilkan Detail</title>
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
					<Group justify="center" align="center" h="100%">
						<Loader />
					</Group>
				) : data.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
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
								labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							/>
							<Bar
								dataKey="value"
								fill={dark ? "#60A5FA" : "#3B82F6"}
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<Group justify="center" align="center" h="100%">
						<Text size="sm" c="dimmed">
							Tidak ada data pengajuan surat 6 bulan terakhir
						</Text>
					</Group>
				)}
			</Box>
		</Card>
	);
}
