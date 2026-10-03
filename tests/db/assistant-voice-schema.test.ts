import { afterAll, describe, expect, it } from "bun:test";
import { prisma } from "@/utils/db";
import { assertTestDatabase } from "./test-database";

/**
 * Migrasi `add_assistant_voice_s1`: izin use-ai-voice tersisip, default
 * pengaturan suara, penanda modalitas pesan, tabel sesi & persetujuan suara
 * (cascade saat user dihapus).
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL = `voice-${RUN_ID}@assistant-voice-schema.test.local`; // test-only

afterAll(async () => {
	await prisma.user.deleteMany({ where: { email: EMAIL } });
	await prisma.$disconnect();
});

describe("migrasi add_assistant_voice_s1", () => {
	it("izin use-ai-voice tersisip untuk admin & user", async () => {
		const rows = await prisma.rolePermission.findMany({
			where: { feature: "use-ai-voice" },
			select: { role: true, allowed: true },
			orderBy: { role: "asc" },
		});
		expect(rows).toEqual([
			{ role: "admin", allowed: true },
			{ role: "user", allowed: true },
		]);
	});

	it("default pengaturan suara sesuai 06 §9.1 (tanpa menulis)", async () => {
		const rollback = new Error("rollback");
		const seen: { settings?: unknown } = {};
		await prisma
			.$transaction(async (tx) => {
				await tx.assistantSettings.deleteMany({});
				seen.settings = await tx.assistantSettings.create({ data: {} });
				throw rollback;
			})
			.catch((err) => {
				if (err !== rollback) throw err;
			});
		expect(seen.settings).toMatchObject({
			voiceDailyMinutesUser: 60,
			voiceDailyMinutesKiosk: 60,
			voiceSessionMaxMinutes: 10,
			voiceIdleOffSeconds: 120,
			voiceLiveModel: "gpt-live-1",
			voiceName: null,
			voiceReadExactInstruction: null,
		});
	});

	it("pesan default modality 'text'; sesi & persetujuan ikut terhapus bersama user", async () => {
		const user = await prisma.user.create({ data: { email: EMAIL } });
		const conversation = await prisma.assistantConversation.create({
			data: {
				userId: user.id,
				messages: {
					create: [
						{ userId: user.id, role: "user", content: "halo" },
						{
							userId: user.id,
							role: "user",
							content: "halo suara",
							modality: "voice",
						},
					],
				},
			},
			include: { messages: { orderBy: { content: "asc" } } },
		});
		expect(conversation.messages.map((m) => m.modality)).toEqual([
			"text",
			"voice",
		]);

		const session = await prisma.assistantVoiceSession.create({
			data: { userId: user.id },
		});
		expect(session).toMatchObject({
			status: "starting",
			billedSeconds: 0,
			extendedSeconds: 0,
			endedAt: null,
			endReason: null,
		});
		await prisma.assistantVoiceConsent.create({ data: { userId: user.id } });

		await prisma.user.delete({ where: { id: user.id } });
		expect(
			await prisma.assistantVoiceSession.count({ where: { userId: user.id } }),
		).toBe(0);
		expect(
			await prisma.assistantVoiceConsent.count({ where: { userId: user.id } }),
		).toBe(0);
	});
});
