import { Card, Group, Text, useMantineColorScheme } from "@mantine/core";
import { FileText } from "lucide-react";

interface ArchiveItem {
	name: string;
}

interface ArchiveCardProps {
	item: ArchiveItem;
	onClick?: () => void;
}

export function ArchiveCard({ item, onClick }: ArchiveCardProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "#e5e7eb",
				boxShadow: dark
					? "0 1px 3px 0 rgb(0 0 0 / 0.1)"
					: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				cursor: "pointer",
				transition: "transform 0.2s, box-shadow 0.2s",
			}}
			h="100%"
			onClick={onClick}
		>
			<Group gap="md">
				<FileText size={32} color={dark ? "#60A5FA" : "#3B82F6"} />
				<Text size="sm" fw={500} c={dark ? "white" : "#1E3A5F"}>
					{item.name}
				</Text>
			</Group>
		</Card>
	);
}
