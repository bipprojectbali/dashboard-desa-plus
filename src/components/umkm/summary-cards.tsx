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
	IconCurrencyDollar,
	IconTrendingUp,
	IconUsers,
} from "@tabler/icons-react";
import { useTranslate } from "@/hooks/useTranslate";

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
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
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
	const t = useTranslate();
	const displayData = data ?? {
		umkmAktif: 0,
		umkmTerdaftar: 0,
		omzet: 0,
		kategoriTerbanyak: { count: 0, name: "-" },
	};

	const kpiData: KpiCardProps[] = [
		{
			title: t.bumdes.umkmAktif,
			value: displayData.umkmAktif,
			subtitle: t.bumdes.beroperasi,
			icon: <IconCurrencyDollar size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: t.bumdes.umkmTerdaftar,
			value: displayData.umkmTerdaftar,
			subtitle: t.bumdes.totalRegistrasi,
			icon: <IconUsers size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: t.bumdes.omzet,
			value: displayData.omzet,
			subtitle: t.bumdes.omzetBumdes,
			icon: <IconTrendingUp size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
		{
			title: t.bumdes.umkmTerbanyak,
			value: displayData.kategoriTerbanyak.count,
			subtitle: `${t.bumdes.kategoriPrefix} ${displayData.kategoriTerbanyak.name}`,
			icon: <IconTrendingUp size={25} />,
			color: "white",
			backgroundColor: "#1E3A5F",
		},
	];

	return (
		<Grid gutter="md">
			{kpiData.map((kpi) => (
				<GridCol key={kpi.title} span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard {...kpi} />
				</GridCol>
			))}
		</Grid>
	);
};
