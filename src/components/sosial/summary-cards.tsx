import {
	Card,
	Grid,
	GridCol,
	Group,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import {
	IconBabyCarriage,
	IconHeartbeat,
	IconMedicalCross,
	IconStethoscope,
} from "@tabler/icons-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

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
	const dark = useIsDark();

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
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "dark.3" : "dimmed"} fw={500}>
						{title}
					</Text>
					<Text
						size="xl"
						fw={700}
						c={highlight ? "red" : dark ? "white" : "darmasaba-navy.7"}
					>
						{value}
					</Text>
					{subtitle && (
						<Text size="xs" c={dark ? "white" : "gray.6"}>
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
	const t = useTranslate();

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
					title={t.sosial.ibuHamilAktif}
					value={displayData.ibuHamil}
					subtitle={t.sosial.aktif}
					icon={<IconHeartbeat size={20} />}
					color="white"
					backgroundColor="darmasaba-navy.7"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title={t.sosial.balitaTerdaftar}
					value={displayData.balita}
					subtitle={t.sosial.terdaftar}
					icon={<IconBabyCarriage size={20} />}
					color="white"
					backgroundColor="darmasaba-navy.7"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title={t.sosial.alertStunting}
					value={displayData.alertStunting}
					subtitle={t.sosial.perhatian}
					icon={<IconStethoscope size={20} />}
					color="white"
					backgroundColor="darmasaba-navy.7"
				/>
			</GridCol>
			<GridCol span={{ base: 12, sm: 6, lg: 3 }}>
				<SummaryCard
					title={t.sosial.posyanduAktif}
					value={displayData.posyanduAktif}
					subtitle={t.sosial.aktif}
					icon={<IconMedicalCross size={20} />}
					color="white"
					backgroundColor="darmasaba-navy.7"
				/>
			</GridCol>
		</Grid>
	);
};
