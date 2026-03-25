import {
	Card,
	Group,
	Progress,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

interface HealthProgressItem {
	label: string;
	value: number;
	color: string;
}

interface HealthStatsProps {
	data?: HealthProgressItem[];
}

export const HealthStats = ({ data }: HealthStatsProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: HealthProgressItem[] = [
		{ label: "Imunisasi Lengkap", value: 92, color: "green" },
		{ label: "Pemeriksaan Rutin", value: 88, color: "blue" },
		{ label: "Gizi Baik", value: 86, color: "teal" },
		{ label: "Target Stunting", value: 14, color: "red" },
	];

	const displayData = data || defaultData;

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#141D34" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
			h={"100%"}
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				Statistik Kesehatan
			</Title>
			<Stack gap="md">
				{displayData.map((item, index) => (
					<div key={index}>
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
