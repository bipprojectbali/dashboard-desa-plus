import { Card, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";

interface MetricCardProps {
	title: string;
	value: string | number;
	trend?: {
		value: number;
		label: string;
	};
}

const MetricCard = ({ title, value, trend }: MetricCardProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

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
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData = {
		totalPenjualan: 30900000,
		produkAktif: 7,
		totalTransaksi: 500,
		trend: {
			value: 18,
			label: "vs bulan lalu",
		},
	};

	const displayData = data || defaultData;

	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `Rp ${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `Rp ${(value / 1000).toFixed(0)}K`;
		}
		return `Rp ${value.toLocaleString()}`;
	};

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Stack gap="lg">
				<MetricCard
					title="Total Penjualan"
					value={formatCurrency(displayData.totalPenjualan)}
					trend={displayData.trend}
				/>
				<MetricCard
					title="Produk Aktif"
					value={`${displayData.produkAktif} kategori`}
				/>
				<MetricCard
					title="Total Transaksi"
					value={`${displayData.totalTransaksi} transaksi`}
				/>
			</Stack>
		</Card>
	);
};
