import {
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { Baby, Home, TrendingDown, Users } from "lucide-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";
import type { DashboardSummary } from "./demografi.types";

interface DemografiSummaryCardsProps {
	stats: DashboardSummary;
	births: number;
	loading: boolean;
}

export const DemografiSummaryCards = ({
	stats,
	births,
	loading,
}: DemografiSummaryCardsProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: t.demografiPekerjaan.totalPenduduk,
			value: stats.total.toLocaleString(),
			subtitle: t.demografiPekerjaan.aktifTerdaftar,
			icon: Users,
		},
		{
			id: 2,
			title: t.demografiPekerjaan.kepalaKeluarga,
			value: stats.heads.toLocaleString(),
			subtitle: t.demografiPekerjaan.totalKk,
			icon: Home,
		},
		{
			id: 3,
			title: t.demografiPekerjaan.kelahiran,
			value: births.toString(),
			subtitle: t.demografiPekerjaan.tahunIni,
			icon: Baby,
		},
		{
			id: 4,
			title: t.demografiPekerjaan.kemiskinan,
			value: stats.poor.toLocaleString(),
			subtitle: t.demografiPekerjaan.keluargaPrasejahtera,
			trend: "positive" as const,
			icon: TrendingDown,
		},
	];

	return (
		<Grid gutter="md">
			{loading
				? Array.from({ length: 4 }).map((_, i) => (
						// Skeleton placeholder statis (bukan data asli) — index sebagai key aman di sini.
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count, no reorder
						<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
							<Skeleton height={100} radius="xl" />
						</Grid.Col>
					))
				: kpiData.map((item) => (
						<Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 3 }}>
							<Card
								p="md"
								radius="xl"
								withBorder
								bg={dark ? "#1E293B" : "white"}
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								h="100%"
							>
								<Group justify="space-between" align="flex-start" w="100%">
									<Stack gap={2}>
										<Text size="sm" c="dimmed">
											{item.title}
										</Text>
										<Text size="xl" fw={700} c={dark ? "white" : "gray.9"}>
											{item.value}
										</Text>
										<Group gap={4} align="flex-start">
											{item.trend === "positive" && (
												<TrendingDown size={14} color={CHART.green} />
											)}
											<Text
												size="xs"
												c={
													item.trend === "positive"
														? "green"
														: dark
															? "gray.4"
															: "gray.5"
												}
											>
												{item.subtitle}
											</Text>
										</Group>
									</Stack>
									<ThemeIcon
										color="darmasaba-navy.7"
										variant="filled"
										size="lg"
										radius="xl"
									>
										<item.icon style={{ width: "60%", height: "60%" }} />
									</ThemeIcon>
								</Group>
							</Card>
						</Grid.Col>
					))}
		</Grid>
	);
};
