import { Card, Group, Stack, Text } from "@mantine/core";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";

interface MetricCardProps {
	title: string;
	value: string | number;
	trend?: {
		value: number;
		label: string;
	};
}

const MetricCard = ({ title, value, trend }: MetricCardProps) => {
	const dark = useIsDark();

	return (
		<Group justify="space-between" align="center">
			<Text size="sm" c={dark ? "white" : "dimmed"} fw={500}>
				{title}
			</Text>
			<Stack gap={0} align="flex-end">
				<Text size="lg" fw={700} c={dark ? "white" : "#1e3a5f"}>
					{value}
				</Text>
				{trend && (
					<Text size="xs" c={trend.value >= 0 ? "green" : "red"} fw={600}>
						{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
						{trend.label}
					</Text>
				)}
			</Stack>
		</Group>
	);
};

interface ProdukUnggulanProps {
	data?: {
		totalPenjualan: number;
		produkAktif: number;
		totalTransaksi: number;
		trend?: {
			value: number;
			label: string;
		};
	};
}

export const ProdukUnggulan = ({ data }: ProdukUnggulanProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	const displayData = data ?? {
		totalPenjualan: 0,
		produkAktif: 0,
		totalTransaksi: 0,
		trend: undefined,
	};

	const { lang } = useSnapshot(i18nStore);
	const isId = lang === "id";

	const formatCurrency = (value: number) => {
		if (value >= 1_000_000_000_000)
			return `Rp ${(value / 1_000_000_000_000).toFixed(1)}T`;
		if (value >= 1_000_000_000)
			return isId
				? `Rp ${(value / 1_000_000_000).toFixed(1)}M`
				: `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
		if (value >= 1_000_000)
			return isId
				? `Rp ${(value / 1_000_000).toFixed(1)}Jt`
				: `Rp ${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000)
			return isId
				? `Rp ${(value / 1_000).toFixed(1)}rb`
				: `Rp ${(value / 1_000).toFixed(1)}K`;
		return `Rp ${value.toLocaleString()}`;
	};

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Stack gap="lg">
				<MetricCard
					title={t.bumdes.totalPenjualan}
					value={formatCurrency(displayData.totalPenjualan)}
					trend={displayData.trend}
				/>
				<MetricCard
					title={t.bumdes.produkAktif}
					value={`${displayData.produkAktif} ${t.bumdes.kategoriSuffix}`}
				/>
				<MetricCard
					title={t.bumdes.totalTransaksi}
					value={`${displayData.totalTransaksi} ${t.bumdes.transaksiSuffix}`}
				/>
			</Stack>
		</Card>
	);
};
