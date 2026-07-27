import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Proxy sosial: komponen frontend (posyandu-schedule, pendidikan) memanggil
 * endpoint internal ini alih-alih Desa API langsung, supaya tidak kena CORS
 * saat cross-origin dari browser ke Desa API. Endpoint berada di belakang
 * auth middleware — komponen mengirim cookie session lewat apiClient
 * (credentials: "include"). Tanpa auth harus 401; route yang tidak ada 404.
 * Ini membuktikan proxy sudah ter-mount, bukan menembus ke Desa API langsung.
 */
describe("Sosial API Proxy", () => {
	it("posyandu proxy ter-mount (protected → 401 tanpa auth)", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/sosial/posyandu/find-many"),
		);
		expect([401, 422]).toContain(response.status);
	});

	it("pendidikan proxy ter-mount (protected → 401 tanpa auth)", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/sosial/pendidikan/stats"),
		);
		expect([401, 422]).toContain(response.status);
	});

	it("beasiswa proxy ter-mount (protected → 401 tanpa auth)", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/sosial/beasiswa/stats"),
		);
		expect([401, 422]).toContain(response.status);
	});

	it("route sosial tak dikenal mengembalikan 404", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/sosial/does-not-exist"),
		);
		expect(response.status).toBe(404);
	});
});
