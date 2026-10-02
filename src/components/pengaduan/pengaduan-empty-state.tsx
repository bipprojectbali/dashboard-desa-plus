import { Center, Stack, Text } from "@mantine/core";
import { Inbox } from "lucide-react";

export function EmptyState({
	message,
	height = 200,
}: {
	message: string;
	height?: number;
}) {
	return (
		<Center h={height}>
			<Stack align="center" gap="xs">
				<Inbox size={32} color="gray" />
				<Text size="sm" c="dimmed" ta="center">
					{message}
				</Text>
			</Stack>
		</Center>
	);
}
