import { statfsSync } from "node:fs";
import os from "node:os";
import { prisma } from "./db";

// Jarak antar dua sample os.cpus() untuk menghitung utilisasi CPU "live".
// Rata-rata-sejak-boot (single sample) tampak statis di panel monitoring;
// delta antar dua sample memberi utilisasi sesaat yang sebenarnya.
const CPU_SAMPLE_MS = 200;
const PING_TIMEOUT_MS = 3000;

export interface EndpointHealth {
	ok: boolean;
	latencyMs: number | null;
}

export interface SystemHealth {
	memPct: number;
	cpuPct: number;
	diskUsedPct: number;
	diskFreePct: number;
	db: EndpointHealth;
	desaApi: EndpointHealth;
	nocApi: EndpointHealth;
	lastSync: {
		type: string;
		status: string;
		startedAt: string;
	} | null;
}

/** HEAD request ke url; ok bila status < 500. Latensi null saat gagal/timeout. */
export async function pingEndpoint(url: string): Promise<EndpointHealth> {
	const start = Date.now();
	try {
		const res = await fetch(url, {
			method: "HEAD",
			signal: AbortSignal.timeout(PING_TIMEOUT_MS),
		});
		return { ok: res.status < 500, latencyMs: Date.now() - start };
	} catch {
		return { ok: false, latencyMs: null };
	}
}

/** Snapshot tick kumulatif os.cpus() → total tick + idle tick agregat semua core. */
function readCpuTicks(): { total: number; idle: number } {
	let total = 0;
	let idle = 0;
	for (const cpu of os.cpus()) {
		for (const type of Object.values(cpu.times)) {
			total += type;
		}
		idle += cpu.times.idle;
	}
	return { total, idle };
}

/**
 * Utilisasi CPU live: dua sample os.cpus() berjarak CPU_SAMPLE_MS,
 * cpuPct = (deltaTotal - deltaIdle) / deltaTotal * 100. Fallback 0 saat delta 0.
 */
export async function sampleCpuPct(): Promise<number> {
	const a = readCpuTicks();
	await new Promise((resolve) => setTimeout(resolve, CPU_SAMPLE_MS));
	const b = readCpuTicks();

	const deltaTotal = b.total - a.total;
	const deltaIdle = b.idle - a.idle;
	if (deltaTotal <= 0) return 0;
	return Math.round(((deltaTotal - deltaIdle) / deltaTotal) * 100);
}

/**
 * Komposisi kesehatan sistem: memori, CPU (live), disk, ping DB/Desa/NOC,
 * dan last-sync terakhir. Pure — tidak menulis ActivityLog (itu tanggung
 * jawab endpoint admin yang punya konteks user).
 */
export async function computeSystemStats(): Promise<SystemHealth> {
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	const memPct = Math.round(((totalMem - freeMem) / totalMem) * 100);

	let diskUsedPct = 0;
	try {
		const stat = statfsSync("/");
		const total = stat.blocks * stat.bsize;
		const free = stat.bfree * stat.bsize;
		diskUsedPct = Math.round(((total - free) / total) * 100);
	} catch {
		// statfs tidak tersedia di platform ini
	}

	const desaApiUrl =
		process.env.DESA_API_URL ?? "https://desa-darmasaba-stg.wibudev.com";
	const nocApiUrl =
		process.env.NOC_API_URL ?? "https://darmasaba.muku.id/api/noc";

	const [cpuPct, db, desaApi, nocApi, lastSyncRow] = await Promise.all([
		sampleCpuPct(),
		(async (): Promise<EndpointHealth> => {
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

	return {
		memPct,
		cpuPct,
		diskUsedPct,
		diskFreePct: 100 - diskUsedPct,
		db,
		desaApi,
		nocApi,
		lastSync: lastSyncRow
			? {
					type: lastSyncRow.type,
					status: lastSyncRow.status,
					startedAt: lastSyncRow.startedAt.toISOString(),
				}
			: null,
	};
}
