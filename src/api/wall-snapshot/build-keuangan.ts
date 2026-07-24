import type { WallKeuangan } from "@/types/wall";
import { fetchApbdesEntriesRaw } from "../sources/apbdes";
import { mapKeuanganList } from "../transforms/keuangan-apbdes";

/** Keuangan wall: ambil tahun terbaru dari live Desa API (cache apbdes:all). */
export async function buildKeuangan(): Promise<WallKeuangan | null> {
	const years = mapKeuanganList(await fetchApbdesEntriesRaw());
	const y = years[0];
	if (!y) return null;
	const { id: _id, name: _name, ...slice } = y;
	return slice;
}
