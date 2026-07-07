import {
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";

const DESA_API =
	typeof import.meta.env !== "undefined" && import.meta.env?.VITE_DESA_API_URL
		? import.meta.env.VITE_DESA_API_URL
		: "https://desa-darmasaba-stg.wibudev.com";

interface JenjangItem {
	nama: string;
	jumlahSiswa: number;
}

interface PendidikanStats {
	perJenjang: JenjangItem[];
	jumlahLembaga: number;
	jumlahPengajar: number;
}

// Mengembalikan null bila gagal — mempertahankan perilaku lama (tanpa error UI).
async function fetchPendidikan(): Promise<PendidikanStats | null> {
	const r = await fetch(`${DESA_API}/api/pendidikan/ringkasan/stats`);
	const json = await r.json();
	return json.success ? json.data : null;
}

export const Pendidikan = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const { data: stats = null, isLoading: loading } = useApiQuery(
		["sosial-ext", "pendidikan"],
		fetchPendidikan,
	);

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
				{t.sosial.pendidikan}
			</Title>
			<Stack gap="md">
				{loading
					? Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
							<Skeleton key={i} height={20} radius="sm" />
						))
					: stats?.perJenjang.map((item) => (
							<Group key={item.nama} justify="space-between">
								<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
									{item.nama}
								</Text>
								<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
									{item.jumlahSiswa}
								</Text>
							</Group>
						))}

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
							{t.sosial.jumlahLembagaPendidikan}
						</Text>
						{loading ? (
							<Skeleton height={20} width={40} radius="sm" />
						) : (
							<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
								{stats?.jumlahLembaga ?? 0}
							</Text>
						)}
					</Group>
					<Group justify="space-between" mt="sm">
						<Text fw={500} c={dark ? "dark.0" : "#1e3a5f"}>
							{t.sosial.jumlahTenagaPengajar}
						</Text>
						{loading ? (
							<Skeleton height={20} width={40} radius="sm" />
						) : (
							<Text fw={700} c={dark ? "dark.0" : "#1e3a5f"}>
								{stats?.jumlahPengajar ?? 0}
							</Text>
						)}
					</Group>
				</Card>
			</Stack>
		</Card>
	);
};
