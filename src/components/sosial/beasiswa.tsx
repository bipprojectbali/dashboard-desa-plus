import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface ScholarshipData {
	penerima: number;
	dana: string;
	tahunAjaran: string;
}

interface BeasiswaProps {
	data?: ScholarshipData;
}

export const Beasiswa = ({ data }: BeasiswaProps) => {
	const t = useTranslate();
	const dark = useIsDark();

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
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
			h={"100%"}
		>
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "white" : "dimmed"} fw={500}>
						{t.sosial.beasiswaDesa}
					</Text>
					<Text size="xl" fw={700} c={dark ? "white" : "#1e3a5f"}>
						{t.sosial.penerima}: {displayData.penerima}
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
					<Text c={dark ? "white" : "dimmed"}>{t.sosial.danaTersalurkan}:</Text>
					<Text fw={700} c={dark ? "white" : "#1e3a5f"}>
						{displayData.dana}
					</Text>
				</Group>
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>{t.sosial.tahunAjaran}:</Text>
					<Text c={dark ? "white" : "#1e3a5f"}>{displayData.tahunAjaran}</Text>
				</Group>
			</Stack>
		</Card>
	);
};
