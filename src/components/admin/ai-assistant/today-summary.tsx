import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { AssistantTodayStatsDto } from "@/types/ai-assistant-admin";

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<Stack gap={2}>
			<Text size="xs" c="dimmed">
				{label}
			</Text>
			<Text fw={600} size="lg">
				{value}
			</Text>
		</Stack>
	);
}

/** Ringkasan pemakaian hari ini (WITA) — angka saja, tanpa isi pesan. */
export function TodaySummary({ today }: { today: AssistantTodayStatsDto }) {
	const fmt = (n: number) => n.toLocaleString("id-ID");
	return (
		<Card withBorder radius="md" p="lg">
			<Title order={4} mb="sm">
				Ringkasan hari ini
			</Title>
			<SimpleGrid cols={{ base: 2, sm: 4 }}>
				<Stat label="Pertanyaan" value={fmt(today.messages)} />
				<Stat label="Token" value={fmt(today.tokens)} />
				<Stat label="Pengguna aktif" value={fmt(today.activeUsers)} />
				<Stat
					label="Error terakhir"
					value={
						today.lastErrorAt
							? new Date(today.lastErrorAt).toLocaleTimeString("id-ID")
							: "-"
					}
				/>
			</SimpleGrid>
		</Card>
	);
}
