import {
	Badge,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconClock, IconMapPin } from "@tabler/icons-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import type { LaporanItem } from "./keamanan.types";

/** Kartu daftar laporan keamanan publik. */
export const LaporanCard = ({
	laporanList,
	loading,
}: {
	laporanList: LaporanItem[];
	loading: boolean;
}) => {
	const t = useTranslate();
	const dark = useIsDark();

	return (
		<Card
			p="md"
			radius="md"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
			h="100%"
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "black"}>
				{t.keamanan.laporanPublik}
			</Title>
			<Stack gap="sm">
				{loading && (
					<Stack gap="sm">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} height={80} radius="md" />
						))}
					</Stack>
				)}
				{!loading && laporanList.length === 0 && (
					<Text size="sm" c={dark ? "dark.3" : "dimmed"} ta="center" py="xl">
						{t.keamanan.belumAdaLaporanKeamanan}
					</Text>
				)}
				{laporanList.map((report) => (
					<Card
						key={report.id}
						p="md"
						radius="md"
						withBorder
						bg={dark ? "#263852ff" : "#F1F5F9"}
						style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
					>
						<Group justify="space-between" mb="xs" align="flex-start">
							<Text fw={500} c={dark ? "dark.0" : "black"} style={{ flex: 1 }}>
								{report.judul}
							</Text>
							<Badge
								variant="light"
								color={
									report.status === "Selesai"
										? "green"
										: report.status === "Proses"
											? "yellow"
											: "red"
								}
								ml="xs"
							>
								{report.status}
							</Badge>
						</Group>

						<Group justify="space-between" align="center">
							<Group gap={4} align="center">
								<IconMapPin size={14} stroke={1.5} />
								<Text size="sm" c={dark ? "white" : "dimmed"}>
									{report.lokasi}
								</Text>
							</Group>
							<Group gap={4} align="center">
								<IconClock size={14} stroke={1.5} />
								<Text size="sm" c={dark ? "white" : "dimmed"}>
									{new Date(report.tanggalWaktu).toLocaleDateString("id-ID", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</Text>
							</Group>
						</Group>
					</Card>
				))}
			</Stack>
		</Card>
	);
};
