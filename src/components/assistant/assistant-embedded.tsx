import { Button, Center, Loader, Paper, Stack, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { authStore } from "@/store/auth";
import { AssistantPanelContent } from "./assistant-panel-content";
import { useAssistantAccess, useAssistantText } from "./use-assistant-access";

/** Tinggi default panel tertanam di halaman Bantuan. */
export const ASSISTANT_EMBEDDED_HEIGHT = 520;

/**
 * Panel asisten dalam mode tertanam (halaman `/bantuan` & `/admin/help`):
 * komponen isi yang sama dengan panel FAB. Tanpa akses atau asisten belum
 * aktif → keadaan kosong yang ramah, bukan error.
 */
export function AssistantEmbedded({
	height = ASSISTANT_EMBEDDED_HEIGHT,
}: {
	height?: number;
}) {
	const access = useAssistantAccess({ embedded: true });
	const text = useAssistantText();
	const dark = useIsDark();
	const { user } = useSnapshot(authStore);

	const frame = {
		height,
		display: "flex",
		flexDirection: "column" as const,
		overflow: "hidden",
		background: dark ? "#141d34" : "white",
	};

	if (access.embeddedState !== "ready" || !access.status) {
		return (
			<Paper withBorder radius="md" style={frame}>
				<Center style={{ flex: 1 }} px="lg">
					{access.embeddedState === "loading" ? (
						<Loader size="sm" />
					) : (
						<Stack align="center" gap="xs" maw={320}>
							<IconSparkles size={32} color="#2563eb" aria-hidden />
							<Text size="sm" c="dimmed" ta="center">
								{access.embeddedState === "no-access"
									? text.embedded.noAccess
									: text.embedded.inactive}
							</Text>
							{access.embeddedState === "inactive" && user?.role === "admin" ? (
								<Button
									component={Link}
									to="/admin/ai-assistant"
									size="xs"
									variant="light"
								>
									{text.embedded.openSettings}
								</Button>
							) : null}
						</Stack>
					)}
				</Center>
			</Paper>
		);
	}

	return (
		<Paper withBorder radius="md" style={frame}>
			<AssistantPanelContent
				status={access.status}
				allowed={access.allowed}
				pathname={access.pathname}
			/>
		</Paper>
	);
}
