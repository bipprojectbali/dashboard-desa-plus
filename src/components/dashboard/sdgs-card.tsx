import { Card, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { useIsDark } from "@/hooks/useIsDark";

interface SDGSCardProps {
	title: string;
	score: number;
	image: ReactNode;
}

export function SDGSCard({ title, score, image }: SDGSCardProps) {
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
			<Stack align="center" gap="xs" h="100%" justify="space-between">
				<Stack align="center" gap="xs">
					{image}
					<Text
						ta="center"
						size="sm"
						c={dark ? "white" : "gray.8"}
						fw={500}
						lineClamp={3}
						style={{
							minHeight: "2.5em",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{title}
					</Text>
				</Stack>
				<Text ta="center" size="xl" c={dark ? "white" : "gray.8"} fw={700}>
					{score.toFixed(2)}
				</Text>
			</Stack>
		</Card>
	);
}
