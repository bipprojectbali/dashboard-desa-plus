import {
	Badge,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { AssistantMarkdown } from "@/components/assistant/assistant-markdown";
import type { VoiceLabText } from "@/locales/voice-lab";
import type { TurnState, TurnView } from "./voice-lab.types";

function stateLabel(t: VoiceLabText, state: TurnState): string {
	const map: Record<TurnState, string> = {
		listening: t.stateListening,
		transcribing: t.stateTranscribing,
		thinking: t.stateThinking,
		answering: t.stateAnswering,
		done: t.stateDone,
		interrupted: t.stateInterrupted,
		error: t.stateError,
	};
	return map[state];
}

function ClaudeText({ text }: { text: string }) {
	return text ? <AssistantMarkdown source={text} /> : <Text size="sm">…</Text>;
}

function SpokenText({ t, turn }: { t: VoiceLabText; turn: TurnView }) {
	const filler = turn.fillerChars ?? 0;
	if (!turn.spokenText) return <Text size="sm">…</Text>;
	if (filler <= 0) return <Text size="sm">{turn.spokenText}</Text>;
	return (
		<Stack gap={4}>
			<Text size="xs" c="dimmed" fs="italic" title={t.fillerLabel}>
				{t.fillerLabel}: {turn.spokenText.slice(0, filler).trim()}
			</Text>
			<Text size="sm">{turn.spokenText.slice(filler).trim() || "…"}</Text>
		</Stack>
	);
}

function TurnCard({ t, turn }: { t: VoiceLabText; turn: TurnView }) {
	const sideBySide = turn.path === "v1b";
	return (
		<Paper withBorder p="sm" radius="md">
			<Stack gap={6}>
				<Group gap="xs">
					<Badge size="sm" variant="light">
						#{turn.id} · {turn.path.toUpperCase()}
					</Badge>
					<Badge
						size="sm"
						color={turn.state === "error" ? "red" : "gray"}
						variant="outline"
					>
						{stateLabel(t, turn.state)}
					</Badge>
					{turn.actionCount > 0 && (
						<Badge size="sm" color="grape">
							{t.pointerPresent}
						</Badge>
					)}
				</Group>
				<Text size="sm">
					<b>{t.you}:</b> {turn.userText || "…"}
				</Text>
				{sideBySide ? (
					<SimpleGrid cols={{ base: 1, sm: 2 }}>
						<div>
							<Text size="xs" c="dimmed">
								{t.claudeOriginal}
							</Text>
							<ClaudeText text={turn.answerText} />
						</div>
						<div>
							<Text size="xs" c="dimmed">
								{t.gptLiveSpoken}
							</Text>
							<SpokenText t={t} turn={turn} />
						</div>
					</SimpleGrid>
				) : (
					<ClaudeText text={turn.answerText} />
				)}
				{turn.error && (
					<Text size="xs" c="red">
						{turn.error}
					</Text>
				)}
			</Stack>
		</Paper>
	);
}

export function VoiceLabConversation({
	t,
	turns,
}: {
	t: VoiceLabText;
	turns: TurnView[];
}) {
	return (
		<Stack gap="xs">
			<Title order={5}>{t.conversation}</Title>
			{turns.length === 0 ? (
				<Text size="sm" c="dimmed">
					{t.emptyConversation}
				</Text>
			) : (
				[...turns]
					.reverse()
					.map((turn) => (
						<TurnCard key={`${turn.path}-${turn.id}`} t={t} turn={turn} />
					))
			)}
		</Stack>
	);
}
