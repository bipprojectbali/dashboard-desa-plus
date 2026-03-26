import {
	AppShell,
	Button,
	Container,
	Group,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
	component: ProfileLayout,
});

function ProfileLayout() {
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<AppShell
			header={{ height: 60 }}
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
				
					<Group h="100%" justify="space-between">
						<Group>
							<Button
								variant="subtle"
								color="gray"
								leftSection={<IconChevronLeft size={16} />}
								onClick={() => navigate({ to: "/" })}
							>
								Kembali ke Dashboard
							</Button>
						</Group>

						<Text fw={700} size="lg" c="orange.6">
							PENGATURAN AKUN
						</Text>

						<Box w={150} />
					</Group>
			</AppShell.Header>

			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}

import { Box } from "@mantine/core";
