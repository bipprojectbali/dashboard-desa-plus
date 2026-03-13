import { AppShell, Burger, Group, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import DemografiPekerjaan from "../components/demografi-pekerjaan";

export const Route = createFileRoute("/demografi-pekerjaan")({
	component: DemografiPekerjaanPage,
});

function DemografiPekerjaanPage() {
	const [opened, { toggle }] = useDisclosure();
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
				collapsed: { mobile: !opened },
			}}
			padding="md"
		>
			<AppShell.Header bg={headerBgColor}>
				<Group h="100%" px="md">
					<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
				<DemografiPekerjaan />
			</AppShell.Main>
		</AppShell>
	);
}
