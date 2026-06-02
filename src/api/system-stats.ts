import { statfsSync } from "node:fs";
import os from "node:os";
import Elysia from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";
import { prisma } from "../utils/db";
import logger from "../utils/logger";

async function pingEndpoint(
	url: string,
): Promise<{ ok: boolean; latencyMs: number | null }> {
	const start = Date.now();
	try {
		const res = await fetch(url, {
			method: "HEAD",
			signal: AbortSignal.timeout(3000),
		});
		return { ok: res.status < 500, latencyMs: Date.now() - start };
	} catch {
		return { ok: false, latencyMs: null };
	}
}

export const systemStatsRoutes = new Elysia()
	.use(apiMiddleware)
	.get("/system/stats", async ({ user }) => {
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

		const desaApiUrl =
			process.env.DESA_API_URL ?? "https://desa-darmasaba-stg.wibudev.com";
		const nocApiUrl =
			process.env.NOC_API_URL ?? "https://darmasaba.muku.id/api/noc";

		const [dbResult, desaResult, nocResult, lastSyncRow] = await Promise.all([
			(async () => {
				const start = Date.now();
				try {
					await prisma.$queryRaw`SELECT 1`;
					return { ok: true, latencyMs: Date.now() - start };
				} catch {
					return { ok: false, latencyMs: null };
				}
			})(),
			pingEndpoint(desaApiUrl),
			pingEndpoint(nocApiUrl),
			prisma.syncLog
				.findFirst({
					orderBy: { startedAt: "desc" },
					select: { type: true, status: true, startedAt: true },
				})
				.catch(() => null),
		]);

		const failed: string[] = [];
		if (!dbResult.ok) failed.push("db");
		if (!desaResult.ok) failed.push("desa-api");
		if (!nocResult.ok) failed.push("noc-api");

		// Log ke ActivityLog jika ada komponen yang gagal (skip jika DB down)
		if (failed.length > 0 && user?.id && dbResult.ok) {
			try {
				await prisma.activityLog.create({
					data: {
						userId: user.id,
						action: "health-check-failed",
						detail: JSON.stringify({ failed }),
					},
				});
			} catch (e) {
				logger.warn(
					{ e },
					"Failed to write health check failure to ActivityLog",
				);
			}
		}

		return {
			data: {
				memPct,
				cpuPct,
				diskUsedPct,
				diskFreePct: 100 - diskUsedPct,
				db: dbResult,
				desaApi: desaResult,
				nocApi: nocResult,
				lastSync: lastSyncRow
					? {
							type: lastSyncRow.type,
							status: lastSyncRow.status,
							startedAt: lastSyncRow.startedAt.toISOString(),
						}
					: null,
			},
		};
	});
