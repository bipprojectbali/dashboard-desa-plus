import { Card, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { MessageCircle } from "lucide-react";

interface DiscussionItem {
	message: string;
	sender: string;
	date: string;
}

const discussions: DiscussionItem[] = [
	{
		message: "Kepada Pelayanan, mohon di cek...",
		sender: "I.B Surya Prabhawa Manu",
		date: "12 Apr 2025",
	},
	{
		message: "Kepada staf perencanaan @suar...",
		sender: "Ni Nyoman Yuliani",
		date: "14 Jun 2025",
	},
	{
		message: "ijin atau mohon kepada KBD sar...",
		sender: "Ni Wayan Martini",
		date: "12 Apr 2025",
	},
];

export function DiscussionPanel() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

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
				{discussions.map((discussion) => (
					<Card
						key={`${discussion.sender}-${discussion.date}`}
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
							</Text>
							<Text size="xs" c="dimmed">
								{discussion.date}
							</Text>
						</Group>
					</Card>
				))}
			</Stack>
		</Card>
	);
}
