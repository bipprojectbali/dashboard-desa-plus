import type { Prisma } from "generated/prisma";
import { prisma } from "@/utils/db";
import type { VoiceSessionRow } from "./voice.quota";

/**
 * Akses DB mode suara: persetujuan mikrofon dan baris `AssistantVoiceSession`.
 * Hanya stempel waktu & durasi — tidak ada audio atau isi transkrip.
 */

const OPEN_WHERE: Prisma.AssistantVoiceSessionWhereInput = {
	status: { in: ["starting", "active"] },
	endedAt: null,
};

export interface VoiceSessionClose {
	endedAt: Date;
	billedSeconds: number;
	endReason: string;
	status?: "ended" | "failed";
}

/** Sudah menyetujui banner mikrofon? */
export async function hasConsent(userId: string): Promise<boolean> {
	const row = await prisma.assistantVoiceConsent.findUnique({
		where: { userId },
		select: { userId: true },
	});
	return row !== null;
}

/** Simpan persetujuan (idempoten — tanggal pertama dipertahankan). */
export async function acceptConsent(userId: string): Promise<void> {
	await prisma.assistantVoiceConsent.upsert({
		where: { userId },
		create: { userId },
		update: {},
	});
}

export function findSession(id: string): Promise<VoiceSessionRow | null> {
	return prisma.assistantVoiceSession.findUnique({ where: { id } });
}

/** Sesi user yang masih tercatat terbuka, terlama dulu (urutan = pemenang kunci satu-sesi). */
export function findOpenSessions(userId: string): Promise<VoiceSessionRow[]> {
	return prisma.assistantVoiceSession.findMany({
		where: { userId, ...OPEN_WHERE },
		orderBy: [{ startedAt: "asc" }, { id: "asc" }],
	});
}

export function createSession(
	userId: string,
	now: Date,
): Promise<VoiceSessionRow> {
	return prisma.assistantVoiceSession.create({
		data: { userId, startedAt: now, lastHeartbeatAt: now },
	});
}

/** Sesi tersambung: hitungan menit dimulai sekarang (waktu tunggu OpenAI tidak ditagih). */
export async function activateSession(id: string, now: Date): Promise<void> {
	await prisma.assistantVoiceSession.update({
		where: { id },
		data: { status: "active", startedAt: now, lastHeartbeatAt: now },
	});
}

export async function touchHeartbeat(id: string, now: Date): Promise<void> {
	await prisma.assistantVoiceSession.updateMany({
		where: { id, ...OPEN_WHERE },
		data: { lastHeartbeatAt: now },
	});
}

export async function addExtension(id: string, seconds: number): Promise<void> {
	await prisma.assistantVoiceSession.updateMany({
		where: { id, ...OPEN_WHERE },
		data: { extendedSeconds: { increment: seconds } },
	});
}

/** Tutup sesi bila masih terbuka; false = sudah ditutup permintaan lain lebih dulu. */
export async function closeSession(
	id: string,
	close: VoiceSessionClose,
): Promise<boolean> {
	const result = await prisma.assistantVoiceSession.updateMany({
		where: { id, ...OPEN_WHERE },
		data: {
			status: close.status ?? "ended",
			endedAt: close.endedAt,
			billedSeconds: close.billedSeconds,
			endReason: close.endReason,
		},
	});
	return result.count > 0;
}

/** Total detik tertagih dari sesi yang sudah ditutup dan dimulai sejak `since`. */
export async function sumBilledSince(
	userId: string,
	since: Date,
): Promise<number> {
	const result = await prisma.assistantVoiceSession.aggregate({
		where: { userId, startedAt: { gte: since }, endedAt: { not: null } },
		_sum: { billedSeconds: true },
	});
	return result._sum.billedSeconds ?? 0;
}

export type VoiceSessionRepo = {
	hasConsent: typeof hasConsent;
	acceptConsent: typeof acceptConsent;
	findSession: typeof findSession;
	findOpenSessions: typeof findOpenSessions;
	createSession: typeof createSession;
	activateSession: typeof activateSession;
	touchHeartbeat: typeof touchHeartbeat;
	addExtension: typeof addExtension;
	closeSession: typeof closeSession;
	sumBilledSince: typeof sumBilledSince;
};
