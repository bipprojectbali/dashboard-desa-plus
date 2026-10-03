import { Table } from "@mantine/core";
import { useMemo } from "react";
import type { VoiceLabText } from "@/locales/voice-lab";
import {
	METRIC_KEYS,
	type MetricKey,
	MODE_GROUPS,
	type ModeGroup,
	summarizeByMode,
	type TurnMetrics,
} from "./voice-lab.stats";

export const fmtMs = (v: number | null) =>
	v === null ? "—" : `${Math.round(v)} ms`;
export const fmtScore = (v: number | null) =>
	v === null ? "—" : `${Math.round(v * 100)}%`;

export function metricLabel(t: VoiceLabText, key: MetricKey): string {
	return {
		transcriptMs: t.metricTranscript,
		firstTokenMs: t.metricFirstToken,
		firstSentenceSentMs: t.metricFirstSentence,
		firstAudioMs: t.metricFirstAudio,
		answerAudioMs: t.metricAnswerAudio,
	}[key];
}

function modeLabel(t: VoiceLabText, mode: ModeGroup): string {
	return {
		v2: t.modeV2,
		"v1b-whole": t.modeV1bWhole,
		"v1b-sentence": t.modeV1bSentence,
	}[mode];
}

/** Ringkasan p50/p95 per jalur+mode kirim (V2, V1-B utuh, V1-B per kalimat), termasuk skor cocok. */
export function VoiceLabMetricsSummary({
	t,
	metrics,
}: {
	t: VoiceLabText;
	metrics: TurnMetrics[];
}) {
	const summary = useMemo(() => summarizeByMode(metrics), [metrics]);
	return (
		<Table.ScrollContainer minWidth={560}>
			<Table withTableBorder fz="xs">
				<Table.Thead>
					<Table.Tr>
						<Table.Th>{t.modeCol}</Table.Th>
						<Table.Th />
						{METRIC_KEYS.map((k) => (
							<Table.Th key={k}>{metricLabel(t, k)} (p50 / p95)</Table.Th>
						))}
						<Table.Th>{t.metricMatch} (p50 / p95)</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{MODE_GROUPS.map((mode) => {
						const s = summary[mode];
						return (
							<Table.Tr key={mode}>
								<Table.Td>{modeLabel(t, mode)}</Table.Td>
								<Table.Td>
									{t.count}: {s.firstAudioMs.count}
								</Table.Td>
								{METRIC_KEYS.map((k) => (
									<Table.Td key={k}>
										{fmtMs(s[k].p50)} / {fmtMs(s[k].p95)}
									</Table.Td>
								))}
								<Table.Td>
									{fmtScore(s.matchScore.p50)} / {fmtScore(s.matchScore.p95)}
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
}
