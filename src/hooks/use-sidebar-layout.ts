import { useViewportSize } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import {
	expandedState,
	INITIAL_SIDEBAR_STATE,
	isRailEligible,
	type SidebarMode,
	type SidebarState,
	sidebarModeFor,
	sidebarWidthFor,
	toggledState,
} from "@/components/layout/sidebar-layout";

export interface SidebarLayout {
	mode: SidebarMode;
	width: number;
	/** Tombol header: sembunyi → kembali, penuh → rel ikon, rel → penuh. */
	toggle: () => void;
	/** Perlebar rel (tombol di rel) menjadi sidebar penuh. */
	widen: () => void;
	/** Sembunyikan penuh untuk fullscreen/kiosk. */
	hide: () => void;
}

/** Mode & lebar navbar desktop, mengikuti pilihan user (minimize/fullscreen), ruang panel asisten, dan lebar layar. */
export function useSidebarLayout(panelSpace: number): SidebarLayout {
	const { width: viewportWidth } = useViewportSize();
	const [state, setState] = useState<SidebarState>(INITIAL_SIDEBAR_STATE);
	const eligible = isRailEligible(panelSpace, viewportWidth);

	// Perlebaran manual hanya berlaku selama rel otomatis memang aktif; saat panel
	// ditutup atau layar melebar, kembali ke keadaan awal supaya panel berikutnya mulai dari rel.
	useEffect(() => {
		if (!eligible) setState((s) => (s.widened ? { ...s, widened: false } : s));
	}, [eligible]);

	const mode = sidebarModeFor({ ...state, panelSpace, viewportWidth });
	const toggle = useCallback(
		() => setState((s) => toggledState(s, mode, eligible)),
		[mode, eligible],
	);
	const widen = useCallback(
		() => setState(expandedState(eligible)),
		[eligible],
	);
	const hide = useCallback(() => setState((s) => ({ ...s, hidden: true })), []);
	return { mode, width: sidebarWidthFor(mode), toggle, widen, hide };
}
