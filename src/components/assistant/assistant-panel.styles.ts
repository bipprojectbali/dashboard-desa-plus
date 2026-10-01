import type { CSSProperties } from "react";

/** Ukuran & gaya tata letak panel asisten (Drawer FAB, mode tertanam, ruang di /wall). */

/** Lebar panel mode normal; /wall memberi ruang selebar ini agar panel NOC tidak tertutup. */
export const ASSISTANT_PANEL_WIDTH = 440;

/**
 * Gaya Drawer panel (`styles` Mantine). Hanya `content` (panel); `inner`
 * (pembungkus fixed selayar penuh) sengaja tidak diberi gaya.
 */
export function assistantPanelStyles(
	dark: boolean,
): Record<"content", CSSProperties> {
	return {
		content: {
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
