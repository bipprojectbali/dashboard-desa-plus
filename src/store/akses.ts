import { proxy } from "valtio";

interface AksesState {
	izinExportData: boolean;
	requireApprovalPerubahan: boolean;
}

export const aksesStore = proxy<AksesState>({
	izinExportData: true,
	requireApprovalPerubahan: true,
});

export function setAksesPrefs(prefs: Partial<AksesState>) {
	Object.assign(aksesStore, prefs);
}
