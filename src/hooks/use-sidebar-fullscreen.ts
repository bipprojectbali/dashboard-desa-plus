import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export function useSidebarFullscreen() {
	const [opened, { toggle: toggleMobile }] = useDisclosure();
	const [sidebarCollapsed, setSidebarCollapsed] = useDisclosure(false);
	const [clickCount, setClickCount] = useState(0);

	const toggleSidebar = () => {
		setSidebarCollapsed.toggle();
		setClickCount(0);
	};

	const handleMainClick = () => {
		if (!sidebarCollapsed) {
			const newCount = clickCount + 1;
			setClickCount(newCount);

			if (newCount === 2) {
				toggleSidebar();
			} else {
				setTimeout(() => setClickCount(0), 300);
			}
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
