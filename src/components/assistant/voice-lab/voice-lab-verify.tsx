import { Badge, Group, Stack, Text } from "@mantine/core";
import type { VoiceLabText } from "@/locales/voice-lab";
import type { TurnState, TurnView } from "./voice-lab.types";

const ACTIVE_STATES: readonly TurnState[] = [
	"listening",
	"transcribing",
	"thinking",
	"answering",
];

function List({ label, items }: { label: string; items: string[] }) {
	if (items.length === 0) return null;
	return (
		<Text size="xs">
			<b>{label}:</b> {items.join(", ")}
		</Text>
	);
}

/** Hasil pencocokan otomatis satu giliran V1-B: skor angka, angka/nama yang berbeda, ⚠️ bila angka berubah. */
export function VoiceLabVerify({
	t,
	turn,
}: {
	t: VoiceLabText;
	turn: TurnView;
}) {
	const v = turn.verify;
	const mode =
		turn.sendMode === "sentence"
			? `${t.sendSentence} · ${turn.sentencesSent ?? 0} ${t.chunksSent}`
			: turn.sendMode === "whole"
				? t.sendWhole
				: null;
	let body: React.ReactNode;
	if (v) {
		body = (
			<Stack gap={2}>
				<Group gap="xs">
					{v.score === null ? (
						<Badge size="sm" color="gray" variant="light">
							{t.verifyNoNumbers}
						</Badge>
					) : (
						<Badge
							size="sm"
							color={v.numbersChanged ? "red" : "green"}
							variant="light"
						>
							{t.verifyNumbers} {v.numbersMatched}/{v.numbersTotal}
						</Badge>
					)}
					{v.numbersChanged && (
						<Badge size="sm" color="red">
							⚠️ {t.verifyChanged}
						</Badge>
					)}
				</Group>
				<List label={t.verifyMissing} items={v.missingNumbers} />
				<List label={t.verifyExtra} items={v.extraNumbers} />
				<List label={t.verifyTerms} items={v.missingTerms} />
				<List
					label={t.verifyConversions}
					items={v.conversions.map(
						(c) => `${c.spoken} ≈ ${c.original} ${c.heard ? "✓" : "✗"}`,
					)}
				/>
			</Stack>
		);
	} else if (!turn.answerText) {
		body = null;
	} else if (ACTIVE_STATES.includes(turn.state)) {
		body = (
			<Text size="xs" c="dimmed">
				{t.verifyPending}
			</Text>
		);
	} else {
		body = (
			<Text size="xs" c="dimmed">
				{t.verifySkipped}
			</Text>
		);
	}
	if (!mode && !body) return null;
	return (
		<Stack gap={4}>
			{mode && (
				<Text size="xs" c="dimmed">
					{t.sendMode}: {mode}
				</Text>
			)}
			{body}
		</Stack>
	);
}
