import type { CSSProperties } from "react";

/** Ukuran & gaya tata letak panel asisten (Drawer FAB, mode tertanam, ruang di halaman). */

/** Lebar panel mode normal; halaman & /wall memberi ruang selebar ini agar kontennya tidak tertutup. */
export const ASSISTANT_PANEL_WIDTH = 440;

/** Tinggi header AppShell (MainLayout & /profile); panel halaman ber-header dimulai di bawahnya. */
export const ASSISTANT_HEADER_HEIGHT = 60;

/**
 * Gaya Drawer panel (`styles` Mantine). Hanya `content` (panel); `inner`
 * (pembungkus fixed selayar penuh) sengaja tidak diberi gaya. `topOffset`
 * menurunkan panel agar header halaman tetap terlihat.
 */
export function assistantPanelStyles(
	dark: boolean,
	topOffset = 0,
): Record<"content", CSSProperties> {
	return {
		content: {
			...(topOffset > 0
				? { marginTop: topOffset, height: `calc(100% - ${topOffset}px)` }
				: {}),
			display: "flex",
			flexDirection: "column",
			overflow: "hidden",
			background: dark ? "#141d34" : "white",
			borderLeft: `1px solid ${dark ? "#26324f" : "#dbe3ee"}`,
		},
	};
}

/** Isi panel di bawah header: mengisi sisa tinggi; pesan bergulir, composer di bawah. */
export const PANEL_BODY_STYLE: CSSProperties = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
};
