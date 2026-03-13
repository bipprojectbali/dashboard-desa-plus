import {
	AppShell,
	Burger,
	Group,
	useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/pengaturan")({
	component: PengaturanLayout,
});

function PengaturanLayout() {
	const [opened, { toggle, close }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();

	const isMobile = useMediaQuery("(max-width: 48em)");
	const routerState = useRouterState();

	const headerBgColor = colorScheme === "dark" ? "#11192D" : "#19355E";
	const navbarBgColor = colorScheme === "dark" ? "#11192D" : "white";
	const mainBgColor = colorScheme === "dark" ? "#11192D" : "#edf3f8ff";

	// Auto close navbar on route change (mobile only)
	useEffect(() => {
		if (isMobile && opened) {
			close();
		}
	}, [routerState.location.pathname, isMobile, opened, close]);

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
				<Group h="100%" px="lg" align="center" wrap="nowrap">
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
