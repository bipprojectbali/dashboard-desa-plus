import { Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

/**
 * Indikator non-interaktif "+N lainnya" saat data widget list terpotong oleh
 * cap ukuran ({@link import("./wall-item-cap").maxVisibleItems}). Wall = mode
 * kiosk/TV tanpa scroll/pagination, jadi ini murni informatif — tak bisa diklik.
 */
export function MoreIndicator({ count }: { count: number }) {
	if (count <= 0) return null;
	return (
		<Text
			size="xs"
			style={{
				color: WALL_THEME.TEXT_DIM,
				textAlign: "center",
				flexShrink: 0,
			}}
		>
			+{count} lainnya
		</Text>
	);
}
