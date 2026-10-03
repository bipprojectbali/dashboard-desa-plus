import { POINTER_ROUTES } from "@/config/assistant-pointer/routes";
import { apiClient } from "@/utils/api-client";

/**
 * Daftar nama untuk pencocokan otomatis V1-B — diambil dari data yang sudah ada,
 * bukan hardcode: label modul dari registry penunjuk AI + nama banjar dari
 * `/api/demografi/banjar`.
 */

/** Nama banjar dari payload `/api/demografi/banjar` (`{ success, data: [{ nama | name }] }`). */
export function banjarNamesFrom(payload: unknown): string[] {
	const body = payload as { success?: boolean; data?: unknown } | null;
	if (!body?.success || !Array.isArray(body.data)) return [];
	return body.data
		.map((row) => {
			const r = row as { nama?: unknown; name?: unknown };
			return typeof r.nama === "string" ? r.nama : r.name;
		})
		.filter((n): n is string => typeof n === "string" && n.trim() !== "");
}

/** Gabung + buang duplikat (tanpa membedakan huruf besar/kecil). */
export function mergeTerms(
	...lists: ReadonlyArray<readonly string[]>
): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const name of lists.flat()) {
		const key = name.trim().toLowerCase();
		if (!key || seen.has(key)) continue;
		seen.add(key);
		out.push(name.trim());
	}
	return out;
}

export const MODULE_TERMS: readonly string[] = POINTER_ROUTES.map(
	(r) => r.label,
);

/** Ambil daftar nama; bila banjar gagal dimuat, tetap kembalikan label modul + alasannya. */
export async function fetchVoiceLabTerms(): Promise<{
	terms: string[];
	error: string | null;
}> {
	try {
		const res = await apiClient.GET("/api/demografi/banjar", {});
		if (!res.response.ok) throw new Error(`HTTP ${res.response.status}`);
		return {
			terms: mergeTerms(MODULE_TERMS, banjarNamesFrom(res.data)),
			error: null,
		};
	} catch (err) {
		return {
			terms: [...MODULE_TERMS],
			error: `daftar banjar gagal dimuat: ${(err as Error).message}`,
		};
	}
}
