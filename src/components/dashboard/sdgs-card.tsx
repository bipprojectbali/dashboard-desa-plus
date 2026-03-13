import { Box, Card, Group, Text, useMantineColorScheme } from "@mantine/core";
import type { ReactNode } from "react";

interface SDGSCardProps {
	title: string;
	score: number;
	icon: ReactNode;
	color: string;
	bgColor: string;
}

export function SDGSCard({
	title,
	score,
	icon,
	color,
	bgColor,
}: SDGSCardProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={bgColor}
			style={{
				borderColor: dark ? "#334155" : bgColor,
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
		>
			<Group justify="space-between" align="flex-start" w="100%">
				<Box style={{ flex: 1 }}>
					<Text size="sm" c={dark ? "white" : "gray.8"} fw={500} mb="xs">
						{title}
					</Text>
					<Text size="xl" fw={700} c={color}>
						{score.toFixed(2)}
					</Text>
				</Box>
				<Box
					style={{
						color,
						opacity: 0.8,
					}}
				>
					{icon}
				</Box>
			</Group>
		</Card>
	);
}
