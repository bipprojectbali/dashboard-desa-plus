import {
	ActionIcon,
	Button,
	CloseButton,
	Group,
	Paper,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconMicrophone,
	IconMicrophoneOff,
	IconPlayerStop,
	IconVolume,
	IconVolumeOff,
} from "@tabler/icons-react";
import type { AssistantVoiceText } from "@/locales/assistant-voice";
import type { VoiceStatus } from "@/store/assistant-voice";
import { fillTemplate } from "../assistant.logic";
import { formatClock, voiceDisabledReason } from "./voice.logic";

export interface VoiceControlsViewProps {
	t: AssistantVoiceText;
	name: string;
	status: VoiceStatus;
	supported: boolean;
	transcript: string;
	/** Sisa detik (sesi/jatah harian, mana yang lebih dulu); null = belum diketahui. */
	remaining: number | null;
	inviteExtend: boolean;
	answerMuted: boolean;
	micMuted: boolean;
	notice: string | null;
	onStart(): void;
	onStop(): void;
	onExtend(): void;
	onToggleAnswer(): void;
	onToggleMic(): void;
	onDismissNotice(): void;
}

const STATUS_COLOR: Record<Exclude<VoiceStatus, "off">, string> = {
	connecting: "gray",
	ready: "teal",
	listening: "blue",
	answering: "violet",
};

function Notice({
	text,
	label,
	onClose,
}: {
	text: string;
	label: string;
	onClose(): void;
}) {
	return (
		<Group gap={4} wrap="nowrap" align="flex-start" role="status">
			<Text size="xs" c="orange" style={{ flex: 1 }}>
				{text}
			</Text>
			<CloseButton size="xs" aria-label={label} onClick={onClose} />
		</Group>
	);
}

/** Baris mode suara di atas composer: tombol On, atau status + kontrol saat aktif. */
export function VoiceControlsView(p: VoiceControlsViewProps) {
	const { t } = p;
	if (p.status === "off") {
		const reason = voiceDisabledReason(p.supported, t);
		const label = fillTemplate(t.start, { name: p.name });
		return (
			<Stack gap={4} px="sm" pt={6}>
				<Tooltip label={reason} disabled={!reason} withArrow multiline w={240}>
					<Button
						size="xs"
						variant="light"
						leftSection={<IconMicrophone size={14} />}
						disabled={!!reason}
						onClick={p.onStart}
						aria-label={label}
						data-voice-start
					>
						{label}
					</Button>
				</Tooltip>
				{reason ? (
					<Text size="xs" c="dimmed">
						{reason}
					</Text>
				) : null}
				{p.notice ? (
					<Notice
						text={p.notice}
						label={t.dismiss}
						onClose={p.onDismissNotice}
					/>
				) : null}
			</Stack>
		);
	}

	const MicIcon = p.micMuted ? IconMicrophoneOff : IconMicrophone;
	return (
		<Paper withBorder radius="md" mx="sm" mt={6} px="sm" py={6}>
			<Stack gap={4}>
				<Group gap={6} wrap="nowrap" justify="space-between">
					<Group gap={6} wrap="nowrap">
						<MicIcon
							size={16}
							color={p.micMuted ? "gray" : "red"}
							aria-label={p.micMuted ? t.unmuteMic : t.micActive}
							data-voice-mic-indicator
						/>
						<Text
							size="sm"
							fw={600}
							c={STATUS_COLOR[p.status]}
							aria-live="polite"
							data-voice-status={p.status}
						>
							{t.status[p.status]}
						</Text>
						{p.remaining !== null ? (
							<Text size="xs" c="dimmed" data-voice-remaining>
								{fillTemplate(t.remaining, { waktu: formatClock(p.remaining) })}
							</Text>
						) : null}
					</Group>
					<Group gap={2} wrap="nowrap">
						<Tooltip label={p.answerMuted ? t.unmuteAnswer : t.muteAnswer}>
							<ActionIcon
								variant="subtle"
								color="gray"
								aria-label={p.answerMuted ? t.unmuteAnswer : t.muteAnswer}
								aria-pressed={p.answerMuted}
								onClick={p.onToggleAnswer}
							>
								{p.answerMuted ? (
									<IconVolumeOff size={16} />
								) : (
									<IconVolume size={16} />
								)}
							</ActionIcon>
						</Tooltip>
						<Tooltip label={p.micMuted ? t.unmuteMic : t.muteMic}>
							<ActionIcon
								variant="subtle"
								color="gray"
								aria-label={p.micMuted ? t.unmuteMic : t.muteMic}
								aria-pressed={p.micMuted}
								onClick={p.onToggleMic}
							>
								<MicIcon size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t.stop}>
							<ActionIcon
								variant="light"
								color="red"
								aria-label={t.stop}
								onClick={p.onStop}
								data-voice-stop
							>
								<IconPlayerStop size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
				{p.transcript ? (
					<Text size="xs" fs="italic" c="dimmed" lineClamp={2}>
						{p.transcript}
					</Text>
				) : null}
				{p.inviteExtend ? (
					<Group gap={6} wrap="nowrap" justify="space-between">
						<Text size="xs">{t.extendInvite}</Text>
						<Button size="compact-xs" variant="light" onClick={p.onExtend}>
							{t.extend}
						</Button>
					</Group>
				) : null}
				{p.notice ? (
					<Notice
						text={p.notice}
						label={t.dismiss}
						onClose={p.onDismissNotice}
					/>
				) : null}
			</Stack>
		</Paper>
	);
}
