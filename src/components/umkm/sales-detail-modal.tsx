import {
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Modal,
	Paper,
	Progress,
	RingProgress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconArrowDown,
	IconArrowUp,
	IconBox,
	IconChartBar,
	IconCoin,
	IconMinus,
	IconPackage,
	IconTrendingDown,
	IconTrendingUp,
} from "@tabler/icons-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import type { SalesData } from "./sales-table";

interface SalesDetailModalProps {
	product: SalesData | null;
	opened: boolean;
	onClose: () => void;
}

export const SalesDetailModal = ({
	product,
	opened,
	onClose,
}: SalesDetailModalProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	if (!product) return null;

	const formatCurrency = (value: number) => {
		if (value >= 1_000_000_000) {
			return `Rp ${(value / 1_000_000_000).toFixed(2)}B`;
		}
		if (value >= 1_000_000) {
			return `Rp ${(value / 1_000_000).toFixed(2)}M`;
		}
		if (value >= 1_000) {
			return `Rp ${(value / 1_000).toFixed(0)}K`;
		}
		return `Rp ${value.toLocaleString()}`;
	};

	const isUp = product.trend > 0;
	const isFlat = product.trend === 0;

	const getStockStatus = (stock: number) => {
		if (stock > 200)
			return { color: "green", label: t.bumdes.stokAman, pct: 100 };
		if (stock > 50)
			return { color: "yellow", label: t.bumdes.stokSedang, pct: 60 };
		return { color: "red", label: t.bumdes.stokRendah, pct: 20 };
	};
	const stockStatus = getStockStatus(product.stok);

	const max = Math.max(product.penjualanBulanIni, product.bulanLalu, 1);
	const pctBulanIni = Math.round((product.penjualanBulanIni / max) * 100);
	const pctBulanLalu = Math.round((product.bulanLalu / max) * 100);

	const cardBg = "var(--app-bg)";
	const sectionBg = "var(--app-card)";
	const borderColor = "var(--app-border)";
	const labelColor = dark ? "dark.2" : "dimmed";

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<ThemeIcon
						radius="xl"
						size="md"
						variant="gradient"
						gradient={{ from: "#1e3a5f", to: "#2563eb", deg: 135 }}
					>
						<IconPackage size={14} />
					</ThemeIcon>
					<Text fw={700} size="md" c={dark ? "white" : "#1e3a5f"}>
						{t.bumdes.detailProduk}
					</Text>
				</Group>
			}
			size="lg"
			radius="xl"
			padding="xl"
			centered
			styles={{
				header: {
					backgroundColor: sectionBg,
					borderBottom: `1px solid ${borderColor}`,
				},
				body: {
					backgroundColor: cardBg,
					padding: 0,
					overflowY: "auto",
					maxHeight: "75vh",
				},
				content: { backgroundColor: cardBg, overflow: "hidden" },
			}}
		>
			<Stack gap={0}>
				{/* Product name banner */}
				<Box
					p="xl"
					style={{
						background: dark
							? "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)"
							: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
					}}
				>
					<Group justify="space-between" align="flex-start">
						<Stack gap={4}>
							<Text
								size="xs"
								c="blue.2"
								fw={500}
								tt="uppercase"
								style={{ letterSpacing: "0.05em" }}
							>
								{t.bumdes.produk}
							</Text>
							<Title order={3} c="white" style={{ lineHeight: 1.2 }}>
								{product.produk}
							</Title>
						</Stack>
						<Badge
							size="lg"
							radius="xl"
							variant="filled"
							color={isFlat ? "gray" : isUp ? "green" : "red"}
							leftSection={
								isFlat ? (
									<IconMinus size={12} />
								) : isUp ? (
									<IconArrowUp size={12} />
								) : (
									<IconArrowDown size={12} />
								)
							}
						>
							{Math.abs(product.trend)}%
						</Badge>
					</Group>
				</Box>

				<Stack gap="lg" p="xl">
					{/* Sales stats row */}
					<SimpleGrid cols={3} spacing="md">
						<StatCard
							icon={<IconCoin size={18} />}
							label={t.bumdes.penjualanBulanIni}
							value={formatCurrency(product.penjualanBulanIni)}
							highlight
							dark={dark}
						/>
						<StatCard
							icon={<IconChartBar size={18} />}
							label={t.bumdes.bulanLalu}
							value={formatCurrency(product.bulanLalu)}
							dark={dark}
						/>
						<StatCard
							icon={
								isUp ? (
									<IconTrendingUp size={18} />
								) : isFlat ? (
									<IconMinus size={18} />
								) : (
									<IconTrendingDown size={18} />
								)
							}
							label={t.bumdes.perubahan}
							value={`${isUp ? "+" : ""}${product.trend}%`}
							valueColor={isFlat ? "dimmed" : isUp ? "green" : "red"}
							dark={dark}
						/>
					</SimpleGrid>

					<Divider color={borderColor} />

					{/* Bar comparison */}
					<Paper
						radius="lg"
						p="md"
						bg={sectionBg}
						withBorder
						style={{ borderColor }}
					>
						<Text size="sm" fw={600} c={dark ? "white" : "#1e3a5f"} mb="md">
							{t.bumdes.perbandinganPenjualan}
						</Text>
						<Stack gap="sm">
							<ComparisonBar
								label={t.bumdes.penjualanBulanIni}
								value={formatCurrency(product.penjualanBulanIni)}
								pct={pctBulanIni}
								color="#2563eb"
								labelColor={labelColor}
							/>
							<ComparisonBar
								label={t.bumdes.bulanLalu}
								value={formatCurrency(product.bulanLalu)}
								pct={pctBulanLalu}
								color="#64748b"
								labelColor={labelColor}
							/>
						</Stack>
					</Paper>

					{/* Volume + Stock row */}
					<SimpleGrid cols={2} spacing="md">
						{/* Volume card */}
						<Paper
							radius="lg"
							p="md"
							bg={sectionBg}
							withBorder
							style={{ borderColor }}
						>
							<Group gap="xs" mb="xs">
								<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
									<IconBox size={12} />
								</ThemeIcon>
								<Text size="xs" c={labelColor} fw={500}>
									{t.bumdes.infoVolume}
								</Text>
							</Group>
							<Text fw={700} size="xl" c={dark ? "white" : "#1e3a5f"}>
								{product.volume}
								{product.unit ? ` ${product.unit}` : ""}
							</Text>
						</Paper>

						{/* Stock card */}
						<Paper
							radius="lg"
							p="md"
							bg={sectionBg}
							withBorder
							style={{ borderColor }}
						>
							<Group gap="xs" mb="xs">
								<ThemeIcon
									size="sm"
									radius="xl"
									variant="light"
									color={stockStatus.color}
								>
									<IconPackage size={12} />
								</ThemeIcon>
								<Text size="xs" c={labelColor} fw={500}>
									{t.bumdes.statusStok}
								</Text>
							</Group>
							<Group justify="space-between" align="center">
								<Stack gap={2}>
									<Text fw={700} size="xl" c={dark ? "white" : "#1e3a5f"}>
										{product.stok}
										{product.unit ? ` ${product.unit}` : ""}
									</Text>
									<Badge
										variant="light"
										color={stockStatus.color}
										size="sm"
										radius="xl"
									>
										{stockStatus.label}
									</Badge>
								</Stack>
								<RingProgress
									size={56}
									thickness={5}
									roundCaps
									sections={[
										{ value: stockStatus.pct, color: stockStatus.color },
									]}
								/>
							</Group>
						</Paper>
					</SimpleGrid>
				</Stack>

				{/* Footer */}
				<Box
					px="xl"
					pb="xl"
					style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}
				>
					<Button
						fullWidth
						radius="xl"
						variant="light"
						color="darmasaba-blue"
						onClick={onClose}
					>
						{t.bumdes.tutupDetail}
					</Button>
				</Box>
			</Stack>
		</Modal>
	);
};

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	highlight?: boolean;
	dark: boolean;
	valueColor?: string;
}

