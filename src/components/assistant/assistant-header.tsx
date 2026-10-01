import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import {
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconMenu2,
	IconMessagePlus,
	IconSparkles,
	IconX,
} from "@tabler/icons-react";
import { useSnapshot } from "valtio";
import {
	assistantStore,
	setAssistantView,
	startNewConversation,
	toggleMaximized,
} from "@/store/assistant";
import { useAssistantText } from "./use-assistant-access";

/**
 * Header panel: nama asisten dari config, badge Beta, ☰ / percakapan baru /
 * perbesar / tutup. Mode tertanam (halaman Bantuan) tanpa perbesar & tutup.
 */
export function AssistantHeader({
	name,
	onClose,
}: {
	name: string;
	/** Tidak diisi = mode tertanam. */
	onClose?: () => void;
}) {
	const { maximized, view } = useSnapshot(assistantStore);
	const text = useAssistantText();

	const icon = (
		label: string,
		onClick: () => void,
		child: React.ReactNode,
		pressed?: boolean,
	) => (
		<Tooltip label={label} withArrow>
			<ActionIcon
				variant={pressed ? "light" : "subtle"}
				color="gray"
				aria-label={label}
				aria-pressed={pressed}
				onClick={onClick}
			>
				{child}
			</ActionIcon>
		</Tooltip>
	);

	return (
		<Group
			justify="space-between"
			wrap="nowrap"
			px="md"
			py="sm"
			style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
		>
			<Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
				<IconSparkles size={20} color="#2563eb" aria-hidden />
				<Text fw={700} truncate>
					{name}
				</Text>
				<Badge size="xs" variant="light">
					{text.beta}
				</Badge>
			</Group>
			<Group gap={4} wrap="nowrap">
				{icon(
					text.conversations,
					() => setAssistantView(view === "list" ? "chat" : "list"),
					<IconMenu2 size={18} />,
					view === "list",
				)}
				{icon(
					text.newConversation,
					startNewConversation,
					<IconMessagePlus size={18} />,
				)}
				{onClose
					? icon(
							maximized ? text.restore : text.maximize,
							toggleMaximized,
							maximized ? (
								<IconArrowsMinimize size={18} />
							) : (
								<IconArrowsMaximize size={18} />
							),
						)
					: null}
				{onClose ? icon(text.close, onClose, <IconX size={18} />) : null}
			</Group>
		</Group>
	);
}
