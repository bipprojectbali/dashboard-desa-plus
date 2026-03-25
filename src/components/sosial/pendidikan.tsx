import {
	Card,
	Group,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

interface EducationData {
	siswa: {
		tk: number;
		sd: number;
		smp: number;
		sma: number;
	};
	sekolah: {
		jumlah: number;
		guru: number;
	};
}

interface PendidikanProps {
	data?: EducationData;
}

export const Pendidikan = ({ data }: PendidikanProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const defaultData: EducationData = {
		siswa: {
			tk: 125,
			sd: 480,
			smp: 210,
			sma: 150,
		},
		sekolah: {
			jumlah: 8,
			guru: 42,
		},
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
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				Pendidikan
			</Title>
			<Stack gap="md">
				<Group justify="space-between">
					<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
						TK / PAUD
					</Text>
					<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
						{displayData.siswa.tk}
					</Text>
				</Group>
				<Group justify="space-between">
					<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
						SD
					</Text>
					<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
						{displayData.siswa.sd}
					</Text>
				</Group>
				<Group justify="space-between">
					<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
						SMP
					</Text>
					<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
						{displayData.siswa.smp}
					</Text>
				</Group>
				<Group justify="space-between">
					<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
						SMA
					</Text>
					<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
						{displayData.siswa.sma}
					</Text>
				</Group>

				<Card
					withBorder
					radius="md"
					p="md"
					mt="md"
					bg={dark ? "#263852ff" : "#F1F5F9"}
					style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
				>
					<Group justify="space-between">
						<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
							Jumlah Lembaga Pendidikan
						</Text>
						<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
							{displayData.sekolah.jumlah}
						</Text>
					</Group>
					<Group justify="space-between" mt="sm">
						<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
							Jumlah Tenaga Pengajar
						</Text>
						<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
							{displayData.sekolah.guru}
						</Text>
					</Group>
				</Card>
			</Stack>
		</Card>
	);
};
