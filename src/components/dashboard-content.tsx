import { Grid, Stack, useMantineColorScheme } from "@mantine/core";
import { CheckCircle, FileText, MessageCircle, Users } from "lucide-react";
import { ActivityList } from "./dashboard/activity-list";
import { ChartAPBDes } from "./dashboard/chart-apbdes";
import { ChartSurat } from "./dashboard/chart-surat";
import { DivisionProgress } from "./dashboard/division-progress";
import { SatisfactionChart } from "./dashboard/satisfaction-chart";
import { SDGSCard } from "./dashboard/sdgs-card";
import { StatCard } from "./dashboard/stat-card";

// SDGs Icons
function EnergyIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M24 4L14 24H22L20 44L34 20H26L24 4Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function PeaceIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
			<path
				d="M24 4V44M24 24L10 38M24 24L38 38"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function HealthIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M24 44C24 44 6 28 6 18C6 11.373 11.373 6 18 6C21.5 6 24.5 7.5 24 12C23.5 7.5 26.5 6 30 6C36.627 6 42 11.373 42 18C42 28 24 44 24 44Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function PovertyIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="6" y="18" width="36" height="26" rx="2" fill="currentColor" />
			<path
				d="M14 18V12C14 8.686 16.686 6 20 6H28C31.314 6 34 8.686 34 12V18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function OceanIcon() {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6 30C6 30 10 26 14 30C18 34 22 30 26 30C30 30 34 34 38 30C42 26 46 30 46 30"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path
				d="M6 38C6 38 10 34 14 38C18 42 22 38 26 38C30 38 34 42 38 38C42 34 46 38 46 38"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<circle cx="24" cy="16" r="6" fill="currentColor" />
		</svg>
	);
}

const sdgsData = [
	{
		title: "Desa Berenergi Bersih dan Terbarukan",
		score: 99.64,
		icon: <EnergyIcon />,
		color: "#FACC15",
		bgColor: "#FEF9C3",
	},
	{
		title: "Desa Damai Berkeadilan",
		score: 78.65,
		icon: <PeaceIcon />,
		color: "#3B82F6",
		bgColor: "#DBEAFE",
	},
	{
		title: "Desa Sehat dan Sejahtera",
		score: 77.37,
		icon: <HealthIcon />,
		color: "#22C55E",
		bgColor: "#DCFCE7",
	},
	{
		title: "Desa Tanpa Kemiskinan",
		score: 52.62,
		icon: <PovertyIcon />,
		color: "#EF4444",
		bgColor: "#FEE2E2",
	},
	{
		title: "Desa Peduli Lingkungan Laut",
		score: 50.0,
		icon: <OceanIcon />,
		color: "#06B6D4",
		bgColor: "#CFFAFE",
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
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<ChartSurat />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DivisionProgress />
				</Grid.Col>
			</Grid>

			{/* Section 3: APBDes Chart */}
			<ChartAPBDes />

			{/* Section 4 & 5: Activity List & Satisfaction Chart */}
			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<ActivityList />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<SatisfactionChart />
				</Grid.Col>
			</Grid>

			{/* Section 6: SDGs Desa Cards */}
			<Grid gutter="md">
				{sdgsData.map((sdg, index) => (
					<Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
						<SDGSCard
							title={sdg.title}
							score={sdg.score}
							icon={sdg.icon}
							color={sdg.color}
							bgColor={sdg.bgColor}
						/>
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
}
