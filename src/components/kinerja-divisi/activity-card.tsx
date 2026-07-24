import { Box, Card, Group, Progress, Text } from "@mantine/core";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";

interface ActivityCardProps {
	title: string;
	date: string;
	progress: number;
	status: "SELESAI" | "BERJALAN" | "TERTUNDA";
}

export function ActivityCard({
	title,
	date,
	progress,
	status,
}: ActivityCardProps) {
	const t = useTranslate();
	const statusLabel =
		status === "SELESAI"
			? t.kinerjaDivisi.statusSelesai
			: status === "BERJALAN"
				? t.kinerjaDivisi.statusBerjalan
				: t.kinerjaDivisi.statusTertunda;
	const getStatusColor = () => {
		switch (status) {
			case "SELESAI":
				return CHART.green;
			case "BERJALAN":
				return CHART.blue;
			case "TERTUNDA":
				return CHART.red;
			default:
				return CHART.gray;
		}
	};

	const dark = useIsDark();

	return (
		<Card
			radius="xl"
			p={0}
			withBorder={false}
			style={{
				backgroundColor: dark ? "#334155" : "white",
				overflow: "hidden",
			}}
			h={"100%"}
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
						{statusLabel}
					</Box>
				</Group>
			</Box>
		</Card>
	);
}
