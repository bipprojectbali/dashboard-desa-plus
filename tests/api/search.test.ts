import { describe, expect, it } from "bun:test";
import Elysia from "elysia";
import api from "@/api";
import { searchRoutes } from "@/api/search";

/**
 * Global Search API (src/api/search.ts): full-text search lintas modul
 * (complaint, activity, document) via `prisma.$queryRaw`.
 *
 * Source file `search.ts` TIDAK memanggil `.use(apiMiddleware)` sendiri —
 * tapi di `src/api/index.tsx`, `searchRoutes` dipasang SETELAH
 * `.use(apiMiddleware)` pada instance `api` yang sama. Karena `apiMiddleware`
 * memodifikasi instance `app` secara langsung (bukan sub-plugin terenkapsulasi
 * terpisah), `onBeforeHandle`-nya berlaku untuk SEMUA route yang dipasang
 * setelahnya pada instance yang sama — termasuk `searchRoutes`. Ini
 * diverifikasi langsung dengan request nyata ke `@/api`: hasilnya tetap 401.
 * Jadi secara end-to-end (yang dialami klien), endpoint search tetap
 * auth-gated, meski secara source-level file-nya "publik".
 *
 * Test dibagi dua:
 * 1. Integration via `@/api` (perilaku nyata end-to-end) → 401 tanpa auth.
 * 2. Unit langsung ke `searchRoutes` (tanpa rantai apiMiddleware) → menguji
 *    logika validasi input bawaan handler: query < 2 karakter selalu
 *    short-circuit ke `{results: [], total: 0}` SEBELUM query raw ke Prisma
 *    dijalankan, sehingga aman dites tanpa koneksi DB.
 */
describe("Search API — integration (via @/api, perilaku end-to-end)", () => {
	it("GET /api/search?q=ab tanpa auth → 401 (ter-gate lewat urutan mount index.tsx)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/search?q=ab"),
		);
		expect(res.status).toBe(401);
	});

	it("route search tak dikenal mengembalikan 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/search/does-not-exist"),
		);
		expect(res.status).toBe(404);
	});
});

describe("Search API — unit (searchRoutes langsung, tanpa apiMiddleware)", () => {
	const standalone = new Elysia({ prefix: "/api" }).use(searchRoutes);

	it("query kosong → {results: [], total: 0} tanpa menyentuh DB", async () => {
		const res = await standalone.handle(
			new Request("http://localhost/api/search"),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ results: [], total: 0 });
	});

	it("query 1 karakter (< 2) → {results: [], total: 0} tanpa menyentuh DB", async () => {
		const res = await standalone.handle(
			new Request("http://localhost/api/search?q=a"),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ results: [], total: 0 });
	});

	it("query whitespace saja (trim jadi < 2 karakter) → {results: [], total: 0}", async () => {
		const res = await standalone.handle(
			new Request("http://localhost/api/search?q=%20%20"),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ results: [], total: 0 });
	});
});
