import {
	ActionIcon,
	Alert,
	Container,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconInfoCircle,
	IconRefresh,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { ProviderCard } from "@/components/admin/ai-assistant/provider-card";
import { SettingsSection } from "@/components/admin/ai-assistant/settings-section";
import { TodaySummary } from "@/components/admin/ai-assistant/today-summary";
import { useAiAssistantAdmin } from "@/components/admin/ai-assistant/use-ai-assistant-admin";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/ai-assistant")({
	beforeLoad: protectedRouteMiddleware,
	component: AiAssistantAdminPage,
});

function AiAssistantAdminPage() {
	const {
		overview,
		loading,
		error,
		unavailable,
		refresh,
		applySettings,
		applyProvider,
	} = useAiAssistantAdmin();
	const disabled = loading || unavailable;

	return (
		<Container size="xl" py="xl">
			<Stack gap="lg">
				<Group justify="space-between" align="flex-start">
					<Stack gap={2}>
						<Title order={2}>AI Assistant</Title>
						<Text size="sm" c="dimmed">
							Nama, saklar, batas pemakaian, dan kredensial per fitur (Chat,
							Penunjuk, Suara).
						</Text>
					</Stack>
					<Tooltip label="Muat ulang">
						<ActionIcon
							variant="light"
							onClick={refresh}
							loading={loading}
							aria-label="Muat ulang"
						>
							<IconRefresh size={18} />
						</ActionIcon>
					</Tooltip>
				</Group>

				{unavailable && (
					<Alert color="blue" icon={<IconInfoCircle size={16} />}>
						Endpoint admin AI Assistant tidak terjangkau dari server ini. Form
						menampilkan nilai default dan belum bisa disimpan.
					</Alert>
				)}
				{error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{error}
					</Alert>
				)}
				{!unavailable && !loading && !overview.cryptoConfigured && (
					<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
						AI_CREDENTIALS_KEY belum diset atau tidak valid di server. API key
						tidak bisa disimpan sampai env ini diisi.
					</Alert>
				)}

				{loading ? (
					<Skeleton height={320} radius="md" />
				) : (
					<>
						<TodaySummary today={overview.today} />
						<SettingsSection
							settings={overview.settings}
							kioskCandidates={overview.kioskCandidates}
							disabled={disabled}
							onSaved={applySettings}
						/>
						<Title order={4}>Kredensial per fitur</Title>
						{overview.providers.map((slot) => (
							<ProviderCard
								key={slot.feature}
								slot={slot}
								disabled={disabled}
								cryptoConfigured={overview.cryptoConfigured}
								onSaved={applyProvider}
							/>
						))}
					</>
				)}
			</Stack>
		</Container>
	);
}
