import type { WallSnapshot } from "@/types/wall";
import { VITE_PUBLIC_URL } from "@/utils/env";

interface WallSnapshotResponse {
	success: boolean;
	data: WallSnapshot | null;
	error?: string;
}

/**
 * Ambil snapshot wall dari endpoint publik. Tipe pakai WallSnapshot bersama
 * (hindari kopling ke generated/api.ts sebelum gen:api dijalankan).
 */
export async function fetchWallSnapshot(
	key: string | undefined,
): Promise<WallSnapshot> {
	const base = VITE_PUBLIC_URL || window.location.origin;
	const url = new URL("/api/noc/wall-snapshot", base);
	if (key) url.searchParams.set("key", key);

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Wall snapshot HTTP ${res.status}`);
	}
	const json = (await res.json()) as WallSnapshotResponse;
	if (!json.success || !json.data) {
		throw new Error(json.error ?? "Wall snapshot tidak tersedia");
	}
	return json.data;
}
