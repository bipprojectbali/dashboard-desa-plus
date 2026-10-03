import { Box, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { HelpCard } from "@/components/ui/help-card";
import { type HelpPalette, helpCardStyle } from "./help-palette";

interface HelpListCardProps<T extends { title: string }> {
	title: string;
	icon: ReactNode;
	items: T[];
	/** Teks baris kedua tiap item (ringkasan atau durasi). */
	secondary: (item: T) => string;
	onSelect: (item: T) => void;
	palette: HelpPalette;
}

/** Kartu berisi daftar item yang bisa diklik (panduan, video, dokumentasi). */
export function HelpListCard<T extends { title: string }>({
	title,
	icon,
	items,
	secondary,
	onSelect,
	palette,
}: HelpListCardProps<T>) {
	return (
		<HelpCard
			style={helpCardStyle(palette)}
			bg={palette.cardBg}
			icon={icon}
			title={title}
			h="100%"
		>
			<Box>
				{items.map((item) => (
					<Box
						key={item.title}
						py="sm"
						style={{
							borderBottom: "1px solid #eee",
							cursor: "pointer",
						}}
						onClick={() => onSelect(item)}
					>
						<Text fw={500}>{item.title}</Text>
						<Text size="sm" {...palette.dimmedText}>
							{secondary(item)}
						</Text>
					</Box>
				))}
			</Box>
		</HelpCard>
	);
}
