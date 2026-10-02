import {
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Baby, BarChart3, TrendingDown, Users } from "lucide-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";

interface DemografiDynamicsCardProps {
	births: number;
	deaths: number;
	moveIn: number;
	moveOut: number;
	loading: boolean;
}

export const DemografiDynamicsCard = ({
	births,
	deaths,
	moveIn,
	moveOut,
	loading,
}: DemografiDynamicsCardProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	// Dynamic Stats Data
	const dynamicStats = [
		{
			title: t.demografiPekerjaan.kelahiran,
			value: births.toString(),
			icon: Baby,
			color: CHART.green,
		},
		{
			title: t.demografiPekerjaan.kematian,
			value: deaths.toString(),
			icon: TrendingDown,
			color: CHART.red,
		},
		{
			title: t.demografiPekerjaan.pindahMasuk,
			value: moveIn.toString(),
			icon: Users,
			color: CHART.blue,
		},
		{
			title: t.demografiPekerjaan.pindahKeluar,
			value: moveOut.toString(),
			icon: Users,
			color: CHART.orange,
		},
	];

	return (
		<Card
			data-ai-target="demografi.dinamika"
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<BarChart3 size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.demografiPekerjaan.dinamikaPenduduk}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={160} radius="md" />
			) : (
				<Grid gutter="sm">
					{dynamicStats.map((stat) => (
						<Grid.Col key={stat.title} span={6}>
							<Card
								p="sm"
								radius="lg"
								bg={dark ? "#334155" : "#F1F5F9"}
								style={{
									transition: "transform 0.15s ease",
									cursor: "pointer",
								}}
							>
								<Stack gap={2} align="center">
									<ThemeIcon
										color={stat.color}
										variant="filled"
										size="md"
										radius="lg"
									>
										<stat.icon size={14} />
									</ThemeIcon>
									<Text size="xs" c="dimmed" ta="center">
										{stat.title}
									</Text>
									<Text
										size="lg"
										fw={700}
										c={stat.color}
										style={{ lineHeight: 1 }}
									>
										{stat.value}
									</Text>
								</Stack>
							</Card>
						</Grid.Col>
					))}
				</Grid>
			)}
		</Card>
	);
};
