/** Lebar navbar penuh (px). */
export const SIDEBAR_FULL_WIDTH = 300;
/** Lebar rel ikon saat panel asisten terbuka di layar sempit (px). */
export const SIDEBAR_RAIL_WIDTH = 72;
/** Di layar lebih lebar dari ini (px) sidebar tidak disempitkan: konten masih lega bersama panel. */
export const SIDEBAR_RAIL_BELOW_VIEWPORT = 1600;
/** Di bawah ini (px) panel melayang menutupi halaman (breakpoint md), jadi tidak ada ruang yang perlu dihemat. */
export const SIDEBAR_RAIL_MIN_VIEWPORT = 992;

export type SidebarMode = "hidden" | "rail" | "full";

export interface SidebarModeInput {
	/** Ruang kanan yang dipakai panel asisten (0 = tertutup/diperbesar). */
	panelSpace: number;
	viewportWidth: number;
	/** Pilihan user: sidebar disembunyikan penuh. */
	userCollapsed: boolean;
	/** User memperlebar rel secara manual selama panel terbuka. */
	widened: boolean;
}

/** Rel ikon hanya saat panel mendorong konten DAN layar sempit-menengah; selain itu sesuai pilihan user. */
export function isRailEligible(
	panelSpace: number,
	viewportWidth: number,
): boolean {
	return (
		panelSpace > 0 &&
		viewportWidth >= SIDEBAR_RAIL_MIN_VIEWPORT &&
		viewportWidth < SIDEBAR_RAIL_BELOW_VIEWPORT
	);
}

/** Mode sidebar desktop; pilihan user (`userCollapsed`) tidak pernah diubah otomatis, jadi pulih sendiri saat panel ditutup. */
export function sidebarModeFor(input: SidebarModeInput): SidebarMode {
	if (input.userCollapsed) return "hidden";
	if (input.widened) return "full";
	return isRailEligible(input.panelSpace, input.viewportWidth)
		? "rail"
		: "full";
}

export function sidebarWidthFor(mode: SidebarMode): number {
	return mode === "rail" ? SIDEBAR_RAIL_WIDTH : SIDEBAR_FULL_WIDTH;
}
