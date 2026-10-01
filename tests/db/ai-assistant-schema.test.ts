import { afterAll, describe, expect, it } from "bun:test";
import { prisma } from "@/utils/db";
import { assertTestDatabase } from "./test-database";

/**
 * P1 pondasi AI Assistant: migrasi `add_ai_assistant` menyisipkan izin
 * `use-ai-assistant`, default tabel sesuai rancangan, dan relasi cascade
 * User → AssistantConversation → AssistantMessage.
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL = `assistant-${RUN_ID}@ai-assistant-schema.test.local`; // test-only

afterAll(async () => {
	await prisma.user.deleteMany({ where: { email: EMAIL } });
	await prisma.$disconnect();
});

describe("migrasi add_ai_assistant", () => {
	it("izin use-ai-assistant tersisip untuk admin & user", async () => {
		const rows = await prisma.rolePermission.findMany({
			where: { feature: "use-ai-assistant" },
			select: { role: true, allowed: true },
			orderBy: { role: "asc" },
		});
		expect(rows).toEqual([
			{ role: "admin", allowed: true },
			{ role: "user", allowed: true },
		]);
	});

	it("default AssistantSettings & AiProviderConfig sesuai rancangan (tanpa menulis)", async () => {
		// Hanya membangun nilai default lewat transaksi yang di-rollback, supaya
		// singleton di DB test tidak tertinggal.
		const before = await prisma.assistantSettings.count();
		const rollback = new Error("rollback");
		let settings: unknown;
		let slot: unknown;
		await prisma
			.$transaction(async (tx) => {
				settings = await tx.assistantSettings.create({ data: {} });
				slot = await tx.aiProviderConfig.create({ data: { feature: "chat" } });
				throw rollback;
			})
			.catch((err) => {
				if (err !== rollback) throw err;
			});

		expect(settings).toMatchObject({
			id: "singleton",
			enabled: false,
			assistantName: "Jenna",
			personaNote: null,
			dailyMessageLimitPerUser: 50,
			dailyTokenLimitGlobal: 1000000,
			ratePerMinutePerUser: 6,
			maxInputChars: 2000,
			historyWindow: 20,
			retentionDays: 90,
		});
		expect(slot).toMatchObject({
			feature: "chat",
			enabled: false,
			providerType: "openai-compatible",
			apiKeyEnc: null,
			temperature: null,
			maxTokens: null,
			timeoutMs: 60000,
		});
		expect(await prisma.assistantSettings.count()).toBe(before);
	});

	it("hapus user ikut menghapus percakapan & pesannya (cascade)", async () => {
		const user = await prisma.user.create({ data: { email: EMAIL } });
		const conversation = await prisma.assistantConversation.create({
			data: {
				userId: user.id,
				messages: {
					create: [
						{ userId: user.id, role: "user", content: "halo" },
						{
							userId: user.id,
							role: "assistant",
							content: "hai",
							toolsUsed: ["ringkasan_beranda"],
						},
					],
				},
			},
			include: { messages: true },
		});
		expect(conversation.title).toBe("Percakapan baru");
		expect(conversation.messages).toHaveLength(2);

		await prisma.user.delete({ where: { id: user.id } });

		expect(
			await prisma.assistantConversation.count({
				where: { id: conversation.id },
			}),
		).toBe(0);
		expect(
			await prisma.assistantMessage.count({
				where: { conversationId: conversation.id },
			}),
		).toBe(0);
	});
});
