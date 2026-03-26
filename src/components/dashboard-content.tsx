import { Grid, Image, Stack } from "@mantine/core";
import { CheckCircle, FileText, MessageCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";
import { ActivityList } from "./dashboard/activity-list";
import { ChartAPBDes } from "./dashboard/chart-apbdes";
import { ChartSurat } from "./dashboard/chart-surat";
import { DivisionProgress } from "./dashboard/division-progress";
import { SatisfactionChart } from "./dashboard/satisfaction-chart";
import { SDGSCard } from "./dashboard/sdgs-card";
import { StatCard } from "./dashboard/stat-card";

const sdgsData = [
	{
		title: "Desa Berenergi Bersih dan Terbarukan",
		score: 99.64,
		image: "SDGS-7.png",
	},
	{
		title: "Desa Damai Berkeadilan",
		score: 78.65,
		image: "SDGS-16.png",
	},
	{
		title: "Desa Sehat dan Sejahtera",
		score: 77.37,
		image: "SDGS-3.png",
	},
	{
		title: "Desa Tanpa Kemiskinan",
		score: 52.62,
		image: "SDGS-1.png",
	},
];

export function DashboardContent() {
	const [stats, setStats] = useState({
		complaints: { total: 0, baru: 0, proses: 0, selesai: 0 },
		residents: { total: 0, heads: 0, poor: 0 },
		loading: true,
	});

	useEffect(() => {
		async function fetchStats() {
			try {
				const [complaintRes, residentRes] = await Promise.all([
					apiClient.GET("/api/complaint/stats"),
					apiClient.GET("/api/resident/stats"),
				]);

				setStats({
					complaints: (complaintRes.data as any)?.data || {
						total: 0,
						baru: 0,
						proses: 0,
						selesai: 0,
					},
					residents: (residentRes.data as any)?.data || {
						total: 0,
						heads: 0,
						poor: 0,
					},
					loading: false,
				});
			} catch (error) {
				console.error("Failed to fetch stats", error);
				setStats((prev) => ({ ...prev, loading: false }));
			}
		}

		fetchStats();
	}, []);

	return (
		<Stack gap="lg">
			{/* Header Metrics - 4 Stat Cards */}
			<Grid gutter="md">
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Surat Minggu Ini"
						value={0}
						detail="Menunggu integrasi riil"
						trend="0%"
						trendValue={0}
						icon={<FileText style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Pengaduan Aktif"
						value={stats.complaints.baru + stats.complaints.proses}
						detail={`${stats.complaints.baru} baru, ${stats.complaints.proses} diproses`}
						icon={<MessageCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Layanan Selesai"
						value={stats.complaints.selesai}
						detail="Total diselesaikan"
						trend="+0%"
						trendValue={0}
						icon={<CheckCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Total Penduduk"
						value={stats.residents.total.toLocaleString()}
						detail={`${stats.residents.heads} Kepala Keluarga`}
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
			<Grid gutter="md">
				{sdgsData.map((sdg) => (
					<Grid.Col key={sdg.title} span={{ base: 9, md: 3 }}>
						<SDGSCard
							image={<Image src={sdg.image} alt={sdg.title} />}
							title={sdg.title}
							score={sdg.score}
						/>
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
}
