import { proxy } from "valtio";

interface PermissionState {
	allowed: string[] | null; // null = belum di-load
}

export const permissionStore = proxy<PermissionState>({ allowed: null });

export function setPermissions(allowed: string[]) {
	permissionStore.allowed = allowed;
}

export function resetPermissions() {
	permissionStore.allowed = null;
}
