export interface GuideBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface GuidePlacement {
	left: number;
	top: number;
	side: "below" | "above" | "right" | "left" | "pinned";
}

/** Jarak kartu dari target dan dari tepi layar. */
export const GUIDE_GAP = 14;
export const GUIDE_MARGIN = 12;

const clamp = (v: number, min: number, max: number) =>
	Math.max(min, Math.min(v, Math.max(min, max)));

/**
 * Letak kartu panduan relatif target: bawah, atas, kanan, kiri — mana yang muat
 * tanpa menutupi target dan tanpa masuk ke kolom panel (`avoidRight`). Bila tak
 * ada yang muat (target memenuhi layar), kartu dipasang di dasar layar.
 */
export function placeGuideCard(input: {
	rect: GuideBox;
	viewport: { width: number; height: number };
	card: { width: number; height: number };
	avoidRight?: number;
}): GuidePlacement {
	const { rect, viewport, card } = input;
	const usableW = viewport.width - (input.avoidRight ?? 0);
	const maxLeft = usableW - card.width - GUIDE_MARGIN;
	const maxTop = viewport.height - card.height - GUIDE_MARGIN;
	const centeredLeft = clamp(
		rect.x + rect.width / 2 - card.width / 2,
		GUIDE_MARGIN,
		maxLeft,
	);

	const below = rect.y + rect.height + GUIDE_GAP;
	if (below <= maxTop) return { left: centeredLeft, top: below, side: "below" };

	const above = rect.y - GUIDE_GAP - card.height;
	if (above >= GUIDE_MARGIN)
		return { left: centeredLeft, top: above, side: "above" };

	const sideTop = clamp(rect.y, GUIDE_MARGIN, maxTop);
	const right = rect.x + rect.width + GUIDE_GAP;
	if (right <= maxLeft) return { left: right, top: sideTop, side: "right" };

	const left = rect.x - GUIDE_GAP - card.width;
	if (left >= GUIDE_MARGIN) return { left, top: sideTop, side: "left" };

	return {
		left: clamp((usableW - card.width) / 2, GUIDE_MARGIN, maxLeft),
		top: Math.max(GUIDE_MARGIN, maxTop),
		side: "pinned",
	};
}
