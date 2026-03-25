import { Box, Button, Group, Stack, Switch, Text, Title } from "@mantine/core";

const KeamananSettings = () => {
	return (
		<Stack pr={"50%"} gap={"xl"}>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Autentikasi</Title>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Two-Factor Authentication
						</Text>
						<Switch defaultChecked />
					</Group>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Biometrik Login
						</Text>
						<Switch defaultChecked />
					</Group>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							IP Whitelist
						</Text>
						<Switch defaultChecked />
					</Group>
				</Stack>
			</Box>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Password</Title>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Ubah Password
					</Button>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Riwayat Login
					</Button>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Perangkat Terdaftar
					</Button>
				</Stack>
			</Box>
			<Box>
				<Stack gap={"xs"}>
					<Title order={2}>Audit & Log</Title>
					<Group mb="md" justify="space-between">
						<Text fw={"bold"} fz={"sm"}>
							Log Aktivitas
						</Text>
						<Switch defaultChecked />
					</Group>
					<Button bg={"#1E3A5F"} radius={"md"} c={"white"} fullWidth>
						Download Log
					</Button>
				</Stack>
			</Box>
			<Group justify="flex-start" mt="xl">
				<Button variant="outline">Batal</Button>
				<Button>Simpan Perubahan</Button>
			</Group>
		</Stack>
	);
};

export default KeamananSettings;
