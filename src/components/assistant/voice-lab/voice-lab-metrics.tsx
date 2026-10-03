import {
	Alert,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { useState } from "react";
import type { VoiceLabText } from "@/locales/voice-lab";
import type { VoiceLabExport } from "./voice-lab.export";
import { METRIC_KEYS, type TurnMetrics } from "./voice-lab.stats";
import {
	fmtMs,
	fmtScore,
	metricLabel,
	VoiceLabMetricsSummary,
} from "./voice-lab-metrics-summary";

const sendModeLabel = (t: VoiceLabText, m: TurnMetrics) =>
	m.sendMode === "sentence"
		? t.sendSentence
		: m.sendMode === "whole"
			? t.sendWhole
			: "—";

interface Props {
	t: VoiceLabText;
	metrics: TurnMetrics[];
	exportData: (includeText: boolean) => VoiceLabExport;
	onClear: () => void;
}

export function VoiceLabMetrics({ t, metrics, exportData, onClear }: Props) {
	const [includeText, setIncludeText] = useState(false);
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState<string | null>(null);

	const json = () => JSON.stringify(exportData(includeText), null, 2);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(json());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			setCopyError((err as Error).message);
		}
	};
	const download = () => {
		const url = URL.createObjectURL(
			new Blob([json()], { type: "application/json" }),
		);
		const a = document.createElement("a");
		a.href = url;
		a.download = `voice-lab-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={5}>{t.metrics}</Title>
					<Button
						size="xs"
						variant="subtle"
						color="red"
						onClick={onClear}
						disabled={metrics.length === 0}
					>
						{t.clearMetrics}
					</Button>
				</Group>
				{metrics.length === 0 ? (
					<Text size="sm" c="dimmed">
						{t.noTurns}
					</Text>
				) : (
					<>
						<Table.ScrollContainer minWidth={560}>
							<Table striped withTableBorder fz="xs">
								<Table.Thead>
									<Table.Tr>
										<Table.Th>{t.turnCol}</Table.Th>
										<Table.Th>{t.pathCol}</Table.Th>
										<Table.Th>{t.modeCol}</Table.Th>
										<Table.Th>{t.metricEnd}</Table.Th>
										{METRIC_KEYS.map((k) => (
											<Table.Th key={k}>{metricLabel(t, k)}</Table.Th>
										))}
										<Table.Th>{t.metricOverlap}</Table.Th>
										<Table.Th>{t.metricMatch}</Table.Th>
										<Table.Th>{t.numbersChangedCol}</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{metrics.map((m) => (
										<Table.Tr key={`${m.path}-${m.id}`}>
											<Table.Td>{m.id}</Table.Td>
											<Table.Td>{m.path.toUpperCase()}</Table.Td>
											<Table.Td>{sendModeLabel(t, m)}</Table.Td>
											<Table.Td>{m.endMethod}</Table.Td>
											{METRIC_KEYS.map((k) => (
												<Table.Td key={k}>{fmtMs(m[k])}</Table.Td>
											))}
											<Table.Td>
												{m.overlap === null ? "—" : m.overlap.toFixed(2)}
											</Table.Td>
											<Table.Td>{fmtScore(m.matchScore)}</Table.Td>
											<Table.Td>
												{m.numbersChanged === null
													? "—"
													: m.numbersChanged
														? "⚠️"
														: "✓"}
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<VoiceLabMetricsSummary t={t} metrics={metrics} />
					</>
				)}
				<Checkbox
					label={t.includeText}
					checked={includeText}
					onChange={(e) => setIncludeText(e.currentTarget.checked)}
				/>
				{includeText && <Alert color="yellow">{t.includeTextWarning}</Alert>}
				<Group>
					<Button
						size="xs"
						variant="light"
						onClick={copy}
						disabled={metrics.length === 0}
					>
						{copied ? t.copied : t.copyJson}
					</Button>
					<Button
						size="xs"
						variant="light"
						onClick={download}
						disabled={metrics.length === 0}
					>
						{t.downloadJson}
					</Button>
				</Group>
				{copyError && (
					<Text size="xs" c="red">
						{copyError}
					</Text>
				)}
			</Stack>
		</Paper>
	);
}
