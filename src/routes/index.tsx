import { AppShell, Burger, Group, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/")({
	component: DashboardPage,
});

function DashboardPage() {
	const [opened, { toggle }] = useDisclosure();
	const [sidebarCollapsed, setSidebarCollapsed] = useDisclosure(false);
	const [clickCount, setClickCount] = useState(0);
	const { colorScheme } = useMantineColorScheme();
	const headerBgColor = colorScheme === "dark" ? "#11192D" : "#19355E";
	const navbarBgColor = colorScheme === "dark" ? "#11192D" : "white";
	const mainBgColor = colorScheme === "dark" ? "#11192D" : "#edf3f8ff";

	const handleMainClick = () => {
		if (!sidebarCollapsed) {
			const newCount = clickCount + 1;
			setClickCount(newCount);

			if (newCount === 2) {
				setSidebarCollapsed.toggle();
				setClickCount(0);
			} else {
				setTimeout(() => setClickCount(0), 300);
			}
		}
	};

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
				collapsed: { mobile: !opened, desktop: sidebarCollapsed },
			}}
			padding="md"
		>
			<AppShell.Header bg={headerBgColor}>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					<Header onSidebarToggle={setSidebarCollapsed.toggle} />
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

			<AppShell.Main
				bg={mainBgColor}
				onClick={handleMainClick}
				style={{ cursor: sidebarCollapsed ? "default" : "pointer" }}
			>
				<DashboardContent />
			</AppShell.Main>
		</AppShell>
	);
}
