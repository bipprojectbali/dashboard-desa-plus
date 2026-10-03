import { Box, ScrollArea } from "@mantine/core";
import { IconFileText } from "@tabler/icons-react";
import type { HelpArticle } from "./help-content.types";
import { HelpDetailModal } from "./help-detail-modal";
import type { HelpPalette } from "./help-palette";

interface HelpDocModalProps {
	doc: HelpArticle | null;
	onClose: () => void;
	badge: string;
	closeLabel: string;
	palette: HelpPalette;
}

/** Modal dokumentasi: isi ditampilkan sebagai blok monospace. */
export function HelpDocModal({
	doc,
	onClose,
	badge,
	closeLabel,
	palette,
}: HelpDocModalProps) {
	return (
		<HelpDetailModal
			opened={!!doc}
			onClose={onClose}
			size="lg"
			gradient="linear-gradient(135deg, #10b981 0%, #3b82f6 100%)"
			accent="#10b981"
			icon={<IconFileText size={20} />}
			badge={badge}
			title={doc?.title}
			subtitle={doc?.description}
			closeLabel={closeLabel}
		>
			<ScrollArea h={340} px="xl" py="lg">
				<Box
					p="md"
					style={{
						fontFamily: "monospace",
						fontSize: 13,
						borderRadius: 8,
						background: palette.codeBg,
						border: `1px solid ${palette.codeBorder}`,
						whiteSpace: "pre-wrap",
						lineHeight: 1.7,
					}}
				>
					{doc?.content}
				</Box>
			</ScrollArea>
		</HelpDetailModal>
	);
}
