import {
	Card,
	Group,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconAward } from "@tabler/icons-react";

interface ScholarshipData {
	penerima: number;
	dana: string;
	tahunAjaran: string;
}

interface BeasiswaProps {
	data?: ScholarshipData;
}

export const Beasiswa = ({ data }: BeasiswaProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: ScholarshipData = {
		penerima: 45,
		dana: "Rp 1.200.000.000",
		tahunAjaran: "2025/2026",
	};

	const displayData = data || defaultData;

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#1E293B" : "white"}
			style={{ borderColor: dark ? "#141D34" : "#e5e7eb" }}
			h={"100%"}
		>
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "white" : "dimmed"} fw={500}>
						Beasiswa Desa
					</Text>
					<Text size="xl" fw={700} c={dark ? "white" : "#1e3a5f"}>
						Penerima: {displayData.penerima}
					</Text>
				</Stack>
				<ThemeIcon
					variant="light"
					color="darmasaba-success"
					size="xl"
					radius="xl"
				>
					<IconAward size={24} />
				</ThemeIcon>
			</Group>
			<Stack gap="xs" mt="md">
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>Dana Tersalurkan:</Text>
					<Text fw={700} c={dark ? "white" : "#1e3a5f"}>
						{displayData.dana}
					</Text>
				</Group>
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>Tahun Ajaran:</Text>
					<Text c={dark ? "white" : "#1e3a5f"}>{displayData.tahunAjaran}</Text>
				</Group>
			</Stack>
		</Card>
	);
};
