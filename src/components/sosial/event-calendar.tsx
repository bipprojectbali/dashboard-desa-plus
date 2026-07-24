import {
	Card,
	Group,
	Pagination,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useState } from "react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

const PAGE_SIZE = 5;

interface EventItem {
	id: string;
	nama: string;
	tanggal: string;
	lokasi: string;
}

interface EventCalendarProps {
	data?: EventItem[];
}

function formatTanggal(iso: string): string {
	return new Date(iso).toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export const EventCalendar = ({ data }: EventCalendarProps) => {
	const t = useTranslate();
	const dark = useIsDark();
	const [page, setPage] = useState(1);

	const totalPages = data ? Math.ceil(data.length / PAGE_SIZE) : 1;
	const paginatedData = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				{t.sosial.kalenderEventBudaya}
			</Title>
			<Stack gap="sm">
				{!paginatedData ? (
					Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<Skeleton key={i} height={72} radius="md" />
					))
				) : paginatedData.length === 0 ? (
					<Text size="sm" c="dimmed" ta="center" py="md">
						Belum ada event budaya mendatang
					</Text>
				) : (
					paginatedData.map((event) => (
						<Card
							key={event.id}
							p="md"
							radius="md"
							withBorder
							bg={dark ? "#263852ff" : "#F1F5F9"}
							style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
						>
							<Group justify="space-between" mb="xs">
								<Group gap="sm" align="center">
									<ThemeIcon
										color="darmasaba-blue"
										size="md"
										radius="xl"
										variant="light"
									>
										<IconCalendarEvent size={16} />
									</ThemeIcon>
									<Text fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
										{event.nama}
									</Text>
								</Group>
								<Text size="sm" c={dark ? "dark.3" : "dimmed"} fw={500}>
									{event.lokasi}
								</Text>
							</Group>
							<Group pl={36}>
								<Text size="sm" c={dark ? "white" : "gray.6"}>
									{formatTanggal(event.tanggal)}
								</Text>
							</Group>
						</Card>
					))
				)}
			</Stack>
			{totalPages > 1 && (
				<Group justify="center" mt="md">
					<Pagination
						value={page}
						onChange={setPage}
						total={totalPages}
						size="sm"
						radius="md"
						color="darmasaba-blue"
					/>
				</Group>
			)}
		</Card>
	);
};
