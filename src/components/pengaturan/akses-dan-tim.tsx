import { Box, Button, Group, Stack, Switch, Text, Title } from "@mantine/core";

const AksesDanTimSettings = () => {
	return (
		<Stack pr={"50%"} gap={"xl"}>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Manajemen Tim</Title>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Undangan Anggota Baru
					</Button>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Kelola Role & Permission
					</Button>
					<Group justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Daftar Anggota Teraktif
						</Text>
						<Text fw={"bold"} fz={"sm"}>
							12 Anggota
						</Text>
					</Group>
				</Stack>
			</Box>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Hak Akses</Title>
					<Group justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Administrator
						</Text>
						<Text fw={"bold"} fz={"sm"}>
							2 Orang
						</Text>
					</Group>
					<Group justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Editor
						</Text>
						<Text fw={"bold"} fz={"sm"}>
							5 Orang
						</Text>
					</Group>
					<Group justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Viewer
						</Text>
						<Text fw={"bold"} fz={"sm"}>
							5 Orang
						</Text>
					</Group>
				</Stack>
			</Box>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Kolaborasi</Title>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Izin Export Data
						</Text>
						<Switch defaultChecked />
					</Group>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Require Approval Untuk Perubahan
						</Text>
						<Switch defaultChecked />
					</Group>
				</Stack>
			</Box>
			<Group justify="flex-start" mt="xl">
				<Button variant="outline">Batal</Button>
				<Button>Simpan Perubahan</Button>
			</Group>
		</Stack>
	);
};

export default AksesDanTimSettings;
