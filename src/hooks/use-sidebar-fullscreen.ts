import { useDisclosure } from "@mantine/hooks";

export function useSidebarFullscreen() {
	const [opened, { toggle: toggleMobile }] = useDisclosure();
	const [sidebarCollapsed, setSidebarCollapsed] = useDisclosure(false);

	const toggleSidebar = () => {
		setSidebarCollapsed.toggle();
	};

	const handleMainClick = () => {
		if (!sidebarCollapsed) {
			toggleSidebar();
		}
	};

	return {
		opened,
		toggleMobile,
		sidebarCollapsed,
		toggleSidebar,
		handleMainClick,
		isCollapsed: sidebarCollapsed,
	};
}
