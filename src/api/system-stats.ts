import { statfsSync } from "node:fs";
import os from "node:os";
import Elysia from "elysia";

export const systemStatsRoutes = new Elysia().get("/system/stats", () => {
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	const usedMem = totalMem - freeMem;
	const memPct = Math.round((usedMem / totalMem) * 100);

	const cpus = os.cpus();
	let totalIdle = 0;
	let totalTick = 0;
	for (const cpu of cpus) {
		for (const type of Object.values(cpu.times)) {
			totalTick += type;
		}
		totalIdle += cpu.times.idle;
	}
	const cpuPct = Math.round(((totalTick - totalIdle) / totalTick) * 100);

	let diskUsedPct = 0;
	try {
		const stat = statfsSync("/");
		const total = stat.blocks * stat.bsize;
		const free = stat.bfree * stat.bsize;
		diskUsedPct = Math.round(((total - free) / total) * 100);
	} catch {
		// statfs not available
	}

	return {
		data: {
			memPct,
			cpuPct,
			diskUsedPct,
			diskFreePct: 100 - diskUsedPct,
		},
	};
});
