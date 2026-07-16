import { VITE_PUBLIC_URL } from "@/utils/env";

interface WallLayoutResponse {
	data: { order: string[] };
}

/**
 * Ambil layout wall global dari endpoint publik (read-only, tanpa auth).
 * Balikin array widget id mentah — pemanggil yang `resolveLayout` ke grid final.
 * DB kosong → `order: []`.
 */
export async function fetchWallLayout(): Promise<string[]> {
	const base = VITE_PUBLIC_URL || window.location.origin;
	const url = new URL("/api/wall-layout", base);

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Wall layout HTTP ${res.status}`);
	}
	const json = (await res.json()) as WallLayoutResponse;
	return json.data.order;
}

/**
 * Simpan layout wall global (admin-only; butuh sesi via cookie).
 * Server memvalidasi ulang (`validateLayout`) → 422 saat cacat, 401 saat bukan admin.
 */
export async function saveWallLayout(order: readonly string[]): Promise<void> {
	const base = VITE_PUBLIC_URL || window.location.origin;
	const url = new URL("/api/wall-layout", base);

	const res = await fetch(url.toString(), {
		method: "PUT",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ order }),
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
