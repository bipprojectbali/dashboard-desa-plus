import { describe, expect, it } from "bun:test";
import {
	type ChatTurnInput,
	CLIENT_CLOSED,
	runChatTurn,
} from "@/api/assistant/chat/chat.service";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider, type MockStep } from "@/api/assistant/provider/mock";
import { AiProviderError } from "@/api/assistant/provider/types";
import type { ToolDefinition } from "@/api/assistant/tools/types";
import {
	createMemoryRepo,
	enabledSettings,
} from "./__fixtures__/memory-chat-repo";

/** runChatTurn mode stream: urutan status/delta, pembatalan klien, error di tengah stream. */

const keuanganTool: ToolDefinition = {
	name: "ringkasan_keuangan",
	description: "keuangan",
	parameters: { type: "object", properties: {} },
	requiredFeature: "view-keuangan",
	handler: async () => ({ ok: true, data: { totalAnggaran: 1000 } }),
};

/** Langkah provider yang menunggu sampai giliran dibatalkan, lalu gagal seperti fetch. */
const hangUntilAbort: MockStep = (_m, opts) =>
	new Promise((_, reject) => {
		opts.signal?.addEventListener("abort", () =>
			reject(new AiProviderError("unavailable", "aborted")),
		);
	});

function setup(steps: MockStep[]) {
	const memory = createMemoryRepo();
	const events: Array<[string, string]> = [];
	const turn = (input: Partial<ChatTurnInput> = {}) =>
		runChatTurn(
			{
				principal: {
					user: { id: "u1", role: "user" },
					allowedFeatures: ["use-ai-assistant", "view-keuangan"],
				},
				message: "Berapa anggaran?",
				stream: {
					onStatus: (tool) => events.push(["status", tool]),
					onDelta: (text) => events.push(["delta", text]),
				},
				...input,
			},
			{
				loadSettings: async () => enabledSettings(),
				resolveProvider: async () => ({
					ok: true,
					provider: new MockProvider(steps),
					slot: "chat",
					model: "mock",
				}),
				getUsage: async () => ({ messagesToday: 0, tokensToday: 0 }),
				rateLimiter: new SlidingWindowRateLimiter(),
				tools: [keuanganTool],
				repo: memory.repo,
			},
		);
	return { ...memory, events, turn };
}

describe("runChatTurn — stream", () => {
	it("teks pengantar → status tool → delta jawaban akhir; done = gabungan delta terakhir", async () => {
		const { turn, events } = setup([
			{
				type: "tool_calls",
				text: "Saya cek. ",
				toolCalls: [{ id: "c1", name: "ringkasan_keuangan", args: {} }],
			},
			{ type: "text", text: "Anggaran Rp 1.000." },
		]);
		const res = await turn();
		if (!res.ok) throw new Error("harus ok");
		const statusAt = events.findIndex(([e]) => e === "status");
		expect(events[statusAt]).toEqual(["status", "ringkasan_keuangan"]);
		expect(
			events
				.slice(0, statusAt)
				.map(([, t]) => t)
				.join(""),
		).toBe("Saya cek. ");
		const finalText = events
			.slice(statusAt + 1)
			.map(([, t]) => t)
			.join("");
		expect(finalText).toBe("Anggaran Rp 1.000.");
		expect(res.value.message.content).toBe(finalText);
	});

	it("dibatalkan klien sebelum jawaban selesai → 499 dan tidak ada yang disimpan", async () => {
		const controller = new AbortController();
		const { turn, messages, conversations } = setup([hangUntilAbort]);
		const pending = turn({ signal: controller.signal });
		setTimeout(() => controller.abort(), 5);
		expect(await pending).toMatchObject({ ok: false, status: CLIENT_CLOSED });
		expect(messages).toEqual([]);
		expect(conversations.size).toBe(0);
	});

	it("dibatalkan di percakapan lama → percakapan tidak bertambah pesan", async () => {
		const controller = new AbortController();
		const { turn, messages, repo } = setup([hangUntilAbort]);
		const conv = await repo.startConversation("u1", "lama", [
			{ role: "user", content: "lama" },
		]);
		const pending = turn({
			conversationId: conv.conversationId,
			signal: controller.signal,
		});
		setTimeout(() => controller.abort(), 5);
		await pending;
		expect(messages.map((m) => m.content)).toEqual(["lama"]);
	});

	it("provider gagal setelah tool berjalan → 503, pertanyaan tersimpan berstatus error", async () => {
		const { turn, events, messages } = setup([
			{
				type: "tool_calls",
				toolCalls: [{ id: "c1", name: "ringkasan_keuangan", args: {} }],
			},
			new AiProviderError("unavailable", "putus", 502),
		]);
		expect(await turn()).toMatchObject({ ok: false, status: 503 });
		expect(events).toEqual([["status", "ringkasan_keuangan"]]);
		expect(messages.map((m) => [m.role, m.status])).toEqual([
			["user", "error"],
		]);
	});
});
