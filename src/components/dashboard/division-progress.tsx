import {
	Box,
	Card,
	Group,
	Progress,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

interface DivisionData {
	name: string;
	value: number;
}

const divisionData: DivisionData[] = [
	{ name: "Kesejahteraan", value: 37 },
	{ name: "Pemberdayaan", value: 26 },
	{ name: "Keuangan", value: 17 },
	{ name: "Sekretaris Desa", value: 15 },
];

const max_value = 37;

export function DivisionProgress() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: dark
					? "0 1px 3px 0 rgb(0 0 0 / 0.1)"
					: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Title order={4} c={dark ? "white" : "gray.9"} mb="lg">
				Divisi Teraktif
			</Title>
			<Stack gap="sm">
				{divisionData.map((divisi, index) => (
					<Box key={index}>
						<Group justify="space-between" mb={5}>
							<Text size="sm" fw={500} c={dark ? "white" : "gray.7"}>
								{divisi.name}
							</Text>
							<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
								{divisi.value} Kegiatan
							</Text>
						</Group>
						<Progress
							value={(divisi.value / max_value) * 100}
							size="sm"
							radius="xl"
							color="blue"
							animated
						/>
					</Box>
				))}
			</Stack>
		</Card>
	);
}
