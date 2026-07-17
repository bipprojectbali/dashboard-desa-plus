import { VITE_PUBLIC_URL } from "@/utils/env";
import type { WallSizeMap } from "./wall-layout-utils";

/** Payload layout wall dari server: urutan + override ukuran per widget. */
export interface WallLayoutPayload {
	order: string[];
	/** Override ukuran per widget; null saat belum pernah di-resize. */
	sizes: WallSizeMap | null;
}

interface WallLayoutResponse {
	data: WallLayoutPayload;
}

/**
 * Ambil layout wall global dari endpoint publik (read-only, tanpa auth).
 * Balikin `{order, sizes}` mentah — pemanggil yang `resolveLayout`/`resolveSizes`
 * ke grid final. DB kosong → `{order: [], sizes: null}`.
 */
export async function fetchWallLayout(): Promise<WallLayoutPayload> {
	const base = VITE_PUBLIC_URL || window.location.origin;
	const url = new URL("/api/wall-layout", base);

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Wall layout HTTP ${res.status}`);
	}
	const json = (await res.json()) as WallLayoutResponse;
	return {
		order: json.data.order,
		sizes: json.data.sizes ?? null,
	};
}

/**
 * Simpan layout wall global (admin-only; butuh sesi via cookie).
 * Server memvalidasi ulang (`validateLayout` + `validateSizes`) → 422 saat
 * cacat, 401 saat bukan admin.
 */
export async function saveWallLayout(
	order: readonly string[],
	sizes: WallSizeMap | null,
): Promise<void> {
	const base = VITE_PUBLIC_URL || window.location.origin;
	const url = new URL("/api/wall-layout", base);

	const res = await fetch(url.toString(), {
		method: "PUT",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ order, sizes }),
	});
	if (!res.ok) {
		let detail = `HTTP ${res.status}`;
		try {
			const json = (await res.json()) as { error?: string };
			if (json.error) detail = json.error;
		} catch {
			// respons non-JSON — pakai status code apa adanya.
		}
		throw new Error(`Gagal menyimpan layout: ${detail}`);
	}
}
