import {
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface DiscussionItem {
	id: string;
	message: string;
	sender: string;
	date: string;
	division: string | null;
	isResolved: boolean;
}

async function fetchDiscussions(): Promise<DiscussionItem[]> {
	const res = await apiClient.GET("/api/noc/latest-discussion", {
		params: { query: { idDesa: "desa1", limit: "6" } },
	});
	if (res.data?.data) {
		const rawData = res.data.data as {
			id: string;
			message: string;
			senderName: string;
			divisionName: string;
			createdAt: string;
		}[];

		return rawData.map((d) => ({
			id: d.id,
			message: d.message,
			sender: d.senderName,
			date: d.createdAt,
			division: d.divisionName,
			isResolved: false, // Default for NOC discussions
		}));
	}
	return [];
}

export function DiscussionPanel() {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const { data: discussions = [], isLoading: loading } = useApiQuery(
		["kinerja", "latest-discussion"],
		fetchDiscussions,
	);

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "dd MMM yyyy", { locale: id });
		} catch {
			return dateString;
		}
	};

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: dark
					? "0 1px 3px 0 rgb(0 0 0 / 0.1)"
					: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="md">
				<MessageCircle size={20} color={dark ? "#E2E8F0" : "#1E3A5F"} />
				<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
					{t.kinerjaDivisi.diskusi}
				</Text>
			</Group>
			<Stack gap="sm">
				{loading ? (
					<Stack gap="sm">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} height={72} radius="md" />
						))}
					</Stack>
				) : discussions.length > 0 ? (
					discussions.map((discussion) => (
						<Card
							key={discussion.id}
							p="sm"
							radius="md"
							withBorder
							bg={dark ? "#334155" : "#F1F5F9"}
							style={{
								borderColor: dark ? "#334155" : "#F1F5F9",
							}}
						>
							<Text
								size="sm"
								c={dark ? "white" : "#1E3A5F"}
								fw={500}
								mb="xs"
								lineClamp={2}
							>
								{discussion.message}
							</Text>
							<Group justify="space-between">
								<Text size="xs" c="dimmed">
									{discussion.sender}
									{discussion.division && (
										<Text span size="xs" c="dimmed" ml="xs">
											• {discussion.division}
										</Text>
									)}
								</Text>
								<Text size="xs" c="dimmed">
									{formatDate(discussion.date)}
								</Text>
							</Group>
						</Card>
					))
				) : (
					<Text size="sm" c="dimmed" ta="center" py="xl">
						{t.kinerjaDivisi.tidakAdaDiskusi}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
