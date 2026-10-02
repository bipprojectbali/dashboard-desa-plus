import { Button, Group, Paper, Text } from "@mantine/core";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSnapshot } from "valtio";
import { fillTemplate } from "./assistant.logic";
import { placeGuideCard } from "./pointer/guide-place";
import { guideNext, guideStop } from "./pointer/guide-session";
import { guideStore } from "./pointer/guide-store";
import { pointerStore } from "./pointer/pointer-store";
import { useAssistantText } from "./use-assistant-access";
import { useAssistantSpace } from "./use-assistant-space";

/** Di bawah panel (Drawer 200) dan tombol kembali (196), di atas kursor penunjuk dan FAB. */
const GUIDE_Z_INDEX = 195;
const CARD_WIDTH = 320;
/** Perkiraan sebelum kartu terukur; diganti tinggi sebenarnya setelah render. */
const CARD_HEIGHT_ESTIMATE = 200;

/**
 * Kartu catatan panduan bertahap, dipasang di dekat target yang sedang ditunjuk.
 * Penjelasan dirender sebagai text node (teks biasa, tidak pernah HTML). Lanjut
 * dan Stop hanya mengubah state klien — tidak memanggil AI maupun API.
 */
export function AssistantGuideCard() {
	const guide = useSnapshot(guideStore);
	const { rect } = useSnapshot(pointerStore);
	const space = useAssistantSpace();
	const text = useAssistantText();
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(CARD_HEIGHT_ESTIMATE);

	// biome-ignore lint/correctness/useExhaustiveDependencies: ukur ulang tiap teks/langkah berganti
	useLayoutEffect(() => {
		if (ref.current) setHeight(ref.current.offsetHeight);
	}, [guide.text, guide.index]);

	if (
		!guide.active ||
		guide.stage !== "shown" ||
		!rect ||
		typeof document === "undefined"
	)
		return null;

	const place = placeGuideCard({
		rect,
		viewport: { width: window.innerWidth, height: window.innerHeight },
		card: { width: CARD_WIDTH, height },
		avoidRight: space,
	});
	const last = guide.index + 1 >= guide.total;

	return createPortal(
		<Paper
			ref={ref}
			role="region"
			aria-live="polite"
			aria-label={text.guideLabel}
			data-testid="assistant-guide-card"
			data-side={place.side}
			shadow="md"
			radius="md"
			p="sm"
			withBorder
			style={{
				position: "fixed",
				left: place.left,
				top: place.top,
				width: CARD_WIDTH,
				zIndex: GUIDE_Z_INDEX,
			}}
		>
			<Text size="xs" c="dimmed" fw={600} data-testid="assistant-guide-step">
				{fillTemplate(text.guideStep, {
					n: guide.index + 1,
					total: guide.total,
				})}
			</Text>
			<Text size="sm" mt={4} data-testid="assistant-guide-text">
				{guide.text}
			</Text>
			<Group justify="flex-end" gap="xs" mt="sm">
				<Button
					size="compact-sm"
					variant="subtle"
					color="gray"
					onClick={guideStop}
					data-testid="assistant-guide-stop"
				>
					{text.guideStop}
				</Button>
				<Button
					size="compact-sm"
					onClick={() => void guideNext()}
					data-testid="assistant-guide-next"
				>
					{last ? text.guideDone : text.guideNext}
				</Button>
			</Group>
		</Paper>,
		document.body,
	);
}
