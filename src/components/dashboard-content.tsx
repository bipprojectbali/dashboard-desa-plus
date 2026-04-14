import { Center, Grid, Image, Loader, Stack } from "@mantine/core";
import { CheckCircle, FileText, MessageCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";
import {
	getComplaintCount,
	getWeeklyServiceCount,
} from "@/utils/jenna-mcp-client";
import { ActivityList } from "./dashboard/activity-list";
import { ChartAPBDes } from "./dashboard/chart-apbdes";
import { ChartSurat } from "./dashboard/chart-surat";
import { DivisionProgress } from "./dashboard/division-progress";
import { SatisfactionChart } from "./dashboard/satisfaction-chart";
import { SDGSCard } from "./dashboard/sdgs-card";
import { StatCard } from "./dashboard/stat-card";

export function DashboardContent() {
	const [stats, setStats] = useState({
		complaints: { total: 0, baru: 0, proses: 0, selesai: 0 },
		residents: { total: 0, heads: 0, poor: 0 },
		weeklyService: 0,
		loading: true,
	});

	const [sdgsData, setSdgsData] = useState<
		{ title: string; score: number; image: string | null }[]
	>([]);
	const [sdgsLoading, setSdgsLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				// Fetch from external Jenna MCP APIs
				const [weeklyServiceCount, complaintData] = await Promise.all([
					getWeeklyServiceCount(),
					getComplaintCount(),
				]);

				console.log("[Dashboard] Complaint Data from API:", complaintData);
				console.log("[Dashboard] Weekly Service Count:", weeklyServiceCount);

				// Fetch from internal APIs
				const [residentRes, sdgsRes] = await Promise.all([
					apiClient.GET("/api/resident/stats"),
					apiClient.GET("/api/dashboard/sdgs"),
				]);

				// Map API data to stat card format
				const complaints = {
					total: complaintData.total ?? 0,
					baru: complaintData.antrian ?? 0,
					proses:
						(complaintData.diterima ?? 0) + (complaintData.dikerjakan ?? 0),
					selesai: complaintData.selesai ?? 0,
				};

				console.log("[Dashboard] Mapped Complaints:", complaints);

				const residents = (residentRes.data as { data: typeof stats.residents })
					?.data || {
					total: 0,
					heads: 0,
					poor: 0,
				};

				setStats({
					complaints,
					residents,
					weeklyService: weeklyServiceCount,
					loading: false,
				});

				if (sdgsRes.data?.data) {
					setSdgsData(sdgsRes.data.data);
				}
				setSdgsLoading(false);
			} catch (error) {
				console.error("[Dashboard] Failed to fetch dashboard content:", error);
				setStats((prev) => ({ ...prev, loading: false }));
				setSdgsLoading(false);
			}
		}

		fetchStats();
	}, []);

	return (
		<Stack gap={"md"}>
			{/* Header Metrics - 4 Stat Cards */}
			<Grid gutter={{ base: "xs", md: "md" }}>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<StatCard
						title="Surat Minggu Ini"
						value={stats.weeklyService}
						detail="Total surat diajukan"
						icon={<FileText style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<StatCard
						title="Pengaduan Aktif"
						value={stats.complaints.baru + stats.complaints.proses}
						detail={`${stats.complaints.baru} baru, ${stats.complaints.proses} diproses`}
						icon={<MessageCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<StatCard
						title="Layanan Selesai"
						value={stats.complaints.selesai}
						detail="Total diselesaikan"
						icon={<CheckCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<StatCard
						title="Total Penduduk"
						value={stats.residents.total.toLocaleString()}
						detail={`${stats.residents.heads} Kepala Keluarga`}
						icon={<Users style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
			</Grid>

			{/* Section 2: Chart & Division Progress */}
			<Grid gutter={{ base: "xs", md: "lg" }}>
				<Grid.Col span={{ base: 12, lg: 7 }}>
					<ChartSurat />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<SatisfactionChart />
				</Grid.Col>
			</Grid>

			{/* Section 3: APBDes Chart */}
			<Grid gutter={{ base: "xs", md: "lg" }}>
				<Grid.Col span={{ base: 12, lg: 7 }}>
					<DivisionProgress />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<ActivityList />
					{/* <SatisfactionChart /> */}
				</Grid.Col>
			</Grid>

			<ChartAPBDes />

			{/* Section 6: SDGs Desa Cards */}
			{sdgsLoading ? (
				<Center py="xl">
					<Loader />
				</Center>
			) : (
				<Grid gutter={{ base: "xs", md: "md" }}>
					{sdgsData.map((sdg) => (
						<Grid.Col key={sdg.title} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
							<SDGSCard
								image={
									sdg.image ? <Image src={sdg.image} alt={sdg.title} /> : null
								}
								title={sdg.title}
								score={sdg.score}
							/>
						</Grid.Col>
					))}
				</Grid>
			)}
		</Stack>
	);
}
