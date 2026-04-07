import {
	Badge,
	Card,
	Group,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

interface PosyanduItem {
	id: string;
	nama: string;
	tanggal: string;
	jam: string;
}

interface PosyanduScheduleProps {
	data?: PosyanduItem[];
}

export const PosyanduSchedule = ({ data }: PosyanduScheduleProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: PosyanduItem[] = [
		{
			id: "1",
			nama: "Posyandu Mawar",
			tanggal: "Senin, 15 Feb 2026",
			jam: "08:00 - 11:00",
		},
		{
			id: "2",
			nama: "Posyandu Melati",
			tanggal: "Selasa, 16 Feb 2026",
			jam: "08:00 - 11:00",
		},
		{
			id: "3",
			nama: "Posyandu Dahlia",
			tanggal: "Rabu, 17 Feb 2026",
			jam: "08:00 - 11:00",
		},
		{
			id: "4",
			nama: "Posyandu Anggrek",
			tanggal: "Kamis, 18 Feb 2026",
			jam: "08:00 - 11:00",
		},
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
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				Jadwal Posyandu
			</Title>
			<Stack gap="sm">
				{displayData.map((item) => (
					<Card
						key={item.id}
						p="md"
						radius="md"
						withBorder
						bg={dark ? "#263852ff" : "#F1F5F9"}
						style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
					>
						<Group justify="space-between">
							<Stack gap={0}>
								<Text fw={600} c={dark ? "white" : "#1e3a5f"}>
									{item.nama}
								</Text>
								<Text size="sm" c={dark ? "white" : "dimmed"}>
									{item.tanggal}
								</Text>
							</Stack>
							<Badge variant="light" color="darmasaba-blue" size="md">
								{item.jam}
							</Badge>
						</Group>
					</Card>
				))}
			</Stack>
		</Card>
	);
};
