import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import type { AssistantVoiceText } from "@/locales/assistant-voice";
import { fillTemplate } from "../assistant.logic";

/**
 * Persetujuan mikrofon sekali per user (disimpan di server): mikrofon aktif,
 * suara dikirim ke OpenAI, suara jawaban dibuat AI.
 */
export function VoiceConsentBanner({
	t,
	name,
	onAccept,
	onDecline,
}: {
	t: AssistantVoiceText;
	name: string;
	onAccept(): void;
	onDecline(): void;
}) {
	return (
		<Paper
			withBorder
			radius="md"
			mx="sm"
			mt={6}
			p="sm"
			role="dialog"
			aria-label={t.consent.title}
			data-voice-consent
		>
			<Stack gap={6}>
				<Group gap={6} wrap="nowrap">
					<IconMicrophone size={16} />
					<Text size="sm" fw={600}>
						{t.consent.title}
					</Text>
				</Group>
				<Text size="xs">{fillTemplate(t.consent.body, { name })}</Text>
				<Group gap={6} justify="flex-end">
					<Button size="compact-xs" variant="subtle" onClick={onDecline}>
						{t.consent.decline}
					</Button>
					<Button
						size="compact-xs"
						onClick={onAccept}
						data-voice-consent-accept
					>
						{t.consent.accept}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}
