import { Drawer } from "@mantine/core";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { assistantStore } from "@/store/assistant";
import type { AssistantStatusDto } from "@/types/ai-assistant-chat";
import { ASSISTANT_PANEL_WIDTH, assistantPanelStyles } from "./assistant.logic";
import { AssistantComposer } from "./assistant-composer";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantHeader } from "./assistant-header";
import { AssistantMessageList } from "./assistant-message-list";
import { useAssistantChat } from "./use-assistant-chat";

interface AssistantPanelProps {
	status: AssistantStatusDto;
	allowed: readonly string[];
	pathname: string;
	onClose: () => void;
}

/**
 * Panel samping "Tanya AI" (Drawer kanan, tanpa overlay agar halaman tetap
 * terlihat). Dua mode desktop: normal & perbesar (lebar penuh). Tetap
 * ter-mount saat ditutup; percakapan ada di assistantStore.
 */
export function AssistantPanel({
	status,
	allowed,
	pathname,
	onClose,
}: AssistantPanelProps) {
	const { open, maximized, view } = useSnapshot(assistantStore);
	const dark = useIsDark();
	const chat = useAssistantChat(status.maxInputChars);

	return (
		<Drawer.Root
			opened={open}
			onClose={onClose}
			position="right"
			size={maximized ? "100%" : ASSISTANT_PANEL_WIDTH}
			keepMounted
			lockScroll={false}
			trapFocus={false}
			zIndex={200}
			// Gaya lewat `styles`, BUKAN prop `style` di Drawer.Content: Mantine 8
			// meneruskan `style` itu juga ke pembungkus `inner` selayar penuh
			// (latar gelap menutupi halaman, panel turun ke kiri bawah).
			styles={assistantPanelStyles(dark)}
		>
			<Drawer.Content aria-label={status.assistantName}>
				<AssistantHeader name={status.assistantName} onClose={onClose} />
				<Drawer.Body>
					{view === "list" ? (
						<AssistantConversationList onOpen={chat.openConversation} />
					) : (
						<>
							<AssistantMessageList
								name={status.assistantName}
								allowed={allowed}
								pathname={pathname}
								onAsk={chat.send}
								onLoadOlder={chat.loadOlder}
							/>
							<AssistantComposer
								name={status.assistantName}
								maxInputChars={status.maxInputChars}
								onSend={chat.send}
							/>
						</>
					)}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
