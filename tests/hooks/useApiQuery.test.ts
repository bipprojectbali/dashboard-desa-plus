import { describe, expect, it } from "bun:test";
import { resolveRefetchInterval } from "@/hooks/useApiQuery";

/**
 * Menguji keputusan refetch-interval useApiQuery (menggantikan useAutoRefresh):
 * auto-refresh hanya aktif bila komponen meminta autoRefresh DAN setting global
 * refreshOtomatis menyala. Logika skeleton (isLoading vs isFetching) &
 * caching adalah domain TanStack Query yang sudah teruji, jadi tidak diuji ulang.
 */
describe("resolveRefetchInterval", () => {
	it("returns false when component does not opt into autoRefresh", () => {
		expect(resolveRefetchInterval(false, true, "1")).toBe(false);
		expect(resolveRefetchInterval(undefined, true, "1")).toBe(false);
	});

	it("returns false when global refreshOtomatis is off", () => {
		expect(resolveRefetchInterval(true, false, "1")).toBe(false);
	});

	it("returns interval in ms when both autoRefresh and refreshOtomatis are on", () => {
		// intervalToMs("1") → 30 detik → 30_000 ms
		expect(resolveRefetchInterval(true, true, "1")).toBe(30_000);
		// intervalToMs("3") → 5 menit → 300_000 ms
		expect(resolveRefetchInterval(true, true, "3")).toBe(300_000);
	});

	it("falls back to 60s default for an unknown interval code", () => {
		expect(resolveRefetchInterval(true, true, "99")).toBe(60_000);
	});

	it("never returns a truthy interval unless explicitly enabled", () => {
		// Kombinasi mati → selalu false (tidak ada background refetch → tidak ada
		// skeleton berkedip saat pindah halaman).
		expect(resolveRefetchInterval(false, false, "1")).toBe(false);
	});
});
