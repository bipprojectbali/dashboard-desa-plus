import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { i18nStore, intervalToMs } from "@/store/i18n";

/**
 * Memanggil `fetchFn` secara otomatis berdasarkan setting refreshOtomatis
 * dan intervalRefresh dari i18nStore. Tidak melakukan fetch pertama kali —
 * komponen bertanggung jawab atas initial fetch.
 */
export function useAutoRefresh(fetchFn: () => void) {
	const { refreshOtomatis, intervalRefresh } = useSnapshot(i18nStore);

	useEffect(() => {
		if (!refreshOtomatis) return;

		const ms = intervalToMs(intervalRefresh);
		const id = setInterval(fetchFn, ms);
		return () => clearInterval(id);
	}, [refreshOtomatis, intervalRefresh, fetchFn]);
}
