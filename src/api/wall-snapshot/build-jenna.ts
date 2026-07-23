import type { WallJenna } from "@/types/wall";
import { TTL, withCache } from "@/utils/cache";
import { type JennaAnalyticsRaw, mapJenna } from "../transforms/jenna";

/**
 * Fetch & cache analytic Jenna dari NOC. Sumber & pola identik dengan halaman
 * `/jenna-analytic` (proxy `/api/jenna/analytics`) dan slice pengaduan. Guard:
 * env kosong → throw → settle() di index → slice null → panel tampil empty.
 */
async function fetchJennaFromNoc(): Promise<WallJenna> {
	return withCache("dashboard:jenna", TTL.DASHBOARD, async () => {
		const apiUrl = process.env.VITE_JENNA_API_URL ?? "";
		const token = process.env.VITE_JENNA_API_TOKEN ?? "";
		if (!apiUrl || !token) throw new Error("VITE_JENNA_API_URL/TOKEN not set");

		const res = await fetch(`${apiUrl}/api/noc/jenna/analytics`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error(`Jenna analytics error: ${res.status}`);

		const json = await res.json();
		const d = (json?.data ?? json) as JennaAnalyticsRaw;
		return mapJenna(d);
	});
}

/** Rakit slice Jenna (sumber sama dgn halaman /jenna-analytic). */
export async function buildJenna(): Promise<WallJenna> {
	return fetchJennaFromNoc();
}
