import type { AppShellProps } from "@mantine/core";
import { useSnapshot } from "valtio";
import { assistantStore } from "@/store/assistant";
import { ASSISTANT_PANEL_WIDTH } from "./assistant-panel.styles";

/** Lebar kolom kanan yang dipakai panel: hanya saat terbuka dan mode normal (perbesar menutupi halaman). */
export function assistantSpaceFor(open: boolean, maximized: boolean): number {
	return open && !maximized ? ASSISTANT_PANEL_WIDTH : 0;
}

/** Ruang (px) yang harus disisakan halaman di kanan; satu sumber untuk MainLayout, /profile, dan /wall. */
export function useAssistantSpace(): number {
	const { open, maximized } = useSnapshot(assistantStore);
	return assistantSpaceFor(open, maximized);
}

/**
 * Konfigurasi `aside` AppShell untuk ruang panel: Mantine menggeser konten
 * (dengan transisi) di bawah header; elemen Aside tidak dirender (panel adalah
 * Drawer). Di bawah breakpoint md panel tetap melayang menutupi halaman.
 */
export function assistantAsideConfig(space: number): AppShellProps["aside"] {
	return {
		width: ASSISTANT_PANEL_WIDTH,
		breakpoint: "md",
		collapsed: { desktop: space === 0, mobile: true },
	};
}
