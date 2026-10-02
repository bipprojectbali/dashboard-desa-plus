import {
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import {
	CheckCircle,
	Clock,
	FileText,
	MessageCircle,
	XCircle,
} from "lucide-react";
import { deriveDitolak } from "@/api/transforms/noc-pengaduan";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import type { PengaduanData } from "./pengaduan.types";

interface Props {
	stats: PengaduanData["stats"];
	loading: boolean;
}

export function PengaduanSummaryCards({ stats, loading }: Props) {
	const t = useTranslate();
	const dark = useIsDark();
	const ditolak = deriveDitolak(stats);

	const summaryData = [
		{
			title: t.pengaduanLayanan.totalPengaduan,
			value: stats.total,
			subtitle: t.pengaduanLayanan.bulanIni,
			icon: MessageCircle,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.baru,
			value: stats.baru,
			subtitle: t.pengaduanLayanan.belumDiproses,
			icon: FileText,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.diproses,
			value: stats.diproses,
			subtitle: t.pengaduanLayanan.sedangDitangani,
			icon: Clock,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.selesai,
			value: stats.selesai,
			subtitle: t.pengaduanLayanan.terselesaikan,
			icon: CheckCircle,
			color: "darmasaba-navy.7",
		},
		{
			title: t.pengaduanLayanan.ditolak,
			value: ditolak,
			subtitle: t.pengaduanLayanan.tidakDitindaklanjuti,
			icon: XCircle,
			color: "darmasaba-navy.7",
		},
	];

	return (
		<Grid gutter="md">
			{loading
				? Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton array
						<Grid.Col key={i} span={{ base: 12, sm: 6, lg: 2.4 }}>
							<Skeleton height={100} radius="xl" />
						</Grid.Col>
					))
				: summaryData.map((item) => (
						<Grid.Col key={item.title} span={{ base: 12, sm: 6, lg: 2.4 }}>
							<Card
								p="md"
								radius="xl"
								withBorder
								bg={dark ? "#1E293B" : "white"}
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								h="100%"
							>
								<Group justify="space-between" align="center" w="100%">
									<Stack gap={2}>
										<Text size="sm" c="dimmed">
											{item.title}
										</Text>
										<Text size="xl" fw={700} c={dark ? "white" : "gray.9"}>
											{item.value}
										</Text>
										<Text size="xs" c="dimmed">
											{item.subtitle}
										</Text>
									</Stack>
									<ThemeIcon
										color={item.color}
										variant="filled"
										size="lg"
										radius="xl"
									>
										<item.icon style={{ width: "60%", height: "60%" }} />
									</ThemeIcon>
								</Group>
							</Card>
						</Grid.Col>
					))}
		</Grid>
	);
}
