import { Group, ScrollArea, Text, ThemeIcon } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import type { HelpArticle } from "./help-content.types";
import { HelpDetailModal } from "./help-detail-modal";

interface HelpGuideModalProps {
	guide: HelpArticle | null;
	onClose: () => void;
	badge: string;
	closeLabel: string;
}

/** Modal panduan: isi dipecah per baris menjadi langkah bernomor. */
export function HelpGuideModal({
	guide,
	onClose,
	badge,
	closeLabel,
}: HelpGuideModalProps) {
	return (
		<HelpDetailModal
			opened={!!guide}
			onClose={onClose}
			size="md"
			gradient="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
			accent="#6366f1"
			icon={<IconBook size={20} />}
			badge={badge}
			title={guide?.title}
			subtitle={guide?.description}
			closeLabel={closeLabel}
		>
			<ScrollArea h={320} px="xl" py="lg">
				{guide?.content
					.split("\n")
					.filter(Boolean)
					.map((line, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static ordered list, no reorder
						<Group key={i} gap="sm" mb="sm" align="flex-start">
							<ThemeIcon
								size={22}
								radius="xl"
								variant="light"
								color="indigo"
								style={{ flexShrink: 0, marginTop: 2 }}
							>
								<Text size="xs" fw={700}>
									{i + 1}
								</Text>
							</ThemeIcon>
							<Text size="sm" style={{ flex: 1, lineHeight: 1.6 }}>
								{line.replace(/^\d+\.\s*/, "")}
							</Text>
						</Group>
					))}
			</ScrollArea>
		</HelpDetailModal>
	);
}
