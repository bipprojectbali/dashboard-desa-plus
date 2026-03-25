import {
	Badge,
	Card,
	Group,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

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
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultProducts: TopProduct[] = [
		{
			rank: 1,
			name: "Beras Premium Organik",
			umkmName: "Warung Pak Joko",
			revenue: 8500000,
			quantitySold: 650,
			trend: 12,
		},
		{
			rank: 2,
			name: "Keripik Singkong",
			umkmName: "Ibu Sari Snack",
			revenue: 4200000,
			quantitySold: 320,
			trend: 8,
		},
		{
			rank: 3,
			name: "Madu Alami",
			umkmName: "Peternakan Lebah",
			revenue: 3750000,
			quantitySold: 150,
			trend: 5,
		},
	];

	const displayProducts = products || defaultProducts;

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
			bg={dark ? "#141D34" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
		>
			<Title order={4} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				Top 3 Produk Terlaris
			</Title>
			<Stack gap="sm">
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
								<Text fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
									{product.name}
								</Text>
								<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
									{product.umkmName}
								</Text>
								<Group gap="xs" mt={2}>
									<Text size="xs" c={dark ? "dark.4" : "gray.6"}>
										Rp {formatCurrency(product.revenue)}
									</Text>
									<Text size="xs" c={dark ? "dark.4" : "gray.6"}>
										•
									</Text>
									<Text size="xs" c={dark ? "dark.4" : "gray.6"}>
										{formatNumber(product.quantitySold)} terjual
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
