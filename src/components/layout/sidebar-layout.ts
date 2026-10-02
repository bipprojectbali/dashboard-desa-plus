/** Lebar navbar penuh (px). */
export const SIDEBAR_FULL_WIDTH = 300;
/** Lebar rel ikon (diminimize user, atau panel asisten terbuka di layar sempit) (px). */
export const SIDEBAR_RAIL_WIDTH = 72;
/** Di layar lebih lebar dari ini (px) sidebar tidak disempitkan otomatis: konten masih lega bersama panel. */
export const SIDEBAR_RAIL_BELOW_VIEWPORT = 1600;
/** Di bawah ini (px) panel melayang menutupi halaman (breakpoint md), jadi tidak ada ruang yang perlu dihemat. */
export const SIDEBAR_RAIL_MIN_VIEWPORT = 992;

export type SidebarMode = "hidden" | "rail" | "full";

export interface SidebarState {
	/** Pilihan user lewat tombol header: sidebar diminimize jadi rel ikon. */
	minimized: boolean;
	/** User memperlebar rel otomatis (panel asisten) selama panel terbuka. */
	widened: boolean;
	/** Mode fullscreen/kiosk: sidebar disembunyikan penuh (klik tiga kali di area utama). */
	hidden: boolean;
}

export interface SidebarModeInput extends SidebarState {
	/** Ruang kanan yang dipakai panel asisten (0 = tertutup/diperbesar). */
	panelSpace: number;
	viewportWidth: number;
}

export const INITIAL_SIDEBAR_STATE: SidebarState = {
	minimized: false,
	widened: false,
	hidden: false,
};

/** Rel otomatis hanya saat panel mendorong konten DAN layar sempit-menengah. */
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

/**
 * Mode sidebar desktop. Urutan: sembunyi penuh (fullscreen) > diminimize user (rel) >
 * diperlebar manual (penuh) > rel otomatis oleh panel > penuh. Pilihan user tidak
 * pernah diubah otomatis, jadi pulih sendiri saat panel ditutup.
 */
export function sidebarModeFor(input: SidebarModeInput): SidebarMode {
	if (input.hidden) return "hidden";
	if (input.minimized) return "rail";
	if (input.widened) return "full";
	return isRailEligible(input.panelSpace, input.viewportWidth)
		? "rail"
		: "full";
}

/** Lebar navbar; mode "hidden" ditutup AppShell sehingga lebarnya tidak terpakai. */
export function sidebarWidthFor(mode: SidebarMode): number {
	return mode === "rail" ? SIDEBAR_RAIL_WIDTH : SIDEBAR_FULL_WIDTH;
}

/** Tampilkan sidebar penuh: batalkan minimize/sembunyi; `eligible` = rel otomatis sedang berlaku (perlu diperlebar manual). */
export function expandedState(eligible: boolean): SidebarState {
	return { minimized: false, widened: eligible, hidden: false };
}

/** Tombol header selalu mengubah tampilan: sembunyi → kembali, penuh → rel, rel → penuh. */
export function toggledState(
	state: SidebarState,
	mode: SidebarMode,
	eligible: boolean,
): SidebarState {
	if (mode === "hidden") return { ...state, hidden: false };
	if (mode === "full")
		return { minimized: true, widened: false, hidden: false };
	return expandedState(eligible);
}
