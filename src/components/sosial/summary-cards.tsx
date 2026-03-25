import {
	Card,
	Grid,
	GridCol,
	Group,
	Stack,
	Text,
	ThemeIcon,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconBabyCarriage,
	IconHeartbeat,
	IconMedicalCross,
	IconStethoscope,
} from "@tabler/icons-react";

interface SummaryCardProps {
	title: string;
	value: number;
	subtitle?: string;
	icon: React.ReactNode;
	color: string;
	highlight?: boolean;
	backgroundColor: string;
}

const SummaryCard = ({
	title,
	value,
	subtitle,
	icon,
	color,
	highlight = false,
	backgroundColor,
}: SummaryCardProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#141D34" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
		>
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "dark.3" : "dimmed"} fw={500}>
						{title}
					</Text>
					<Text
						size="xl"
						fw={700}
						c={highlight ? "red" : dark ? "dark.0" : "#1e3a5f"}
					>
						{value}
					</Text>
					{subtitle && (
						<Text size="xs" c={dark ? "dark.4" : "gray.6"}>
							{subtitle}
						</Text>
					)}
				</Stack>
				<ThemeIcon bg={backgroundColor} color={color} size="xl" radius="xl">
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
};

interface HealthSummaryData {
	ibuHamil: number;
	balita: number;
	alertStunting: number;
	posyanduAktif: number;
}

interface SummaryCardsProps {
	data?: HealthSummaryData;
}

export const SummaryCards = ({ data }: SummaryCardsProps) => {
	const defaultData: HealthSummaryData = {
		ibuHamil: 87,
		balita: 342,
		alertStunting: 12,
		posyanduAktif: 8,
	};

	const displayData = data || defaultData;

	return (
		<Grid gutter="md">
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title="Ibu Hamil Aktif"
					value={displayData.ibuHamil}
					subtitle="Aktif"
					icon={<IconHeartbeat size={20} />}
					color="white"
					backgroundColor="#1E3A5F"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title="Balita Terdaftar"
					value={displayData.balita}
					subtitle="Terdaftar"
					icon={<IconBabyCarriage size={20} />}
					color="white"
					backgroundColor="#1E3A5F"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title="Alert Stunting"
					value={displayData.alertStunting}
					subtitle="Perhatian"
					icon={<IconStethoscope size={20} />}
					color="white"
					backgroundColor="#1E3A5F"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title="Posyandu Aktif"
					value={displayData.posyanduAktif}
					subtitle="Aktif"
					icon={<IconMedicalCross size={20} />}
					color="white"
					backgroundColor="#1E3A5F"
				/>
			</GridCol>
		</Grid>
	);
};
