import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconPackageOff } from "@tabler/icons-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface TopProduct {
	rank: number;
	name: string;
	umkmName: string;
	revenue: number;
	quantitySold: number;
	trend: number;
}

interface TopProductsProps {
	products?: TopProduct[];
}

const formatCurrency = (value: number) => {
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `${(value / 1000).toFixed(0)}K`;
	}
	return value.toString();
};

const formatNumber = (value: number) => {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}K`;
	}
	return value.toString();
};

export const TopProducts = ({ products }: TopProductsProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	const displayProducts = products ?? [];

	const getRankColor = (rank: number) => {
		if (rank === 1) return "yellow";
		if (rank === 2) return "gray";
		if (rank === 3) return "orange";
		return "blue";
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
			<Title order={4} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				{t.bumdes.top3Produk}
			</Title>
			<Stack gap="sm">
				{displayProducts.length === 0 && (
					<Stack align="center" justify="center" gap="xs" py="xl">
						<IconPackageOff
							size={40}
							color={dark ? "#64748B" : "#94A3B8"}
							stroke={1.5}
						/>
						<Text size="sm" c={dark ? "dimmed" : "gray.6"} ta="center">
							{t.bumdes.tidakAdaProdukTerlaris}
						</Text>
					</Stack>
				)}
				{displayProducts.map((product) => (
					<Group key={product.rank} justify="space-between" align="center">
						<Group gap="sm">
							<Badge
								variant="filled"
								color={getRankColor(product.rank)}
								radius="xl"
								size="lg"
								w={30}
								h={30}
							>
								{product.rank}
							</Badge>
							<Stack gap={0}>
								<Text fw={600} c={dark ? "white" : "#1e3a5f"}>
									{product.name}
								</Text>
								<Text size="sm" c={dark ? "white" : "dimmed"}>
									{product.umkmName}
								</Text>
								<Group gap="xs" mt={2}>
									<Text size="xs" c={dark ? "white" : "gray.6"}>
										Rp {formatCurrency(product.revenue)}
									</Text>
									<Text size="xs" c={dark ? "white" : "gray.6"}>
										•
									</Text>
									<Text size="xs" c={dark ? "white" : "gray.6"}>
										{formatNumber(product.quantitySold)} {t.bumdes.terjual}
									</Text>
								</Group>
							</Stack>
						</Group>
						<Badge
							variant="light"
							color={product.trend >= 0 ? "green" : "red"}
							size="sm"
						>
							{product.trend >= 0 ? "+" : ""}
							{product.trend}%
						</Badge>
					</Group>
				))}
			</Stack>
		</Card>
	);
};
