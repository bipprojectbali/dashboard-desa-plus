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

interface SelectOption {
	value: string;
	label: string;
}

interface SalesTableProps {
	data?: SalesData[];
	onDetailClick?: (product: SalesData) => void;
	kategoriOptions?: SelectOption[];
	umkmOptions?: SelectOption[];
	onKategoriChange?: (id: string | null) => void;
	onUmkmChange?: (id: string | null) => void;
}

export const SalesTable = ({
	data,
	onDetailClick,
	kategoriOptions,
	umkmOptions,
	onKategoriChange,
	onUmkmChange,
}: SalesTableProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const displayData = data ?? [];

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
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Group justify="space-between" mb="md">
				<Title order={4} c={dark ? "dark.0" : "#1e3a5f"}>
					Detail Penjualan Produk
				</Title>
				<Group gap="xs">
					<Select
						placeholder="Semua Kategori"
						data={[
							{ value: "", label: "Semua Kategori" },
							...(kategoriOptions ?? []),
						]}
						defaultValue=""
						w={180}
						size="sm"
						onChange={(val) => onKategoriChange?.(val || null)}
					/>
					<Select
						placeholder="Semua UMKM"
						data={[{ value: "", label: "Semua UMKM" }, ...(umkmOptions ?? [])]}
						defaultValue=""
						w={180}
						size="sm"
						onChange={(val) => onUmkmChange?.(val || null)}
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
