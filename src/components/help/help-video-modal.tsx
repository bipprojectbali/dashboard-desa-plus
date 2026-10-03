import { AspectRatio, Box } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import type { HelpVideo } from "./help-content.types";
import { HelpDetailModal } from "./help-detail-modal";

interface HelpVideoModalProps {
	video: HelpVideo | null;
	onClose: () => void;
	badge: string;
	durationLabel: string;
	closeLabel: string;
}

/** Modal pemutar video tutorial (iframe embed 16:9). */
export function HelpVideoModal({
	video,
	onClose,
	badge,
	durationLabel,
	closeLabel,
}: HelpVideoModalProps) {
	return (
		<HelpDetailModal
			opened={!!video}
			onClose={onClose}
			size="xl"
			gradient="linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
			accent="#ef4444"
			icon={<IconPlayerPlay size={20} />}
			badge={badge}
			title={video?.title}
			subtitle={
				<>
					{durationLabel}: {video?.duration}
				</>
			}
			closeLabel={closeLabel}
		>
			<Box p="xl">
				<AspectRatio
					ratio={16 / 9}
					style={{ borderRadius: 8, overflow: "hidden" }}
				>
					<iframe
						src={video?.url}
						title={video?.title}
						allowFullScreen
						style={{ border: 0, borderRadius: 8 }}
					/>
				</AspectRatio>
			</Box>
		</HelpDetailModal>
	);
}
