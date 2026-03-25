import {
	Avatar,
	Card,
	Grid,
	GridCol,
	Group,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconCategory,
	IconCurrencyDollar,
	IconTrendingUp,
	IconUsers,
} from "@tabler/icons-react";

interface KpiCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: React.ReactNode;
	color: string;
	backgroundColor: string;
}

const KpiCard = ({
	title,
	value,
	subtitle,
	icon,
	color,
	backgroundColor,
}: KpiCardProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const formatValue = (val: string | number) => {
		if (typeof val === "number") {
			if (val >= 1000000) {
				return `${(val / 1000000).toFixed(1)}M`;
			}
			if (val >= 1000) {
				return `${(val / 1000).toFixed(1)}K`;
			}
			return val.toLocaleString();
		}
		return val;
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
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "dark.3" : "dimmed"} fw={500}>
						{title}
					</Text>
					<Text size="xl" fw={700} c={dark ? "white" : "#1e3a5f"}>
						{formatValue(value)}
					</Text>
					{subtitle && (
						<Text size="xs" c={dark ? "white" : "gray.6"}>
							{subtitle}
						</Text>
					)}
				</Stack>
				<Avatar
					color={color}
					bg={backgroundColor}
					size={40}
					radius="xl"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{icon}
				</Avatar>
			</Group>
		</Card>
	);
};

interface SummaryCardsProps {
	data?: {
		umkmAktif: number;
		umkmTerdaftar: number;
		omzet: number;
		kategoriTerbanyak: { count: number; name: string };
	};
}

export const SummaryCards = ({ data }: SummaryCardsProps) => {
	const defaultData = {
		umkmAktif: 45,
		umkmTerdaftar: 68,
		omzet: 48000000,
		kategoriTerbanyak: { count: 34, name: "Kuliner" },
	};

	const displayData = data || defaultData;

	const kpiData: KpiCardProps[] = [
		{
			title: "UMKM Aktif",
			value: displayData.umkmAktif,
			subtitle: "Beroperasi",
			icon: <IconCurrencyDollar size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: "UMKM Terdaftar",
			value: displayData.umkmTerdaftar,
			subtitle: "Total registrasi",
			icon: <IconUsers size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: "Omzet",
			value: displayData.omzet,
			subtitle: "Omzet BUMDes per bulan",
			icon: <IconTrendingUp size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: "UMKM Terbanyak",
			value: displayData.kategoriTerbanyak.count,
			subtitle: `Kategori ${displayData.kategoriTerbanyak.name}`,
			icon: <IconTrendingUp size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
	];

	return (
		<Grid gutter="md">
			{kpiData.map((kpi, index) => (
				<GridCol key={index} span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard {...kpi} />
				</GridCol>
			))}
		</Grid>
	);
};
