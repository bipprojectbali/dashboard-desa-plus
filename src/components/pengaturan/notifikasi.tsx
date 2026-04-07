import {
	Button,
	Grid,
	GridCol,
	Group,
	Stack,
	Switch,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";

const NotifikasiSettings = () => {
	const { colorScheme } = useMantineColorScheme();
	const _dark = colorScheme === "dark";
	return (
		<Stack pr={"20%"} gap={"xs"}>
			<Grid gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}>
				<GridCol span={6}>
					<Stack gap={"xs"}>
						<Title order={3} mb="sm">
							Metode Notifikasi
						</Title>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Laporan Harian
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Alert Sistem
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Update Keamanan
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Newsletter Bulanan
							</Text>
							<Switch defaultChecked />
						</Group>
					</Stack>
				</GridCol>
				<GridCol span={6}>
					<Stack gap={"xs"}>
						<Title order={3} mb="sm">
							Preferensi Alert
						</Title>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Treshold Memori
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Treshold CPU
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Treshold Disk
							</Text>
							<Switch defaultChecked />
						</Group>
					</Stack>
				</GridCol>
				<GridCol span={6}>
					<Stack gap={"xs"}>
						<Title order={3} mb="sm">
							Notifikasi Push
						</Title>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Alert Kritis
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Aktivitas Tim
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Komentar & Mention
							</Text>
							<Switch defaultChecked />
						</Group>
						<Group mb="md" justify="space-between">
							<Text fw={"bold"} fz={"sm"}>
								Bunyi Notifikasi
							</Text>
							<Switch defaultChecked />
						</Group>
					</Stack>
				</GridCol>
			</Grid>
			<Group justify="flex-start" mt="xl">
				<Button variant="outline">Batal</Button>
				<Button>Simpan Preferensi</Button>
			</Group>
		</Stack>
	);
};

export default NotifikasiSettings;
