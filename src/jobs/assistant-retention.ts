import { getAssistantSettings } from "@/api/assistant/config/settings.repo";
import { prisma } from "@/utils/db";
import logger from "@/utils/logger";

/**
 * Job harian: hapus percakapan AI assistant yang tidak aktif lebih lama dari
 * `AssistantSettings.retentionDays` (0 = simpan selamanya). Pesan ikut
 * terhapus lewat cascade. Patokannya `updatedAt` percakapan (aktivitas
 * terakhir), jadi percakapan lama yang masih dipakai tidak hilang.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Jam lokal server saat job berjalan — di luar jam sync NOC (02:00) & demografi (03:00). */
export const RETENTION_RUN_HOUR = "04";

/** Batas waktu penghapusan; null bila retensi dimatikan (0 atau tidak valid). */
export function retentionCutoff(retentionDays: number, now: Date): Date | null {
	if (!Number.isInteger(retentionDays) || retentionDays <= 0) return null;
	return new Date(now.getTime() - retentionDays * DAY_MS);
}

/** Jalankan sekali; mengembalikan jumlah percakapan yang dihapus. */
export async function runAssistantRetention(
	now: Date = new Date(),
): Promise<number> {
	const { retentionDays } = await getAssistantSettings();
	const cutoff = retentionCutoff(retentionDays, now);
	if (!cutoff) return 0;
	const { count } = await prisma.assistantConversation.deleteMany({
		where: { updatedAt: { lt: cutoff } },
	});
	logger.info(
		{ deleted: count, retentionDays },
		"[AssistantRetention] Old conversations removed",
	);
	return count;
}

let lastRunDate = "";

/** Cek tiap menit, jalan sekali per hari pada RETENTION_RUN_HOUR:00 (pola sama dengan sync.ts). */
export function startAssistantRetentionScheduler(): void {
	logger.info(
		`[AssistantRetention] Scheduler started — daily @ ${RETENTION_RUN_HOUR}:00`,
	);
	setInterval(() => {
		const now = new Date();
		const hh = now.getHours().toString().padStart(2, "0");
		const today = now.toISOString().slice(0, 10);
		if (hh !== RETENTION_RUN_HOUR || now.getMinutes() !== 0) return;
		if (lastRunDate === today) return;
		lastRunDate = today;
		runAssistantRetention(now).catch((err) =>
			logger.error({ err }, "[AssistantRetention] Job failed"),
		);
	}, 60_000);
}
