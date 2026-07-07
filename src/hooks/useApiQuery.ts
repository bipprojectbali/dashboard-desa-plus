import {
	type QueryKey,
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { useSnapshot } from "valtio";
import { i18nStore, intervalToMs } from "@/store/i18n";

interface UseApiQueryOptions<T>
	extends Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn"> {
	/**
	 * Ikutkan interval refresh dari i18nStore (refreshOtomatis + intervalRefresh).
	 * Refresh berjalan diam-diam di background (isFetching), TIDAK memicu skeleton.
	 */
	autoRefresh?: boolean;
}

/**
 * Menentukan nilai `refetchInterval` untuk useQuery: aktif hanya bila komponen
 * meminta auto-refresh DAN setting global `refreshOtomatis` menyala. Dipisah
 * sebagai fungsi murni agar bisa diuji tanpa render React.
 */
export function resolveRefetchInterval(
	autoRefresh: boolean | undefined,
	refreshOtomatis: boolean,
	intervalRefresh: string,
): number | false {
	if (!autoRefresh || !refreshOtomatis) return false;
	return intervalToMs(intervalRefresh);
}

/**
 * Pembungkus tipis di atas `useQuery` dengan dua jaminan:
 *
 * 1. Skeleton digerakkan `isLoading` — yang hanya `true` saat belum ada data
 *    di cache (kunjungan pertama). Balik ke halaman yang sudah pernah dibuka
 *    membaca dari cache → `isLoading` langsung `false` → tanpa skeleton.
 *    Refresh di background terekspos lewat `isFetching` (jangan dipakai untuk
 *    men-trigger skeleton).
 *
 * 2. Auto-refresh terintegrasi dengan setting dashboard (`refreshOtomatis` /
 *    `intervalRefresh`) menggantikan hook `useAutoRefresh` yang lama.
 */
export function useApiQuery<T>(
	queryKey: QueryKey,
	queryFn: () => Promise<T>,
	options?: UseApiQueryOptions<T>,
): UseQueryResult<T, Error> {
	const { autoRefresh, ...rest } = options ?? {};
	const { refreshOtomatis, intervalRefresh } = useSnapshot(i18nStore);

	const refetchInterval = resolveRefetchInterval(
		autoRefresh,
		refreshOtomatis,
		intervalRefresh,
	);

	return useQuery<T, Error, T, QueryKey>({
		queryKey,
		queryFn,
		refetchInterval,
		...rest,
	});
}
