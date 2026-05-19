import {
	Card,
	Group,
	Progress,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useTranslate } from "@/hooks/useTranslate";

interface HealthProgressItem {
	label: string;
	value: number;
	color: string;
}

interface HealthStatsProps {
	data?: HealthProgressItem[];
}

export const HealthStats = ({ data }: HealthStatsProps) => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: HealthProgressItem[] = [
		{ label: t.sosial.imunisasiLengkap, value: 92, color: "green" },
		{ label: t.sosial.pemeriksaanRutin, value: 88, color: "blue" },
		{ label: t.sosial.giziBaik, value: 86, color: "teal" },
		{ label: t.sosial.targetStunting, value: 14, color: "red" },
	];

	const displayData = data || defaultData;

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
			h={"100%"}
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				{t.sosial.statistikKesehatan}
			</Title>
			<Stack gap="md">
				{displayData.map((item) => (
					<div key={item.label}>
						<Group justify="space-between" mb={5}>
							<Text size="sm" fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
								{item.label}
							</Text>
							<Text
								size="sm"
								fw={600}
								c={item.color === "red" ? "red" : dark ? "dark.0" : "#1e3a5f"}
							>
								{item.value}%
							</Text>
						</Group>
						<Progress
							value={item.value}
							size="lg"
							radius="xl"
							color={item.color}
						/>
					</div>
				))}
			</Stack>
		</Card>
	);
};
