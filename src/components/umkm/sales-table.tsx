import {
	Badge,
	Button,
	Card,
	Group,
	Select,
	Table,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

export interface SalesData {
	id: string;
	produk: string;
	penjualanBulanIni: number;
	bulanLalu: number;
	trend: number;
	volume: string;
	stok: number;
	unit: string;
}

interface SalesTableProps {
	data?: SalesData[];
	onDetailClick?: (product: SalesData) => void;
}

export const SalesTable = ({ data, onDetailClick }: SalesTableProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: SalesData[] = [
		{
			id: "1",
			produk: "Beras Premium Organik",
			penjualanBulanIni: 8500000,
			bulanLalu: 7600000,
			trend: 12,
			volume: "650 Kg",
			stok: 850,
			unit: "Kg",
		},
		{
			id: "2",
			produk: "Keripik Singkong",
			penjualanBulanIni: 4200000,
			bulanLalu: 3800000,
			trend: 11,
			volume: "320 Kg",
			stok: 120,
			unit: "Kg",
		},
		{
			id: "3",
			produk: "Madu Alami",
			penjualanBulanIni: 3750000,
			bulanLalu: 4100000,
			trend: -9,
			volume: "150 Liter",
			stok: 45,
			unit: "Liter",
		},
		{
			id: "4",
			produk: "Kecap Tradisional",
			penjualanBulanIni: 2800000,
			bulanLalu: 2500000,
			trend: 12,
			volume: "280 Botol",
			stok: 95,
			unit: "Botol",
		},
		{
			id: "5",
			produk: "Sambal Bu Rudy",
			penjualanBulanIni: 2100000,
			bulanLalu: 2300000,
			trend: -9,
			volume: "180 Botol",
			stok: 35,
			unit: "Botol",
		},
	];

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

	const getStockStatus = (stock: number) => {
		if (stock > 200) return { color: "green", label: "Aman" };
		if (stock > 50) return { color: "yellow", label: "Sedang" };
		return { color: "red", label: "Rendah" };
	};

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#1E293B" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
		>
			<Group justify="space-between" mb="md">
				<Title order={4} c={dark ? "dark.0" : "#1e3a5f"}>
					Detail Penjualan Produk
				</Title>
				<Group gap="xs">
					<Select
						placeholder="Filter kategori"
						data={[
							{ value: "semua", label: "Semua Kategori" },
							{ value: "makanan", label: "Makanan" },
							{ value: "minuman", label: "Minuman" },
							{ value: "kerajinan", label: "Kerajinan" },
						]}
						defaultValue="semua"
						w={180}
						size="sm"
					/>
					<Select
						placeholder="Filter UMKM"
						data={[
							{ value: "semua", label: "Semua UMKM" },
							{ value: "umkm1", label: "Warung Pak Joko" },
							{ value: "umkm2", label: "Ibu Sari Snack" },
						]}
						defaultValue="semua"
						w={180}
						size="sm"
					/>
				</Group>
			</Group>

			<Table
				stickyHeader
				stickyHeaderOffset={60}
				highlightOnHover
				withRowBorders={false}
				verticalSpacing="sm"
			>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Produk
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Penjualan Bulan Ini
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Bulan Lalu
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Trend
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Volume
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Stok
							</Text>
						</Table.Th>
						<Table.Th style={{ backgroundColor: dark ? "#1e3a5f" : "#f8f9fa" }}>
							<Text size="sm" fw={600} c={dark ? "white" : "dimmed"}>
								Aksi
							</Text>
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{displayData.map((product) => {
						const stockStatus = getStockStatus(product.stok);
						return (
							<Table.Tr
								key={product.id}
								style={{
									backgroundColor: dark ? "#141D34" : "white",
								}}
							>
								<Table.Td>
									<Text fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
										{product.produk}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size="sm" fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
										{formatCurrency(product.penjualanBulanIni)}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size="sm" c={dark ? "white" : "dimmed"}>
										{formatCurrency(product.bulanLalu)}
									</Text>
								</Table.Td>
								<Table.Td>
									<Group gap="xs">
										{product.trend >= 0 ? (
											<IconArrowUp size={16} color="green" />
										) : (
											<IconArrowDown size={16} color="red" />
										)}
										<Text
											size="sm"
											fw={600}
											c={product.trend >= 0 ? "green" : "red"}
										>
											{Math.abs(product.trend)}%
										</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Text size="sm" c={dark ? "dark.0" : "#1e3a5f"}>
										{product.volume}
									</Text>
								</Table.Td>
								<Table.Td>
									<Badge variant="light" color={stockStatus.color} size="sm">
										{product.stok} {product.unit} ({stockStatus.label})
									</Badge>
								</Table.Td>
								<Table.Td>
									<Button
										variant="subtle"
										size="compact-sm"
										color="darmasaba-blue"
										radius="xl"
										onClick={() => onDetailClick?.(product)}
									>
										Detail
									</Button>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</Card>
	);
};
