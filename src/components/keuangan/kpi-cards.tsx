import {
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { CheckCircle, Coins, TrendingDown, TrendingUp } from "lucide-react";
import type { KeuanganYear } from "@/api/transforms/keuangan-apbdes";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { formatM } from "./format";

interface KpiCardsProps {
	year: KeuanganYear | null;
	loading: boolean;
}

export function KpiCards({ year, loading }: KpiCardsProps) {
	const t = useTranslate();
	const dark = useIsDark();

	if (loading) {
		return (
			<>
				{Array.from({ length: 4 }).map((_, i) => (
					<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
						<Skeleton height={100} radius="xl" />
					</Grid.Col>
				))}
			</>
		);
	}

	if (!year) {
		return (
			<Grid.Col span={12}>
				<Card
					p="md"
					radius="xl"
					withBorder
					ta="center"
					c="dimmed"
					bg={dark ? "#1F293A" : undefined}
				>
					Belum ada data APBDes.
				</Card>
			</Grid.Col>
		);
	}

	const kpis = [
		{
			id: 1,
			title: t.keuanganAnggaran.totalApbdes,
			value: `Rp ${formatM(year.totalBudget)}`,
			subtitle: `${t.keuanganAnggaran.tahun} ${year.tahun}`,
			icon: Coins,
			trend: undefined,
		},
		{
			id: 2,
			title: t.keuanganAnggaran.realisasi,
			value: `${year.realisasiPercent}%`,
			subtitle: `Rp ${formatM(year.totalExpenseReal)} ${t.keuanganAnggaran.dari} ${formatM(year.totalBudget)}`,
			icon: CheckCircle,
			trend: undefined,
		},
		{
			id: 3,
			title: t.keuanganAnggaran.pemasukan,
			value: `Rp ${formatM(year.totalIncomeReal)}`,
			subtitle: t.keuanganAnggaran.totalRealisasi,
			icon: TrendingUp,
			trend: "+0%",
		},
		{
			id: 4,
			title: t.keuanganAnggaran.pengeluaran,
			value: `Rp ${formatM(year.totalExpenseReal)}`,
			subtitle: t.keuanganAnggaran.totalRealisasi,
			icon: TrendingDown,
			trend: undefined,
		},
	];

	return (
		<>
			{kpis.map((item) => (
				<Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 3 }}>
					<Card
						p="md"
						radius="xl"
						withBorder
						bg={dark ? "#1E293B" : "white"}
						style={{
							borderColor: dark ? "#374b6aff" : "var(--mantine-color-white)",
							boxShadow: "var(--mantine-shadow-xs)",
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
									{item.trend && (
										<TrendingUp
											size={14}
											color="var(--mantine-color-green-5)"
										/>
									)}
									<Text
										size="xs"
										c={item.trend ? "green" : dark ? "gray.4" : "gray.5"}
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
		</>
	);
}
