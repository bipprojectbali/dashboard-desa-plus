import { describe, expect, it } from "bun:test";
import { computeSystemStats, sampleCpuPct } from "@/utils/system-health";

describe("computeSystemStats (shape + range, bukan nilai pasti)", () => {
	it("mengembalikan metrik dalam rentang valid", async () => {
		const health = await computeSystemStats();

		expect(health.memPct).toBeGreaterThanOrEqual(0);
		expect(health.memPct).toBeLessThanOrEqual(100);
		expect(health.cpuPct).toBeGreaterThanOrEqual(0);
		expect(health.cpuPct).toBeLessThanOrEqual(100);
		expect(health.diskUsedPct).toBeGreaterThanOrEqual(0);
		expect(health.diskUsedPct).toBeLessThanOrEqual(100);
		// diskFreePct komplemen diskUsedPct
		expect(health.diskFreePct).toBe(100 - health.diskUsedPct);
	});

	it("field kesehatan endpoint ada dan bertipe benar", async () => {
		const health = await computeSystemStats();
		expect(typeof health.db.ok).toBe("boolean");
		expect(typeof health.desaApi.ok).toBe("boolean");
		expect(typeof health.nocApi.ok).toBe("boolean");
		// lastSync boleh null atau objek berbentuk
		if (health.lastSync !== null) {
			expect(typeof health.lastSync.type).toBe("string");
			expect(typeof health.lastSync.status).toBe("string");
			expect(typeof health.lastSync.startedAt).toBe("string");
		}
	});
});

describe("sampleCpuPct (live, dua sample)", () => {
	it("selalu dalam [0,100] — assert range bukan nilai", async () => {
		const pct = await sampleCpuPct();
		expect(pct).toBeGreaterThanOrEqual(0);
		expect(pct).toBeLessThanOrEqual(100);
	});
});
