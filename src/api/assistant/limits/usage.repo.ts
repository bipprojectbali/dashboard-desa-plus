import { prisma } from "@/utils/db";
import { startOfDayWita } from "./usage";

export interface UsageToday {
	/** Pesan role "user" milik user sejak 00:00 WITA. */
	messagesToday: number;
	/** Total token (input + output) semua user sejak 00:00 WITA. */
	tokensToday: number;
}

/** Hitung pemakaian hari ini (WITA) dari AssistantMessage — dua query paralel, memakai index (userId, createdAt) & (createdAt). */
export async function getUsageToday(
	userId: string,
	now: Date = new Date(),
): Promise<UsageToday> {
	const since = startOfDayWita(now);
	const [messagesToday, tokens] = await Promise.all([
		prisma.assistantMessage.count({
			where: { userId, role: "user", createdAt: { gte: since } },
		}),
		prisma.assistantMessage.aggregate({
			where: { createdAt: { gte: since } },
			_sum: { inputTokens: true, outputTokens: true },
		}),
	]);
	return {
		messagesToday,
		tokensToday:
			(tokens._sum.inputTokens ?? 0) + (tokens._sum.outputTokens ?? 0),
	};
}
