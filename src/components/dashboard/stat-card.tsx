import {
	Box,
	Card,
	Group,
	Text,
	ThemeIcon,
	useMantineColorScheme,
} from "@mantine/core";
import type { ReactNode } from "react";

interface StatCardProps {
	title: string;
	value: string | number;
	detail?: string;
	trend?: string;
	trendValue?: number;
	icon: ReactNode;
	iconColor?: string;
}

export function StatCard({
	title,
	value,
	detail,
	trend,
	trendValue,
	icon,
	iconColor = "darmasaba-blue",
}: StatCardProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const isPositiveTrend = trendValue ? trendValue >= 0 : true;

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
			<Group justify="space-between" align="flex-start" w="100%">
				<Box style={{ flex: 1 }}>
					<Text size="sm" c="dimmed" mb="xs">
						{title}
					</Text>
					<Group align="baseline" gap="xs">
						<Text size="xl" fw={700} c={dark ? "white" : "gray.9"}>
							{value}
						</Text>
					</Group>
					{detail && (
						<Text size="sm" c="dimmed" mt="xs">
							{detail}
						</Text>
					)}
					{trend && (
						<Text
							size="sm"
							c={isPositiveTrend ? "green" : "red"}
							mt="xs"
							fw={500}
						>
							{trend}
						</Text>
					)}
				</Box>
				<ThemeIcon
					variant="filled"
					size="xl"
					radius="xl"
					color={dark ? "gray" : iconColor}
				>
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}
