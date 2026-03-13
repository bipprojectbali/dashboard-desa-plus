import {
	Alert,
	Button,
	Card,
	Group,
	PasswordInput,
	Space,
	Switch,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconInfoCircle, IconLock } from "@tabler/icons-react";

const KeamananSettings = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	return (
		<Card
			withBorder
			radius="md"
			p="xl"
			bg={dark ? "#141D34" : "white"}
			style={{ borderColor: dark ? "#141D34" : "white" }}
		>
			<Title order={2} mb="lg">
				Pengaturan Keamanan
			</Title>
			<Text color="dimmed" mb="xl">
				Kelola keamanan akun Anda
			</Text>

			<Space h="lg" />

			<PasswordInput
				label="Kata Sandi Saat Ini"
				placeholder="Masukkan kata sandi saat ini"
				mb="md"
			/>

			<PasswordInput
				label="Kata Sandi Baru"
				placeholder="Masukkan kata sandi baru"
				mb="md"
			/>

			<PasswordInput
				label="Konfirmasi Kata Sandi Baru"
				placeholder="Konfirmasi kata sandi baru"
				mb="md"
			/>

			<Space h="md" />

			<Group mb="md">
				<Switch label="Verifikasi Dua Langkah" />
				<Switch label="Login Otentikasi Aplikasi" />
			</Group>

			<Space h="md" />

			<Alert
				icon={<IconLock size={16} />}
				title="Keamanan"
				color="orange"
				mb="md"
			>
				Gunakan kata sandi yang kuat dan unik. Hindari menggunakan kata sandi
				yang sama di banyak layanan.
			</Alert>

			<Alert
				icon={<IconInfoCircle size={16} />}
				title="Informasi"
				color="blue"
				mb="md"
			>
				Setelah mengganti kata sandi, Anda akan diminta logout dari semua
				perangkat.
			</Alert>

			<Group justify="flex-end" mt="xl">
				<Button variant="outline">Batal</Button>
				<Button>Perbarui Kata Sandi</Button>
			</Group>
		</Card>
	);
};

export default KeamananSettings;
