import type {
	AssistantTodayStatsDto,
	KioskCandidateDto,
} from "@/types/ai-assistant-admin";
import { prisma } from "@/utils/db";
import { startOfDayWita } from "../limits/usage";

/** Batas kandidat akun kiosk di dropdown admin (user terverifikasi, urut nama). */
export const KIOSK_CANDIDATE_LIMIT = 500;

/** Statistik sejak 00:00 WITA dari AssistantMessage — tanpa isi pesan. */
export async function getTodayStats(
	now: Date = new Date(),
): Promise<AssistantTodayStatsDto> {
	const since = startOfDayWita(now);
	const [messages, tokens, users, lastError] = await Promise.all([
		prisma.assistantMessage.count({
			where: { role: "user", createdAt: { gte: since } },
		}),
		prisma.assistantMessage.aggregate({
			where: { createdAt: { gte: since } },
			_sum: { inputTokens: true, outputTokens: true },
		}),
		prisma.assistantMessage.groupBy({
			by: ["userId"],
			where: { role: "user", createdAt: { gte: since } },
		}),
		prisma.assistantMessage.findFirst({
			where: { status: "error", createdAt: { gte: since } },
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		}),
	]);
	return {
		messages,
		tokens: (tokens._sum.inputTokens ?? 0) + (tokens._sum.outputTokens ?? 0),
		activeUsers: users.length,
		lastErrorAt: lastError?.createdAt.toISOString() ?? null,
	};
}

/** User terverifikasi yang bisa dipilih sebagai akun kiosk `/wall`. */
export async function listKioskCandidates(): Promise<KioskCandidateDto[]> {
	const rows = await prisma.user.findMany({
		where: { emailVerified: true },
		select: { id: true, name: true, email: true },
		orderBy: { name: "asc" },
		take: KIOSK_CANDIDATE_LIMIT,
	});
	// `name` opsional di skema; email hanya untuk admin sebagai label pengganti.
	return rows.map((u) => ({ id: u.id, name: u.name?.trim() || u.email }));
}

/** True bila user ada dan sudah diverifikasi admin (syarat akun kiosk). */
export async function isVerifiedUser(userId: string): Promise<boolean> {
	const row = await prisma.user.findUnique({
		where: { id: userId },
		select: { emailVerified: true },
	});
	return row?.emailVerified === true;
}
