import {
	Alert,
	Anchor,
	Code,
	Container,
	Grid,
	Paper,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useSnapshot } from "valtio";
import { voiceLabTexts } from "@/locales/voice-lab";
import { i18nStore } from "@/store/i18n";
import { isSupportedBrowser } from "../voice/voice-devices";
import { useVoiceLab } from "./use-voice-lab";
import { VoiceLabControls } from "./voice-lab-controls";
import { VoiceLabConversation } from "./voice-lab-conversation";
import { VoiceLabDeviceTest } from "./voice-lab-device-test";
import { VoiceLabMetrics } from "./voice-lab-metrics";
import { VoiceLabSettingsPanel } from "./voice-lab-settings";

/** Halaman uji suara S0 (admin saja, sekali pakai). */
export function VoiceLabPage() {
	const { lang } = useSnapshot(i18nStore);
	const t = voiceLabTexts[lang];
	const lab = useVoiceLab();
	const loading = lab.config === null && lab.loadError === null;

	return (
		<Container size="xl" py="xl">
			<Stack gap="md">
				<Stack gap={2}>
					<Anchor component={Link} to="/admin/ai-assistant" size="sm">
						← {t.backToSettings}
					</Anchor>
					<Title order={2}>{t.title}</Title>
					<Text size="sm" c="dimmed">
						{t.subtitle}
					</Text>
				</Stack>
				{!isSupportedBrowser() && (
					<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
						{t.unsupportedBrowser}
					</Alert>
				)}
				<Alert color="blue" icon={<IconInfoCircle size={16} />}>
					{t.quotaNote}
				</Alert>
				{lab.loadError && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{t.loadFailed}: {lab.loadError}
					</Alert>
				)}
				{lab.config && !lab.config.slotReady && (
					<Alert
						color="red"
						title={t.slotNotReady}
						icon={<IconAlertCircle size={16} />}
					>
						{lab.config.slotError?.error}
					</Alert>
				)}
				{lab.error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{lab.error}
					</Alert>
				)}
				{loading ? (
					<Skeleton height={240} radius="md" />
				) : (
					<Grid>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<Stack gap="md">
								<VoiceLabControls
									t={t}
									path={lab.path}
									onPath={lab.setPath}
									status={lab.status}
									remaining={lab.remaining}
									autoOff={lab.autoOff}
									slotReady={lab.config?.slotReady ?? false}
									levelBus={lab.levelBus}
									onStart={lab.start}
									onStop={() => lab.stop()}
									onCommit={lab.commit}
								/>
								<VoiceLabConversation t={t} turns={lab.turns} />
								<VoiceLabMetrics
									t={t}
									metrics={lab.metrics}
									exportData={lab.exportData}
									onClear={lab.clearMetrics}
								/>
							</Stack>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<Stack gap="md">
								<VoiceLabSettingsPanel
									t={t}
									config={lab.config}
									settings={lab.settings}
									disabled={lab.running}
									onChange={lab.update}
								/>
								<VoiceLabDeviceTest
									t={t}
									settings={lab.settings}
									sessionRunning={lab.running}
								/>
								<Paper withBorder p="md" radius="md">
									<Title order={6} mb="xs">
										{t.logs}
									</Title>
									<ScrollArea h={160}>
										<Code block fz="xs">
											{lab.logs.join("\n") || "—"}
										</Code>
									</ScrollArea>
								</Paper>
							</Stack>
						</Grid.Col>
					</Grid>
				)}
			</Stack>
		</Container>
	);
}
