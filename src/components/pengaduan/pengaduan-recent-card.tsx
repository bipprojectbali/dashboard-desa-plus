import {
	Badge,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import type { PengaduanData } from "./pengaduan.types";
import { EmptyState } from "./pengaduan-empty-state";

dayjs.extend(relativeTime);

const getStatusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "baru":
			return "red";
		case "diproses":
		case "proses":
			return "blue";
		case "selesai":
			return "green";
		default:
			return "gray";
	}
};

interface Props {
	items: PengaduanData["pengajuan_terbaru"];
	loading: boolean;
}

export function PengaduanRecentCard({ items, loading }: Props) {
	const t = useTranslate();
	const dark = useIsDark();

	return (
		<Card
			data-ai-target="pengaduan.pengajuan-terbaru"
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
				{t.pengaduanLayanan.pengajuanTerbaru}
			</Title>
			<Stack gap="sm">
				{loading ? (
					<Skeleton height={180} radius="md" />
				) : items.length > 0 ? (
					items.map((item) => (
						<Card
							key={item.id}
							p="sm"
							radius="md"
							withBorder
							bg={dark ? "#334155" : "#F1F5F9"}
							style={{
								borderColor: "transparent",
								transition: "background-color 0.15s ease",
							}}
						>
							<Group justify="space-between">
								<Stack gap={0}>
									<Text fw={600} c={dark ? "white" : "gray.9"} tt="capitalize">
										{item.kategori}
									</Text>
									{item.sub_kategori && (
										<Text size="sm" c="dimmed" tt="capitalize">
											{item.sub_kategori}
										</Text>
									)}
								</Stack>
								<Stack gap={0} align="flex-end">
									<Badge
										color={getStatusColor(item.status)}
										variant="light"
										radius="sm"
									>
										{item.status}
									</Badge>
									<Text size="xs" c="dimmed">
										{dayjs(item.created_at).fromNow()}
									</Text>
								</Stack>
							</Group>
						</Card>
					))
				) : (
					<EmptyState message={t.pengaduanLayanan.tidakAdaPengajuan} />
				)}
			</Stack>
		</Card>
	);
}
