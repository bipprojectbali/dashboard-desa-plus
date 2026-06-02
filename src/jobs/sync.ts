import { $ } from "bun";
import { prisma } from "@/utils/db";
import { TTL, cache } from "@/utils/cache";
import { desaExternalClient } from "@/utils/desa-external-client";
import logger from "@/utils/logger";

async function runNocSync(): Promise<void> {
	const startedAt = new Date();
	const logEntry = await prisma.syncLog.create({
		data: {
			type: "noc",
			status: "running",
			triggeredBy: "scheduled",
			startedAt,
		},
	});

	try {
		const result = await $`bun run sync:noc`.quiet();
		const stdout = result.stdout.toString();

		const recordsMatch = stdout.match(/(\d+)\s+records?/i);
		const recordsAffected = recordsMatch
			? Number.parseInt(recordsMatch[1])
			: null;
		const durationMs = Date.now() - startedAt.getTime();

		await prisma.syncLog.update({
			where: { id: logEntry.id },
			data: { status: "success", durationMs, recordsAffected },
		});

		logger.info("[SyncJob] NOC sync completed in %dms", durationMs);
	} catch (err) {
		const durationMs = Date.now() - startedAt.getTime();
		const errorMessage =
			err instanceof Error ? err.message : JSON.stringify(err);

		await prisma.syncLog.update({
			where: { id: logEntry.id },
			data: {
				status: "error",
				durationMs,
				errorMessage: errorMessage.slice(0, 500),
			},
		});

		logger.error({ err }, "[SyncJob] NOC sync failed");
	}
}

async function runDemografiSync(): Promise<void> {
	const startedAt = new Date();
	const logEntry = await prisma.syncLog.create({
		data: {
			type: "demografi",
			status: "running",
			triggeredBy: "scheduled",
			startedAt,
		},
	});

	try {
		const [
			summary,
			banjar,
			age,
			occupation,
			religion,
			births,
			deaths,
			migration,
			sectors,
			apbdes,
		] = await Promise.all([
			desaExternalClient.GET("/api/kependudukan/dashboard/summary"),
			desaExternalClient.GET("/api/kependudukan/databanjar/find-many"),
			desaExternalClient.GET("/api/kependudukan/distribusiumur/find-many"),
			desaExternalClient.GET("/api/ekonomi/demografipekerjaan/find-many"),
			desaExternalClient.GET("/api/kependudukan/distribusiagama/find-many"),
			desaExternalClient.GET("/api/kesehatan/kelahiran/findMany"),
			desaExternalClient.GET("/api/kesehatan/kematian/findMany"),
			desaExternalClient.GET("/api/kependudukan/migrasipenduduk/find-many"),
			desaExternalClient.GET("/api/ekonomi/sektourunggulandesa/find-many"),
			desaExternalClient.GET("/api/landingpage/apbdes/{id}", {
				params: { path: { id: "cmk-apbdes-001" } },
			}),
		]);

		const failed = [
			summary,
			banjar,
			age,
			occupation,
			religion,
			births,
			deaths,
			migration,
			sectors,
			apbdes,
		].filter((r) => r.error).length;

		const apbdesData = apbdes.data?.data ?? apbdes.data ?? null;
		if (!summary.error && summary.data?.data != null) cache.set("demografi:summary", summary.data.data, TTL.DEMOGRAFI);
		if (!banjar.error && banjar.data?.data != null) cache.set("demografi:banjar", banjar.data.data, TTL.DEMOGRAFI);
		if (!age.error && age.data?.data != null) cache.set("demografi:age", age.data.data, TTL.DEMOGRAFI);
		if (!occupation.error && occupation.data?.data != null) cache.set("demografi:occupation", occupation.data.data, TTL.DEMOGRAFI);
		if (!religion.error && religion.data?.data != null) cache.set("demografi:religion", religion.data.data, TTL.DEMOGRAFI);
		if (!births.error && births.data?.data != null) cache.set("demografi:births", births.data.data, TTL.DEMOGRAFI);
		if (!deaths.error && deaths.data?.data != null) cache.set("demografi:deaths", deaths.data.data, TTL.DEMOGRAFI);
		if (!migration.error && migration.data?.data != null) cache.set("demografi:migration", migration.data.data, TTL.DEMOGRAFI);
		if (!sectors.error && sectors.data?.data != null) cache.set("demografi:sectors", sectors.data.data, TTL.DEMOGRAFI);
		if (!apbdes.error && apbdesData != null) cache.set("apbdes:cmk-apbdes-001", apbdesData, TTL.APBDES);

		const durationMs = Date.now() - startedAt.getTime();
		const recordsAffected = 10 - failed;

		await prisma.syncLog.update({
			where: { id: logEntry.id },
			data: {
				status: failed === 10 ? "error" : "success",
				durationMs,
				recordsAffected,
				errorMessage: failed > 0 ? `${failed} endpoint gagal` : null,
			},
		});

		logger.info(
			"[SyncJob] Demografi sync completed in %dms (%d failed)",
			durationMs,
			failed,
		);
	} catch (err) {
		const durationMs = Date.now() - startedAt.getTime();
		const errorMessage =
			err instanceof Error ? err.message : JSON.stringify(err);

		await prisma.syncLog.update({
			where: { id: logEntry.id },
			data: {
				status: "error",
				durationMs,
				errorMessage: errorMessage.slice(0, 500),
			},
		});

		logger.error({ err }, "[SyncJob] Demografi sync failed");
	}
}

// Track last run to avoid double-firing within the same minute
let lastNocRun = "";
let lastDemografiRun = "";

export function startSyncScheduler(): void {
	logger.info(
		"[SyncJob] Scheduler started — NOC @ 02:00 daily, Demografi @ 03:00 Sunday",
	);

	setInterval(() => {
		const now = new Date();
		const hh = now.getHours().toString().padStart(2, "0");
		const mm = now.getMinutes().toString().padStart(2, "0");
		const dow = now.getDay(); // 0 = Sunday
		const key = `${now.toISOString().slice(0, 10)}-${hh}${mm}`;

		// NOC sync setiap hari jam 02:00
		if (hh === "02" && mm === "00" && lastNocRun !== key) {
			lastNocRun = key;
			runNocSync().catch((err) =>
				logger.error({ err }, "[SyncJob] Unhandled NOC error"),
			);
		}

		// Demografi sync setiap Minggu jam 03:00
		if (hh === "03" && mm === "00" && dow === 0 && lastDemografiRun !== key) {
			lastDemografiRun = key;
			runDemografiSync().catch((err) =>
				logger.error({ err }, "[SyncJob] Unhandled Demografi error"),
			);
		}
	}, 60_000);
}

// Expose untuk trigger manual dari API
export { runNocSync, runDemografiSync };
