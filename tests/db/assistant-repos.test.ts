import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
	DEFAULT_ASSISTANT_SETTINGS,
	getAssistantSettings,
	getProviderConfigs,
	invalidateAssistantConfigCache,
} from "@/api/assistant/config/settings.repo";
import {
	appendMessages,
	createConversation,
	deleteConversation,
	getConversation,
	getRecentMessages,
	listConversations,
	listMessages,
	renameConversation,
	startConversation,
} from "@/api/assistant/conversation/conversation.repo";
import { getUsageToday } from "@/api/assistant/limits/usage.repo";
import { prisma } from "@/utils/db";
import { assertTestDatabase } from "./test-database";

/**
 * Repo AI assistant di DB nyata: pengaturan dibaca tanpa menulis,
 * percakapan selalu dibatasi pemiliknya, pemakaian harian dihitung dari
 * AssistantMessage (hari WITA).
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL_DOMAIN = "assistant-repos.test.local"; // test-only

let alice: string;
let bob: string;

async function createUser(label: string) {
	const user = await prisma.user.create({
		data: { email: `${label}-${RUN_ID}@${EMAIL_DOMAIN}`, emailVerified: true },
	});
	return user.id;
}

beforeAll(async () => {
	alice = await createUser("alice");
	bob = await createUser("bob");
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	invalidateAssistantConfigCache();
	await prisma.$disconnect();
});

describe("settings.repo", () => {
	it("tanpa baris → nilai default, dan tidak menulis ke DB", async () => {
		const settingsBefore = await prisma.assistantSettings.count();
		const providersBefore = await prisma.aiProviderConfig.count();
		invalidateAssistantConfigCache();

		const settings = await getAssistantSettings();
		const providers = await getProviderConfigs();

		if (settingsBefore === 0)
			expect(settings).toEqual(DEFAULT_ASSISTANT_SETTINGS);
		expect(Object.keys(providers).sort()).toEqual(["chat", "pointer", "voice"]);
		expect(await prisma.assistantSettings.count()).toBe(settingsBefore);
		expect(await prisma.aiProviderConfig.count()).toBe(providersBefore);
	});
});

describe("conversation.repo — kepemilikan", () => {
	it("user B tidak bisa membaca, mengganti judul, menambah pesan, atau menghapus percakapan user A", async () => {
		const conv = await createConversation(
			alice,
			"Berapa total belanja desa tahun ini?",
		);
		expect(conv.title).toBe("Berapa total belanja desa tahun ini?");

		expect(await getConversation(bob, conv.id)).toBeNull();
		expect(await listMessages(bob, conv.id)).toBeNull();
		expect(await getRecentMessages(bob, conv.id)).toEqual([]);
		expect(await renameConversation(bob, conv.id, "dibajak")).toBe(false);
		expect(
			await appendMessages(bob, conv.id, [{ role: "user", content: "x" }]),
		).toBeNull();
		expect(await deleteConversation(bob, conv.id)).toBe(false);
		expect((await listConversations(bob)).items).toEqual([]);
		expect((await listConversations(bob, { cursor: conv.id })).items).toEqual(
			[],
		);

		const stillThere = await getConversation(alice, conv.id);
		expect(stillThere?.title).toBe("Berapa total belanja desa tahun ini?");
		expect(
			await prisma.assistantMessage.count({
				where: { conversationId: conv.id },
			}),
		).toBe(0);
	});

	it("riwayat untuk LLM: urut lama → baru, hanya status ok, dibatasi take", async () => {
		const conv = await createConversation(alice);
		expect(conv.title).toBe("Percakapan baru");
		await appendMessages(alice, conv.id, [
			{ role: "user", content: "q1" },
			{ role: "assistant", content: "a1", toolsUsed: ["ringkasan_keuangan"] },
		]);
		await appendMessages(alice, conv.id, [
			{ role: "user", content: "q2" },
			{ role: "assistant", content: "gagal", status: "error" },
		]);
		await appendMessages(alice, conv.id, [
			{ role: "user", content: "q3" },
			{ role: "assistant", content: "a3" },
		]);

		expect(
			(await getRecentMessages(alice, conv.id)).map((m) => m.content),
		).toEqual(["q1", "a1", "q2", "q3", "a3"]);
		expect(
			(await getRecentMessages(alice, conv.id, 2)).map((m) => m.content),
		).toEqual(["q3", "a3"]);
	});

	it("daftar percakapan & pesan berhalaman dengan cursor", async () => {
		const ids: string[] = [];
		for (let i = 0; i < 3; i++)
			ids.push((await createConversation(bob, `topik ${i}`)).id);

		const first = await listConversations(bob, { limit: 2 });
		expect(first.items).toHaveLength(2);
		expect(first.nextCursor).not.toBeNull();
		const second = await listConversations(bob, {
			limit: 2,
			cursor: first.nextCursor ?? undefined,
		});
		const all = [...first.items, ...second.items].map((c) => c.id);
		expect(new Set(all)).toEqual(new Set(ids));
		expect(second.nextCursor).toBeNull();

		const conv = ids[0] as string;
		await appendMessages(bob, conv, [
			{ role: "user", content: "m1" },
			{ role: "assistant", content: "m2" },
			{ role: "user", content: "m3" },
		]);
		const page1 = await listMessages(bob, conv, { limit: 2 });
		expect(page1?.items.map((m) => m.content)).toEqual(["m3", "m2"]);
		const page2 = await listMessages(bob, conv, {
			limit: 2,
			cursor: page1?.nextCursor ?? undefined,
		});
		expect(page2?.items.map((m) => m.content)).toEqual(["m1"]);
	});

	it("startConversation & appendMessages mengembalikan pesan tersimpan berurutan", async () => {
		const started = await startConversation(alice, "  Berapa   APBDes?  ", [
			{
				role: "user",
				content: "Berapa APBDes?",
				pageRoute: "/keuangan-anggaran",
			},
			{
				role: "assistant",
				content: "Rp 1",
				toolsUsed: ["ringkasan_keuangan"],
				inputTokens: 10,
				outputTokens: 5,
			},
		]);
		expect(started.messages.map((m) => m.role)).toEqual(["user", "assistant"]);
		expect(started.messages[1]?.toolsUsed).toEqual(["ringkasan_keuangan"]);
		expect((await getConversation(alice, started.conversationId))?.title).toBe(
			"Berapa APBDes?",
		);

		const more = await appendMessages(alice, started.conversationId, [
			{ role: "user", content: "lagi" },
			{ role: "assistant", content: "ok" },
		]);
		expect(more?.map((m) => m.content)).toEqual(["lagi", "ok"]);
		expect(more?.[0]?.id).toEqual(expect.any(String));
		expect(
			(await getRecentMessages(alice, started.conversationId)).map(
				(m) => m.content,
			),
		).toEqual(["Berapa APBDes?", "Rp 1", "lagi", "ok"]);
	});

	it("ganti judul & hapus oleh pemilik; pesan ikut terhapus", async () => {
		const conv = await createConversation(alice, "lama");
		await appendMessages(alice, conv.id, [{ role: "user", content: "hai" }]);
		expect(
			await renameConversation(alice, conv.id, `  ${"x".repeat(100)}  `),
		).toBe(true);
		expect((await getConversation(alice, conv.id))?.title).toHaveLength(60);
		expect(await deleteConversation(alice, conv.id)).toBe(true);
		expect(
			await prisma.assistantMessage.count({
				where: { conversationId: conv.id },
			}),
		).toBe(0);
	});
});

describe("usage.repo", () => {
	it("menghitung pesan user hari ini (WITA) & token global", async () => {
		const carol = await createUser("carol");
		const before = await getUsageToday(carol);
		expect(before.messagesToday).toBe(0);

		const conv = await createConversation(carol);
		await appendMessages(carol, conv.id, [
			{ role: "user", content: "q" },
			{ role: "assistant", content: "a", inputTokens: 100, outputTokens: 20 },
			{ role: "user", content: "q2" },
		]);
		// Pesan kemarin (WITA) tidak dihitung
		await prisma.assistantMessage.create({
			data: {
				conversationId: conv.id,
				userId: carol,
				role: "user",
				content: "kemarin",
				inputTokens: 999,
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			},
		});

		const after = await getUsageToday(carol);
		expect(after.messagesToday).toBe(2);
		expect(after.tokensToday - before.tokensToday).toBe(120);
	});

	it("pertanyaan yang gagal (status error) tidak dihitung kuota pesan maupun token", async () => {
		const dave = await createUser("dave");
		const before = await getUsageToday(dave);
		const conv = await createConversation(dave);
		await appendMessages(dave, conv.id, [
			{ role: "user", content: "gagal", status: "error", inputTokens: 500 },
			{ role: "user", content: "berhasil" },
			{ role: "assistant", content: "a", inputTokens: 7, outputTokens: 3 },
		]);

		const after = await getUsageToday(dave);
		expect(after.messagesToday).toBe(1);
		expect(after.tokensToday - before.tokensToday).toBe(10);
		// Tetap tersimpan untuk "error terakhir" di statistik admin.
		expect(
			await prisma.assistantMessage.count({
				where: { conversationId: conv.id, status: "error" },
			}),
		).toBe(1);
	});
});
