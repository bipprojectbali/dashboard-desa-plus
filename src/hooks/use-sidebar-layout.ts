import { useViewportSize } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import {
	isRailEligible,
	type SidebarMode,
	sidebarModeFor,
	sidebarWidthFor,
} from "@/components/layout/sidebar-layout";

/** Mode & lebar navbar desktop, mengikuti ruang panel asisten dan lebar layar; `widen` memperlebar rel secara manual. */
export function useSidebarLayout(
	userCollapsed: boolean,
	panelSpace: number,
): { mode: SidebarMode; width: number; widen: () => void; reset: () => void } {
	const { width: viewportWidth } = useViewportSize();
	const [widened, setWidened] = useState(false);
	const eligible = isRailEligible(panelSpace, viewportWidth);

	// Perlebaran manual hanya berlaku selama rel memang aktif; saat panel ditutup
	// atau layar melebar, kembali ke keadaan awal supaya panel berikutnya mulai dari rel.
	useEffect(() => {
		if (!eligible) setWidened(false);
	}, [eligible]);

	const widen = useCallback(() => setWidened(true), []);
	const reset = useCallback(() => setWidened(false), []);
	const mode = sidebarModeFor({
		panelSpace,
		viewportWidth,
		userCollapsed,
		widened,
	});
	return { mode, width: sidebarWidthFor(mode), widen, reset };
}
