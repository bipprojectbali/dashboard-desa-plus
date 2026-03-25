import {
	Box,
	Button,
	Group,
	Select,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

const UmumSettings = () => {
	return (
		<Box
			pr={"50%"}
		>
			<Title order={2} mb="lg">
				Preferensi Tampilan
			</Title>

			<Select
				label="Bahasa Aplikasi"
				data={[
					{ value: "id", label: "Indonesia" },
					{ value: "en", label: "English" },
				]}
				defaultValue="id"
				mb="md"
			/>

			<Select
				label="Zona Waktu"
				data={[
					{ value: "Asia/Jakarta", label: "Asia/Jakarta (GMT+7)" },
					{ value: "Asia/Makassar", label: "Asia/Makassar (GMT+8)" },
					{ value: "Asia/Jayapura", label: "Asia/Jayapura (GMT+9)" },
				]}
				defaultValue="Asia/Jakarta"
				mb="md"
			/>

			<DateInput
				label="Format Tanggal"
				mb={"xl"}
			/>

			<Title order={2} mb="lg">
				Dashboard
			</Title>

			<Group mb="md" justify="space-between">
				<Text fw={"bold"} fz={"sm"}>Refresh Otomatis</Text>
				<Switch defaultChecked />
			</Group>

			<Group mb="md" justify="space-between">
				<Text fw={"bold"} fz={"sm"}>Interval Refresh</Text>
				<Select
					data={[
						{ value: "1", label: "30d" },
						{ value: "2", label: "60d" },
						{ value: "3", label: "90d" },
					]}
					defaultValue="1"
					w={90}
				/>
			</Group>

			<Group mb="md" justify="space-between">
				<Text fw={"bold"} fz={"sm"}>Tampilkan Grid</Text>
				<Switch defaultChecked />
			</Group>

			<Group mb="md" justify="space-between">
				<Text fw={"bold"} fz={"sm"}>Animasi Transisi</Text>
				<Switch defaultChecked />
			</Group>

			<Group justify="flex-end" mt="xl">
				<Button variant="outline">Batal</Button>
				<Button>Simpan Perubahan</Button>
			</Group>
		</Box>
	);
};

export default UmumSettings;
