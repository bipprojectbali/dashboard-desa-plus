import {
	ActionIcon,
	Alert,
	Button,
	Group,
	Text,
	Textarea,
} from "@mantine/core";
import { IconPlayerStopFilled, IconSend } from "@tabler/icons-react";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { assistantStore, setAssistantError } from "@/store/assistant";
import {
	canSend,
	fillTemplate,
	isSubmitKey,
	remainingChars,
} from "./assistant.logic";
import { useAssistantText } from "./use-assistant-access";

interface ComposerProps {
	name: string;
	maxInputChars: number;
	onSend: (text: string) => Promise<void>;
	/** Hentikan jawaban yang sedang berjalan. */
	onCancel: () => void;
}

/** Kotak input: Enter kirim, Shift+Enter baris baru, sisa karakter, error + kirim ulang, disclaimer. */
export function AssistantComposer({
	name,
	maxInputChars,
	onSend,
	onCancel,
}: ComposerProps) {
	const { pending, error, retryText } = useSnapshot(assistantStore);
	const text = useAssistantText();
	const [draft, setDraft] = useState("");
	const remaining = remainingChars(draft, maxInputChars);
	const sendable = canSend(draft, maxInputChars, pending);

	const submit = () => {
		if (!sendable) return;
		const value = draft;
		setDraft("");
		void onSend(value);
	};

	return (
		<div
			style={{
				borderTop: "1px solid var(--mantine-color-default-border)",
				padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
			}}
		>
			{error ? (
				<Alert
					color="red"
					variant="light"
					mb="xs"
					p="xs"
					withCloseButton
					onClose={() => setAssistantError(null)}
				>
					<Group justify="space-between" gap="xs" wrap="nowrap">
						<Text size="xs">{error}</Text>
						{retryText && !pending ? (
							<Button
								size="compact-xs"
								variant="light"
								color="red"
								onClick={() => void onSend(retryText)}
							>
								{text.retry}
							</Button>
						) : null}
					</Group>
				</Alert>
			) : null}
			<Group align="flex-end" gap="xs" wrap="nowrap">
				<Textarea
					value={draft}
					onChange={(e) => setDraft(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (
							isSubmitKey({
								key: e.key,
								shiftKey: e.shiftKey,
								isComposing: e.nativeEvent.isComposing,
							})
						) {
							e.preventDefault();
							submit();
						}
					}}
					placeholder={text.placeholder}
					aria-label={text.placeholder}
					autosize
					minRows={1}
					maxRows={6}
					style={{ flex: 1 }}
					error={remaining !== null && remaining < 0}
				/>
				{pending ? (
					<ActionIcon
						size="lg"
						variant="light"
						color="red"
						aria-label={text.stop}
						onClick={onCancel}
					>
						<IconPlayerStopFilled size={18} />
					</ActionIcon>
				) : (
					<ActionIcon
						size="lg"
						variant="filled"
						aria-label={text.send}
						disabled={!sendable}
						onClick={submit}
					>
						<IconSend size={18} />
					</ActionIcon>
				)}
			</Group>
			<Group justify="space-between" mt={4} gap="xs" wrap="nowrap">
				<Text size="xs" c="dimmed" style={{ flex: 1 }}>
					{fillTemplate(text.disclaimer, { name })}
				</Text>
				{remaining !== null ? (
					<Text
						size="xs"
						c={remaining < 0 ? "red" : "dimmed"}
						style={{ whiteSpace: "nowrap" }}
					>
						{fillTemplate(text.charsLeft, { n: remaining })}
					</Text>
				) : null}
			</Group>
		</div>
	);
}
