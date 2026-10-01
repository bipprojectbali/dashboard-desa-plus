import {
	ActionIcon,
	Box,
	Button,
	CopyButton,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { assistantStore, type ChatBubble } from "@/store/assistant";
import { i18nStore } from "@/store/i18n";
import {
	fillTemplate,
	sourceLabels,
	streamStatusLabel,
	toAssistantLang,
} from "./assistant.logic";
import { suggestionsFor } from "./assistant-suggestions";
import { useAssistantText } from "./use-assistant-access";

interface MessageListProps {
	name: string;
	allowed: readonly string[];
	pathname: string;
	onAsk: (text: string) => void;
	onLoadOlder: () => void;
}

const GREETING_ID = "greeting";
/** Bubble teks yang sedang mengalir — belum final, jadi tanpa tombol salin. */
const STREAMING_ID = "streaming";

function Bubble({ bubble }: { bubble: ChatBubble }) {
	const dark = useIsDark();
	const text = useAssistantText();
	const mine = bubble.role === "user";
	const sources = sourceLabels(bubble.toolsUsed, text);
	const bg = mine
		? dark
			? "#1d4ed8"
			: "#2563eb"
		: dark
			? "#1f2a44"
			: "#f1f5f9";

	return (
		<Box
			style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "85%" }}
		>
			<Paper
				px="sm"
				py={8}
				radius="md"
				style={{
					background: bg,
					color: mine ? "white" : undefined,
					opacity: bubble.failed ? 0.6 : 1,
				}}
			>
				<Text
					size="sm"
					style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
				>
					{bubble.content}
				</Text>
			</Paper>
			<Group gap={6} mt={2} justify={mine ? "flex-end" : "flex-start"}>
				{bubble.failed ? (
					<Text size="xs" c="red">
						{text.failedMessage}
					</Text>
				) : null}
				{sources.length > 0 ? (
					<Text size="xs" c="dimmed">
						{text.source}: {sources.join(", ")}
					</Text>
				) : null}
				{!mine && bubble.id !== GREETING_ID && bubble.id !== STREAMING_ID ? (
					<CopyButton value={bubble.content}>
						{({ copied, copy }) => (
							<Tooltip label={copied ? text.copied : text.copy} withArrow>
								<ActionIcon
									size="xs"
									variant="subtle"
									color="gray"
									aria-label={text.copy}
									onClick={copy}
								>
									{copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
								</ActionIcon>
							</Tooltip>
						)}
					</CopyButton>
				) : null}
			</Group>
		</Box>
	);
}

/** Sapaan + saran (percakapan kosong), bubble pesan, indikator berpikir; aria-live untuk pembaca layar. */
export function AssistantMessageList({
	name,
	allowed,
	pathname,
	onAsk,
	onLoadOlder,
}: MessageListProps) {
	const { messages, pending, olderCursor, streamStatus, streamingText } =
		useSnapshot(assistantStore);
	const { lang } = useSnapshot(i18nStore);
	const text = useAssistantText();
	const bottomRef = useRef<HTMLDivElement>(null);
	const suggestions =
		messages.length === 0
			? suggestionsFor(pathname, allowed, toAssistantLang(lang))
			: [];

	// biome-ignore lint/correctness/useExhaustiveDependencies: gulir saat jumlah pesan/pending berubah
	useEffect(() => {
		bottomRef.current?.scrollIntoView?.({ block: "end" });
	}, [messages.length, pending, streamingText]);

	return (
		<ScrollArea style={{ flex: 1, minHeight: 0 }} px="md" py="sm">
			<Stack gap="sm" aria-live="polite" aria-relevant="additions">
				{olderCursor ? (
					<Button size="xs" variant="subtle" onClick={onLoadOlder}>
						{text.loadOlder}
					</Button>
				) : null}
				{messages.length === 0 ? (
					<Bubble
						bubble={{
							id: GREETING_ID,
							role: "assistant",
							content: fillTemplate(text.greeting, { name }),
							toolsUsed: [],
						}}
					/>
				) : null}
				{messages.map((m) => (
					<Bubble key={m.id} bubble={m} />
				))}
				{pending && streamingText ? (
					<Bubble
						bubble={{
							id: STREAMING_ID,
							role: "assistant",
							content: streamingText,
							toolsUsed: [],
						}}
					/>
				) : null}
				{pending && !streamingText ? (
					<Group gap="xs">
						<Loader size="xs" type="dots" />
						<Text size="xs" c="dimmed">
							{streamStatus
								? streamStatusLabel(streamStatus, text)
								: text.thinking}
						</Text>
					</Group>
				) : null}
				{suggestions.length > 0 ? (
					<Stack gap={6} align="flex-start">
						{suggestions.map((s) => (
							<Button
								key={s}
								size="xs"
								variant="light"
								radius="xl"
								onClick={() => onAsk(s)}
							>
								{s}
							</Button>
						))}
					</Stack>
				) : null}
				<div ref={bottomRef} />
			</Stack>
		</ScrollArea>
	);
}
