import { describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";

describe("NOC API Module", () => {
	const idDesa = "desa1";

	it("should return last sync timestamp", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/last-sync?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty("lastSyncedAt");
	});

	it("should return active divisions", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/active-divisions?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return latest projects", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/latest-projects?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return upcoming events", async () => {
		const response = await api.handle(
			new Request(`http://localhost/api/noc/upcoming-events?idDesa=${idDesa}`),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return diagram jumlah document", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/diagram-jumlah-document?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return diagram progres kegiatan", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/diagram-progres-kegiatan?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return latest discussion", async () => {
		const response = await api.handle(
			new Request(
				`http://localhost/api/noc/latest-discussion?idDesa=${idDesa}`,
			),
		);
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should return 400 for missing idDesa in active-divisions", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/noc/active-divisions"),
		);
		// Elysia returns 400 or 422 for validation errors
		expect([400, 422]).toContain(response.status);
	});

	it("should return 401 or 422 for sync without admin auth", async () => {
		const response = await api.handle(
			new Request("http://localhost/api/noc/sync", {
				method: "POST",
			}),
		);
		expect([401, 422]).toContain(response.status);
	});
});
