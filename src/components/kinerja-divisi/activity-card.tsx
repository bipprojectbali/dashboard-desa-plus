import { Box, Card, Group, Progress, Text } from "@mantine/core";

interface ActivityCardProps {
	title: string;
	date: string;
	progress: number;
	status: "Selesai" | "Berjalan" | "Tertunda";
}

export function ActivityCard({
	title,
	date,
	progress,
	status,
}: ActivityCardProps) {
	const getStatusColor = () => {
		switch (status) {
			case "Selesai":
				return "#22C55E";
			case "Berjalan":
				return "#3B82F6";
			case "Tertunda":
				return "#EF4444";
			default:
				return "#9CA3AF";
		}
	};

	return (
		<Card
			radius="xl"
			p={0}
			withBorder={false}
			style={{
				backgroundColor: "#F3F4F6",
				overflow: "hidden",
			}}
		>
			{/* 🔵 HEADER */}
			<Box
				style={{
					backgroundColor: "#1E3A5F",
					padding: "16px",
					textAlign: "center",
				}}
			>
				<Text c="white" fw={700} size="md">
					{title}
				</Text>
			</Box>

			{/* CONTENT */}
			<Box p="md">
				{/* PROGRESS */}
				<Progress
					value={progress}
					radius="xl"
					size="lg"
					color="orange"
					styles={{
						root: {
							height: 16,
						},
					}}
				/>

				{/* FOOTER */}
				<Group justify="space-between" mt="md">
					<Text size="sm" fw={500}>
						{date}
					</Text>

					<Box
						style={{
							backgroundColor: getStatusColor(),
							color: "white",
							padding: "4px 12px",
							borderRadius: 999,
							fontSize: 12,
							fontWeight: 600,
						}}
					>
						{status}
					</Box>
				</Group>
			</Box>
		</Card>
	);
}
