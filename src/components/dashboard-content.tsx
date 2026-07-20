import { Grid, Image, Skeleton, Stack } from "@mantine/core";
import { CheckCircle, FileText, MessageCircle, Users } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";
import { ActivityList } from "./dashboard/activity-list";
import { ChartAPBDes } from "./dashboard/chart-apbdes";
import { ChartSurat } from "./dashboard/chart-surat";
import { DivisionProgress } from "./dashboard/division-progress";
import { SatisfactionChart } from "./dashboard/satisfaction-chart";
import { SDGSCard } from "./dashboard/sdgs-card";
import { StatCard } from "./dashboard/stat-card";

interface DashboardStats {
	complaints: { total: number; baru: number; proses: number; selesai: number };
	residents: { total: number; heads: number };
	weeklyService: number;
}

type SdgsItem = { title: string; score: number; image: string | null };

async function fetchDashboardStats(): Promise<DashboardStats> {
	const [complaintRes, demografiRes, weeklyServiceRes] = await Promise.all([
		apiClient.GET("/api/complaint/stats"),
		apiClient.GET("/api/demografi/summary"),
		apiClient.GET("/api/complaint/service-weekly"),
	]);

	const summary = (
		demografiRes.data as {
			data?: { summary?: { totalPenduduk?: number; totalKK?: number } };
		}
	)?.data?.summary;
	return {
		complaints: (complaintRes.data as { data: DashboardStats["complaints"] })
			?.data || { total: 0, baru: 0, proses: 0, selesai: 0 },
		residents: {
			total: summary?.totalPenduduk ?? 0,
			heads: summary?.totalKK ?? 0,
		},
		weeklyService:
			(weeklyServiceRes.data as { data: { count: number } })?.data?.count || 0,
	};
}

async function fetchSdgs(): Promise<SdgsItem[]> {
	const sdgsRes = await apiClient.GET("/api/dashboard/sdgs");
	return sdgsRes.data?.data ?? [];
}

const EMPTY_STATS: DashboardStats = {
	complaints: { total: 0, baru: 0, proses: 0, selesai: 0 },
	residents: { total: 0, heads: 0 },
	weeklyService: 0,
};

export function DashboardContent() {
	const { data: stats = EMPTY_STATS } = useApiQuery(
		["dashboard", "stats"],
		fetchDashboardStats,
		{ autoRefresh: true },
	);

	const { data: sdgsData = [], isLoading: sdgsLoading } = useApiQuery(
		["dashboard", "sdgs"],
		fetchSdgs,
		{ autoRefresh: true },
	);

	const t = useTranslate();

	return (
		<Stack gap="lg">
			{/* Header Metrics - 4 Stat Cards */}
			<Grid gutter="md">
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title={t.dashboard.suratMingguIni}
						value={stats.weeklyService}
						detail={t.dashboard.totalSuratDiajukan}
						icon={<FileText style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title={t.dashboard.pengaduanAktif}
						value={stats.complaints.baru + stats.complaints.proses}
						detail={`${stats.complaints.baru} ${t.dashboard.baru}, ${stats.complaints.proses} ${t.dashboard.diproses}`}
						icon={<MessageCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title={t.dashboard.layananSelesai}
						value={stats.complaints.selesai}
						detail={t.dashboard.totalDiselesaikan}
						icon={<CheckCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title={t.dashboard.totalPenduduk}
						value={stats.residents.total.toLocaleString()}
						detail={`${stats.residents.heads} ${t.dashboard.kepalaKeluarga}`}
						icon={<Users style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
			</Grid>

			{/* Section 2: Chart & Division Progress */}
			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 7 }}>
					<ChartSurat />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<SatisfactionChart />
				</Grid.Col>
			</Grid>

			{/* Section 3: APBDes Chart */}
			<Grid gutter="lg">
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
				<Grid gutter="md">
					{Array.from({ length: 4 }).map((_, i) => (
						<Grid.Col key={i} span={{ base: 9, md: 3 }}>
							<Skeleton height={160} radius="xl" />
						</Grid.Col>
					))}
				</Grid>
			) : (
				<Grid gutter="md">
					{sdgsData.map((sdg) => (
						<Grid.Col key={sdg.title} span={{ base: 9, md: 3 }}>
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
