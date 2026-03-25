import { Box, Card, Group, Text, useMantineColorScheme } from "@mantine/core";
import type { ReactNode } from "react";

interface SDGSCardProps {
	title: string;
	score: number;
	image: ReactNode;
}

export function SDGSCard({ title, score, image }: SDGSCardProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group justify="space-between" align="flex-start" w="100%">
				<Box>{image}</Box>
				<Box style={{ flex: 1 }}>
					<Text
						ta={"center"}
						size="sm"
						c={dark ? "white" : "gray.8"}
						fw={500}
						mb="xs"
					>
						{title}
					</Text>
					<Text ta={"center"} size="xl" c={dark ? "white" : "gray.8"} fw={700}>
						{score.toFixed(2)}
					</Text>
				</Box>
			</Group>
		</Card>
	);
}