const StatCard = ({
	icon,
	label,
	value,
	highlight,
	dark,
	valueColor,
}: StatCardProps) => {
	const bg = highlight ? (dark ? "#1e3a5f" : "#EFF6FF") : "var(--app-card)";
	const borderColor = highlight
		? dark
			? "var(--app-primary)"
			: "#BFDBFE"
		: "var(--app-border)";

	return (
		<Paper radius="lg" p="md" bg={bg} withBorder style={{ borderColor }}>
			<ThemeIcon
				size="sm"
				radius="xl"
				variant="light"
				color={highlight ? "blue" : "gray"}
				mb="xs"
			>
				{icon}
			</ThemeIcon>
			<Text size="xs" c={dark ? "dark.2" : "dimmed"} fw={500} mb={2}>
				{label}
			</Text>
			<Text
				fw={700}
				size="md"
				c={valueColor ?? (dark ? "white" : "#1e3a5f")}
				style={{ lineHeight: 1.2 }}
			>
				{value}
			</Text>
		</Paper>
	);
};

interface ComparisonBarProps {
	label: string;
	value: string;
	pct: number;
	color: string;
	labelColor: string;
}

const ComparisonBar = ({
	label,
	value,
	pct,
	color,
	labelColor,
}: ComparisonBarProps) => (
	<Stack gap={4}>
		<Group justify="space-between">
			<Text size="xs" c={labelColor} fw={500}>
				{label}
			</Text>
			<Text size="xs" fw={600} c={color}>
				{value}
			</Text>
		</Group>
		<Progress value={pct} color={color} radius="xl" size="md" />
	</Stack>
);
