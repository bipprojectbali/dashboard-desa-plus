import { cache, TTL } from "../../utils/cache";
import { desaExternalClient } from "../../utils/desa-external-client";
import type { ApbdesEntryRaw } from "../transforms/apbdes";

/** Fetch semua APBDes entries dari Desa API dengan cache bersama (apbdes:all). */
export async function fetchApbdesEntriesRaw(): Promise<ApbdesEntryRaw[]> {
	const cached = cache.get<ApbdesEntryRaw[]>("apbdes:all");
	if (cached) return cached;

	const client = desaExternalClient as any;
	const { data: extData, error } = await client.GET(
		"/api/landingpage/apbdes/findMany",
	);

	if (error || !extData) return [];

	const entries = (extData.data ?? extData) as ApbdesEntryRaw[];
	cache.set("apbdes:all", entries, TTL.APBDES);
	return entries;
}
