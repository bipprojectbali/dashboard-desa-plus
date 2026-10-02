import { Card, Skeleton, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import type { PengaduanData } from "./pengaduan.types";
import { EmptyState } from "./pengaduan-empty-state";

dayjs.extend(relativeTime);

interface Props {
	items: PengaduanData["musrenbang"];
	loading: boolean;
}

export function PengaduanMusrenbangCard({ items, loading }: Props) {
	const t = useTranslate();
	const dark = useIsDark();

	return (
		<Card
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
				{t.pengaduanLayanan.ajuanIdeInovatif}
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
							<Stack gap={0}>
								<Text fw={600} c={dark ? "white" : "gray.9"}>
									{item.judul}
								</Text>
								<Text size="sm" c="dimmed">
									{item.nama_pengusul}
								</Text>
								<Text size="xs" c="dimmed">
									{dayjs(item.created_at).fromNow()}
								</Text>
							</Stack>
						</Card>
					))
				) : (
					<EmptyState message={t.pengaduanLayanan.tidakAdaIde} />
				)}
			</Stack>
		</Card>
	);
}
