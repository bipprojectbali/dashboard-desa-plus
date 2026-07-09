// Import Mantine components directly
import { Badge, Group, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";
// Import custom Card and its sub-components
import { Card } from "./ui/card";

interface DashboardCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	change?: string;
	icon: ReactNode;
	badge?: string;
}

export function DashboardCard({
	title,
	value,
	subtitle,
	change,
	icon,
	badge,
}: DashboardCardProps) {
	return (
		<Card className="p-6 bg-gray-50 dark:bg-gray-800 border-none relative">
			<Group justify="space-between" align="flex-start" w="100%">
				<div style={{ flex: 1 }}>
					<Text size="sm" c="dimmed" mb="xs">
						{title}
					</Text>
					<Group align="baseline" gap="xs">
						<Text size="xl" fw={700}>
							{value}
						</Text>
						{badge && (
							<Badge variant="light" radius="xl" size="lg" color="gray">
								{badge}
							</Badge>
						)}
					</Group>
					{subtitle && (
						<Text size="sm" c="dimmed" mt="xs">
							{subtitle}
						</Text>
					)}
					{change && (
						<Text size="sm" c="red" mt="xs">
							↗ {change}
						</Text>
					)}
				</div>
				<ThemeIcon
					variant="filled"
					size="xl"
					radius="xl"
					color="darmasaba-navy"
				>
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}
