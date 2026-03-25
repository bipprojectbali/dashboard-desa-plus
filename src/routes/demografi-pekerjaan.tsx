import { AppShell, Burger, Group, useMantineColorScheme } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useSidebarFullscreen } from "@/hooks/use-sidebar-fullscreen";
import DemografiPekerjaan from "../components/demografi-pekerjaan";

export const Route = createFileRoute("/demografi-pekerjaan")({
	component: DemografiPekerjaanPage,
});

function DemografiPekerjaanPage() {
	const {
		opened,
		toggleMobile,
		sidebarCollapsed,
		toggleSidebar,
		handleMainClick,
	} = useSidebarFullscreen();
	const { colorScheme } = useMantineColorScheme();
	const headerBgColor = colorScheme === "dark" ? "#11192D" : "#19355E";
	const navbarBgColor = colorScheme === "dark" ? "#11192D" : "white";
	const mainBgColor = colorScheme === "dark" ? "#11192D" : "#edf3f8ff";

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
					<Burger
						opened={opened}
						onClick={toggleMobile}
						hiddenFrom="sm"
						size="sm"
					/>
					<Header onSidebarToggle={toggleSidebar} />
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
				<DemografiPekerjaan />
			</AppShell.Main>
		</AppShell>
	);
}
