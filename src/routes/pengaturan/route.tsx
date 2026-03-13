<<<<<<< HEAD:src/routes/dashboard/route.tsx
import {
	AppShell,
	Burger,
	Group,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
=======
import { AppShell, Burger, Group, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, Outlet } from "@tanstack/react-router";
>>>>>>> 89c8ca8 (fix: make dashboard public and remove admin-only restriction from main pages):src/routes/pengaturan/route.tsx
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/pengaturan")({
	component: PengaturanLayout,
});

<<<<<<< HEAD:src/routes/dashboard/route.tsx
function RouteComponent() {
	const [opened, { toggle, close }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const routerState = useRouterState();

	const isMobile = useMediaQuery("(max-width: 48em)");

=======
function PengaturanLayout() {
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
>>>>>>> 89c8ca8 (fix: make dashboard public and remove admin-only restriction from main pages):src/routes/pengaturan/route.tsx
	const headerBgColor = colorScheme === "dark" ? "#11192D" : "#19355E";
	const navbarBgColor = colorScheme === "dark" ? "#11192D" : "white";
	const mainBgColor = colorScheme === "dark" ? "#11192D" : "#edf3f8ff";

<<<<<<< HEAD:src/routes/dashboard/route.tsx
	// ✅ AUTO CLOSE NAVBAR ON ROUTE CHANGE (MOBILE ONLY)
	useEffect(() => {
		if (isMobile && opened) {
			close();
		}
	}, [routerState.location.pathname]);

=======
>>>>>>> 89c8ca8 (fix: make dashboard public and remove admin-only restriction from main pages):src/routes/pengaturan/route.tsx
	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			}}
			padding="md"
		>
			<AppShell.Header bg={headerBgColor}>
				<Group
					h="100%"
					px="lg"
					align="center"
					wrap="nowrap"
				>
					<Burger
						opened={opened}
						onClick={toggle}
						hiddenFrom="sm"
						size="sm"
					/>

					<Header />
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="md"
				bg={navbarBgColor}
				style={{ display: "flex", flexDirection: "column" }}
			>
				<div style={{ flex: 1, overflowY: "auto" }}>
					<Sidebar />
				</div>
			</AppShell.Navbar>

			<AppShell.Main bg={mainBgColor}>
				<div className="p-2">
					<Outlet />
				</div>
			</AppShell.Main>
		</AppShell>
	);
}
