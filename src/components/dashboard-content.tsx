import { Grid, Image, Stack, useMantineColorScheme } from "@mantine/core";
import { CheckCircle, FileText, MessageCircle, Users } from "lucide-react";
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
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Stack gap="lg">
			{/* Header Metrics - 4 Stat Cards */}
			<Grid gutter="md">
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Surat Minggu Ini"
						value={99}
						detail="14 baru, 14 diproses"
						trend="12% dari minggu lalu ↗ +12%"
						trendValue={12}
						icon={<FileText style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Pengaduan Aktif"
						value={28}
						detail="14 baru, 14 diproses"
						icon={<MessageCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Layanan Selesai"
						value={156}
						detail="bulan ini"
						trend="+8%"
						trendValue={8}
						icon={<CheckCircle style={{ width: "70%", height: "70%" }} />}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<StatCard
						title="Kepuasan Warga"
						value="87.2%"
						detail="dari 482 responden"
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
				{sdgsData.map((sdg, index) => (
					<Grid.Col key={index} span={{ base: 9, md: 3 }}>
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
