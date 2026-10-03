import { SimpleGrid, Text } from "@mantine/core";
import { HelpCard } from "@/components/ui/help-card";
import type { HelpStat } from "./help-content.types";
import { type HelpPalette, helpCardStyle } from "./help-palette";

/** Tiga angka ringkas di atas halaman Bantuan. */
export function HelpStatsGrid({
	stats,
	palette,
}: {
	stats: HelpStat[];
	palette: HelpPalette;
}) {
	return (
		<SimpleGrid cols={3} spacing="lg" mb="xl">
			{stats.map((stat) => (
				<HelpCard
					key={stat.label}
					bg={palette.cardBg}
					p="lg"
					style={{ textAlign: "center", ...helpCardStyle(palette) }}
					h="100%"
				>
					<Text size="xl" fw={700} style={{ fontSize: "32px" }}>
						{stat.value}
					</Text>
					<Text size="sm" {...palette.dimmedText}>
						{stat.label}
					</Text>
				</HelpCard>
			))}
		</SimpleGrid>
	);
}
