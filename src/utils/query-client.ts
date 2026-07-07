import { QueryClient } from "@tanstack/react-query";

/**
 * Satu QueryClient global untuk seluruh app. Menyimpan hasil fetch di memori
 * agar navigasi antar halaman tidak memicu fetch ulang + skeleton.
 *
 * - staleTime: selama window ini, data dianggap segar → balik ke halaman
 *   TIDAK memicu refetch sama sekali (langsung dari cache).
 * - gcTime: cache tetap disimpan walau semua komponen pemakainya unmount,
 *   sehingga kembali ke halaman lama tetap tampil instan tanpa skeleton.
 */
const STALE_TIME_MS = 5 * 60_000; // 5 menit
const GC_TIME_MS = 30 * 60_000; // 30 menit

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			gcTime: GC_TIME_MS,
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
