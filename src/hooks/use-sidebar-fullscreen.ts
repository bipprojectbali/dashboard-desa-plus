import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

/** Klik beruntun di area utama yang memicu fullscreen (sidebar disembunyikan penuh). */
const FULLSCREEN_CLICK_COUNT = 3;
const CLICK_RESET_MS = 500;

/** Burger mobile + gestur fullscreen: klik tiga kali di area utama menyembunyikan sidebar penuh lewat `onHide`. */
export function useSidebarFullscreen(hidden: boolean, onHide: () => void) {
	const [opened, { toggle: toggleMobile }] = useDisclosure();
	const [clickCount, setClickCount] = useState(0);

	const handleMainClick = () => {
		if (hidden) return;
		const newCount = clickCount + 1;
		if (newCount >= FULLSCREEN_CLICK_COUNT) {
			setClickCount(0);
			onHide();
		} else {
			setClickCount(newCount);
			setTimeout(() => setClickCount(0), CLICK_RESET_MS);
		}
	};

	return { opened, toggleMobile, handleMainClick };
}
