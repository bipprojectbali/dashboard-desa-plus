import { Box, type MantineSpacing, Text } from "@mantine/core";
import type { ReactNode } from "react";

/** Label kecil kapital berlatar biru tipis untuk sub-bagian kartu kontak. */
export function HelpSectionLabel({
	dark,
	mb,
	children,
}: {
	dark: boolean;
	mb: MantineSpacing;
	children: ReactNode;
}) {
	return (
		<Box
			mb={mb}
			px="xs"
			py={5}
			style={{
				background: dark ? "rgba(37,99,235,0.1)" : "rgba(30,58,95,0.06)",
				borderRadius: 6,
			}}
		>
			<Text
				size="xs"
				fw={700}
				tt="uppercase"
				c={dark ? "blue.3" : "blue.8"}
				style={{ letterSpacing: 1 }}
			>
				{children}
			</Text>
		</Box>
	);
}
