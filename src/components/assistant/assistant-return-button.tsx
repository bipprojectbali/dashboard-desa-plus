import { Button } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { assistantStore } from "@/store/assistant";
import {
	clearReturn,
	returnStore,
	returnToChat,
} from "@/store/assistant-return";
import { useAssistantText } from "./use-assistant-access";

/** Di bawah modal Mantine, di atas FAB (190) dan kursor penunjuk (195). */
const RETURN_Z_INDEX = 196;

/** P6: tombol "Kembali ke chat" setelah panel diperbesar ditutup sementara oleh penunjuk. */
export function AssistantReturnButton() {
	const { awaitingReturn } = useSnapshot(returnStore);
	const { open } = useSnapshot(assistantStore);
	const text = useAssistantText();

	useEffect(() => {
		if (open) clearReturn();
	}, [open]);

	if (!awaitingReturn || open) return null;
	return (
		<Button
			leftSection={<IconMessageCircle size={18} />}
			radius="xl"
			onClick={returnToChat}
			style={{
				position: "fixed",
				bottom: 24,
				right: 96,
				zIndex: RETURN_Z_INDEX,
				boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
			}}
		>
			{text.returnToChat}
		</Button>
	);
}
