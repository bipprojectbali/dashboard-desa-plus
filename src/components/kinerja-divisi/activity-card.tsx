import {
	Box,
	Card,
	Group,
	Progress,
	Text,
	useMantineColorScheme,
} from "@mantine/core";

interface ActivityCardProps {
	title: string;
	date: string;
	progress: number;
	status: "selesai" | "berjalan" | "tertunda";
}

export function ActivityCard({
	title,
	date,
	progress,
	status,
}: ActivityCardProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const getStatusColor = (s: string) => {
		switch (s) {
			case "selesai":
				return "#22C55E";
			case "berjalan":
				return "#3B82F6";
			case "tertunda":
				return "#EF4444";
			default:
				return "#9CA3AF";
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
		>
			<Box
				style={{
					borderLeft: `4px solid #3B82F6`,
					paddingLeft: 12,
					marginBottom: 12,
				}}
			>
				<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
					{title}
				</Text>
			</Box>

			<Group justify="space-between" mb="xs">
				<Text size="xs" c="dimmed">
					{date}
				</Text>
				<Box
					style={{
						backgroundColor: getStatusColor(status),
						color: "white",
						padding: "2px 8px",
						borderRadius: 4,
						fontSize: 11,
						fontWeight: 600,
					}}
				>
					{status.toUpperCase()}
				</Box>
			</Group>

			<Progress
				value={progress}
				size="sm"
				radius="xl"
				color={progress === 100 ? "green" : "yellow"}
				animated={progress < 100}
			/>

			<Text size="xs" c="dimmed" mt="xs" ta="right">
				{progress}%
			</Text>
		</Card>
	);
}
