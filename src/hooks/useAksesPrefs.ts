import { useSnapshot } from "valtio";
import { aksesStore } from "@/store/akses";

export function useAksesPrefs() {
	return useSnapshot(aksesStore);
}
