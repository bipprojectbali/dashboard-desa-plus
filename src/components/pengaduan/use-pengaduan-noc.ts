import { useApiQuery } from "@/hooks/useApiQuery";
import type { PengaduanData } from "./pengaduan.types";

async function fetchPengaduan(): Promise<PengaduanData> {
	const r = await fetch("/api/noc/pengaduan");
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return (await r.json()) as PengaduanData;
}

export function usePengaduanNoc() {
	const query = useApiQuery(["pengaduan", "noc"], fetchPengaduan, {
		autoRefresh: true,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.isError
			? "Gagal memuat data pengaduan. Periksa koneksi dan coba lagi."
			: null,
		refresh: () => query.refetch(),
	};
}
