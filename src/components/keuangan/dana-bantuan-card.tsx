import {
	Badge,
	Box,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Coins } from "lucide-react";
import type { KeuanganAid } from "@/api/transforms/keuangan-apbdes";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface DanaBantuanCardProps {
	aid: KeuanganAid[];
	loading: boolean;
}

export function DanaBantuanCard({ aid, loading }: DanaBantuanCardProps) {
	const t = useTranslate();
	const dark = useIsDark();

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#374b6aff" : "var(--mantine-color-white)",
				boxShadow: "var(--mantine-shadow-xs)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<Coins size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.keuanganAnggaran.danaBantuan}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={200} radius="md" />
			) : (
				<Stack gap="sm">
					{aid.length > 0 ? (
						aid.map((fund) => (
							<Card
								key={fund.source}
								p="sm"
								radius="lg"
								bg={dark ? "#1e3a5f" : "#eaf1fb"}
								style={{
									borderColor: "transparent",
									transition: "background-color 0.15s ease",
								}}
							>
								<Group justify="space-between" align="center">
									<Box>
										<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
											{fund.source}
										</Text>
										<Text size="xs" c="dimmed">
											Rp {(fund.amount / 1_000_000).toLocaleString()}jt
										</Text>
									</Box>
									<Badge
										variant="light"
										color={fund.status === "cair" ? "green" : "yellow"}
										radius="sm"
										fw={600}
									>
										{fund.status === "cair"
											? t.keuanganAnggaran.cair
											: t.keuanganAnggaran.proses}
									</Badge>
								</Group>
							</Card>
						))
					) : (
						<Text size="sm" c="dimmed" ta="center" py="xl">
							{t.keuanganAnggaran.tidakAdaBantuan}
						</Text>
					)}
				</Stack>
			)}
		</Card>
	);
}
