import { Drawer } from "@mantine/core";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { assistantStore } from "@/store/assistant";
import {
	ASSISTANT_HEADER_HEIGHT,
	ASSISTANT_PANEL_WIDTH,
	assistantPanelStyles,
} from "./assistant-panel.styles";
import {
	AssistantPanelContent,
	type AssistantPanelContentProps,
} from "./assistant-panel-content";

/**
 * Panel samping "Tanya AI" (Drawer kanan, tanpa overlay agar halaman tetap
 * terlihat; halaman bergeser memberi ruang, lihat use-assistant-space). Dua
 * mode desktop: normal & perbesar (lebar penuh). Tetap ter-mount saat
 * ditutup; percakapan ada di assistantStore.
 */
export function AssistantPanel({
	withHeader = false,
	...props
}: AssistantPanelContentProps & {
	onClose: () => void;
	/** Halaman punya header AppShell: panel dimulai di bawahnya. */
	withHeader?: boolean;
}) {
	const { open, maximized } = useSnapshot(assistantStore);
	const dark = useIsDark();

	return (
		<Drawer.Root
			opened={open}
			onClose={props.onClose}
			position="right"
			size={maximized ? "100%" : ASSISTANT_PANEL_WIDTH}
			keepMounted
			lockScroll={false}
			trapFocus={false}
			zIndex={200}
			// Gaya lewat `styles`, BUKAN prop `style` di Drawer.Content: Mantine 8
			// meneruskan `style` itu juga ke pembungkus `inner` selayar penuh
			// (latar gelap menutupi halaman, panel turun ke kiri bawah).
			styles={assistantPanelStyles(
				dark,
				withHeader ? ASSISTANT_HEADER_HEIGHT : 0,
			)}
		>
			<Drawer.Content aria-label={props.status.assistantName}>
				<AssistantPanelContent {...props} />
			</Drawer.Content>
		</Drawer.Root>
	);
}
