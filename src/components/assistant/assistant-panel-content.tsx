import { Box } from "@mantine/core";
import { useSnapshot } from "valtio";
import { assistantStore } from "@/store/assistant";
import type { AssistantStatusDto } from "@/types/ai-assistant-chat";
import { AssistantComposer } from "./assistant-composer";
import { AssistantConversationList } from "./assistant-conversation-list";
import { AssistantHeader } from "./assistant-header";
import { AssistantMessageList } from "./assistant-message-list";
import { PANEL_BODY_STYLE } from "./assistant-panel.styles";
import { useAssistantChat } from "./use-assistant-chat";
import { AssistantVoicePanel } from "./voice/assistant-voice-panel";

export interface AssistantPanelContentProps {
	status: AssistantStatusDto;
	allowed: readonly string[];
	pathname: string;
	/** Tidak diisi = mode tertanam (tanpa perbesar & tutup). */
	onClose?: () => void;
	/** Tampilkan mode suara (tidak di /wall). */
	voice?: boolean;
}

/**
 * Isi panel asisten yang sama untuk Drawer (FAB) dan mode tertanam (halaman
 * Bantuan): header, lalu daftar percakapan atau pesan + composer. State
 * percakapan bersama di assistantStore.
 */
export function AssistantPanelContent({
	status,
	allowed,
	pathname,
	onClose,
	voice = true,
}: AssistantPanelContentProps) {
	const { view } = useSnapshot(assistantStore);
	const chat = useAssistantChat(status.maxInputChars);

	return (
		<>
			<AssistantHeader name={status.assistantName} onClose={onClose} />
			<Box style={PANEL_BODY_STYLE}>
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
							onPointSource={chat.pointToSource}
						/>
						{voice ? <AssistantVoicePanel status={status} /> : null}
						<AssistantComposer
							name={status.assistantName}
							maxInputChars={status.maxInputChars}
							onSend={chat.send}
							onCancel={chat.cancel}
						/>
					</>
				)}
			</Box>
		</>
	);
}
