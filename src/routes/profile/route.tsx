import { ActionIcon, AppShell, Box, Button, Group, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { IconChevronLeft } from "@tabler/icons-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useSnapshot } from "valtio";
import { AssistantFab } from "@/components/assistant/assistant-fab";
import {
	assistantAsideConfig,
	useAssistantSpace,
} from "@/components/assistant/use-assistant-space";
import { useIsDark } from "@/hooks/useIsDark";
import { i18nStore } from "@/store/i18n";

export const Route = createFileRoute("/profile")({
	component: ProfileLayout,
});

function ProfileLayout() {
	const navigate = useNavigate();
	const dark = useIsDark();
	const assistantSpace = useAssistantSpace();
	const reducedMotion = useReducedMotion();
	const { animasiTransisi } = useSnapshot(i18nStore);

	return (
		<AppShell
			header={{ height: 60 }}
			aside={assistantAsideConfig(assistantSpace)}
			transitionDuration={animasiTransisi && !reducedMotion ? 200 : 0}
			padding="md"
			styles={{
				main: {
					backgroundColor: dark
						? "var(--mantine-color-dark-8)"
						: "var(--mantine-color-gray-0)",
				},
			}}
		>
			<AppShell.Header
				style={{
					borderBottom: "1px solid var(--mantine-color-default-border)",
					backgroundColor: dark ? "var(--mantine-color-dark-7)" : "white",
					paddingLeft: "1rem",
					paddingRight: "1rem",
				}}
			>
				<Group h="100%" justify="space-between" wrap="nowrap">
					{/* Kiri: icon di mobile, tombol teks di desktop */}
					<Box style={{ flex: 1 }}>
						<ActionIcon
							hiddenFrom="sm"
							variant="subtle"
							color="gray"
							size="lg"
							onClick={() => navigate({ to: "/" })}
							aria-label="Kembali"
						>
							<IconChevronLeft size={20} />
						</ActionIcon>
						<Button
							visibleFrom="sm"
							variant="subtle"
							color="gray"
							leftSection={<IconChevronLeft size={16} />}
							onClick={() => navigate({ to: "/" })}
						>
							Kembali ke Dashboard
						</Button>
					</Box>

					{/* Tengah: selalu center */}
					<Text
						fw={700}
						fz={{ base: "sm", sm: "lg" }}
						c="orange.6"
						style={{ whiteSpace: "nowrap" }}
					>
						PENGATURAN AKUN
					</Text>

					{/* Kanan: spacer mirror kiri */}
					<Box style={{ flex: 1 }} />
				</Group>
			</AppShell.Header>

			<AppShell.Main>
				<Outlet />
				<AssistantFab />
			</AppShell.Main>
		</AppShell>
	);
}
