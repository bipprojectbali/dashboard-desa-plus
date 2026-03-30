import {
	Card,
	Group,
	Loader,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";

interface DiscussionItem {
	id: string;
	message: string;
	sender: string;
	date: string;
	division: string | null;
	isResolved: boolean;
}

export function DiscussionPanel() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDiscussions() {
			try {
				const res = await apiClient.GET("/api/division/discussions");
				if (res.data?.data) {
					setDiscussions(res.data.data);
				}
			} catch (error) {
				console.error("Failed to fetch discussions", error);
			} finally {
				setLoading(false);
			}
		}

		fetchDiscussions();
	}, []);

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
					Diskusi
				</Text>
			</Group>
			<Stack gap="sm">
				{loading ? (
					<Group justify="center" py="xl">
						<Loader />
					</Group>
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
						Tidak ada diskusi
					</Text>
				)}
			</Stack>
		</Card>
	);
}
