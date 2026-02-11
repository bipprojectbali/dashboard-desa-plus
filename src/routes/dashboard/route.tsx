import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const [opened, { toggle }] = useDisclosure();

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 250,
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			}}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<Header />
				</Group>
			</AppShell.Header>

			<AppShell.Navbar p="md">
				<Sidebar />
			</AppShell.Navbar>

			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
