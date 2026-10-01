import { describe, expect, it } from "bun:test";
import {
	CHAT_MESSAGES,
	type ChatServiceDeps,
	type ChatTurnInput,
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

/** runChatTurn: urutan cek, kuota, riwayat dari server, penyimpanan, error provider. */

const NOW = new Date("2026-10-01T02:00:00Z");
const ALL_FEATURES = [
	"use-ai-assistant",
	"view-dashboard",
	"view-keuangan",
	"view-pengaduan",
];

const keuanganTool: ToolDefinition = {
	name: "ringkasan_keuangan",
	description: "keuangan",
	parameters: { type: "object", properties: {} },
	requiredFeature: "view-keuangan",
	handler: async () => ({ ok: true, data: { totalAnggaran: 1000 } }),
};

function principal(features = ALL_FEATURES, id = "u1") {
	return { user: { id, role: "user" }, allowedFeatures: features };
}

function setup(steps: MockStep[] = [], o: Partial<ChatServiceDeps> = {}) {
	const memory = createMemoryRepo();
	const provider = new MockProvider(steps);
	const deps: ChatServiceDeps = {
		loadSettings: async () => enabledSettings(),
		resolveProvider: async () => ({
			ok: true,
			provider,
			slot: "chat",
			model: "mock",
		}),
		getUsage: async () => ({ messagesToday: 0, tokensToday: 0 }),
		rateLimiter: new SlidingWindowRateLimiter(),
		tools: [keuanganTool],
		repo: memory.repo,
		now: () => NOW,
		...o,
	};
	const turn = (input: Partial<ChatTurnInput> = {}) =>
		runChatTurn({ principal: principal(), message: "Halo", ...input }, deps);
	return { ...memory, provider, deps, turn };
}

describe("runChatTurn — penolakan", () => {
	it("asisten mati → 409", async () => {
		const { turn } = setup([], {
			loadSettings: async () => enabledSettings({ enabled: false }),
		});
		expect(await turn()).toEqual({
			ok: false,
			status: 409,
			error: CHAT_MESSAGES.disabled,
		});
	});

	it("slot chat belum siap → 409", async () => {
		const { turn } = setup([], {
			resolveProvider: async () => ({ ok: false, reason: "not_configured" }),
		});
		expect(await turn()).toMatchObject({
			status: 409,
			error: CHAT_MESSAGES.notReady,
		});
	});

	it("input kosong / terlalu panjang → 422", async () => {
		const { turn } = setup([], {
			loadSettings: async () => enabledSettings({ maxInputChars: 10 }),
		});
		expect(await turn({ message: "   " })).toMatchObject({ status: 422 });
		expect(await turn({ message: "x".repeat(11) })).toMatchObject({
			status: 422,
			error: "Pesan terlalu panjang. Maksimal 10 karakter.",
		});
	});

	it("percakapan milik user lain → 404, provider tidak dipanggil", async () => {
		const { turn, repo, provider } = setup();
		const other = await repo.startConversation("u2", "rahasia", [
			{ role: "user", content: "rahasia" },
		]);
		expect(await turn({ conversationId: other.conversationId })).toMatchObject({
			status: 404,
		});
		expect(provider.calls).toHaveLength(0);
	});

	it("rate per menit → 429 dengan retryAfterSec", async () => {
		const { turn } = setup([], {
			loadSettings: async () => enabledSettings({ ratePerMinutePerUser: 1 }),
		});
		expect((await turn()).ok).toBe(true);
		expect(await turn()).toMatchObject({
			status: 429,
			error: "Terlalu cepat, coba lagi sebentar.",
			retryAfterSec: 60,
		});
	});

	it("kuota harian user habis → 429", async () => {
		const { turn } = setup([], {
			getUsage: async () => ({ messagesToday: 50, tokensToday: 0 }),
		});
		expect(await turn()).toMatchObject({
			status: 429,
			error: "Kuota harian habis.",
		});
	});

	it("akun kiosk memakai dailyMessageLimitKiosk, bukan batas per user", async () => {
		const deps = {
			loadSettings: async () =>
				enabledSettings({
					kioskUserId: "kiosk",
					dailyMessageLimitPerUser: 50,
					dailyMessageLimitKiosk: 100,
				}),
			getUsage: async () => ({ messagesToday: 60, tokensToday: 0 }),
		};
		const { turn } = setup([], deps);
		expect(
			(await turn({ principal: principal(ALL_FEATURES, "kiosk") })).ok,
		).toBe(true);
		expect(
			await turn({ principal: principal(ALL_FEATURES, "biasa") }),
		).toMatchObject({
			status: 429,
		});
	});

	it("token global harian habis → 429", async () => {
		const { turn } = setup([], {
			getUsage: async () => ({ messagesToday: 0, tokensToday: 1_000_000 }),
		});
		expect(await turn()).toMatchObject({
			status: 429,
			error: "Kuota harian asisten habis.",
		});
	});
});

describe("runChatTurn — alur end-to-end MockProvider", () => {
	it("percakapan baru: tool dipanggil, jawaban & token tersimpan, actions kosong", async () => {
		const { turn, messages } = setup([
			{
				type: "tool_calls",
				toolCalls: [{ id: "c1", name: "ringkasan_keuangan", args: {} }],
				usage: { inputTokens: 100, outputTokens: 10 },
			},
			{
				type: "text",
				text: "Total anggaran Rp 1.000.",
				usage: { inputTokens: 50, outputTokens: 20 },
			},
		]);
		const res = await turn({
			message: "Berapa anggaran desa?",
			pageContext: { route: "/keuangan-anggaran", lang: "id" },
		});
		if (!res.ok) throw new Error(`harus ok: ${res.error}`);
		expect(res.value).toEqual({
			conversationId: expect.any(String),
			message: {
				id: expect.any(String),
				role: "assistant",
				content: "Total anggaran Rp 1.000.",
				toolsUsed: ["ringkasan_keuangan"],
				createdAt: expect.any(String),
			},
			actions: [],
		});
		expect(messages.map((m) => [m.role, m.status, m.pageRoute])).toEqual([
			["user", "ok", "/keuangan-anggaran"],
			["assistant", "ok", "/keuangan-anggaran"],
		]);
		expect(messages[1]).toMatchObject({ inputTokens: 150, outputTokens: 30 });
	});

	it("riwayat dimuat server dari percakapan (historyWindow), bukan dari klien", async () => {
		const { turn, provider } = setup(
			[
				{ type: "text", text: "Jawaban pertama" },
				{ type: "text", text: "Jawaban kedua" },
			],
			{ loadSettings: async () => enabledSettings({ historyWindow: 2 }) },
		);
		const first = await turn({ message: "Pertanyaan pertama" });
		if (!first.ok) throw new Error("harus ok");
		await turn({
			message: "Pertanyaan kedua",
			conversationId: first.value.conversationId,
		});
		const second = provider.calls[1]?.messages ?? [];
		expect(second.map((m) => m.role)).toEqual([
			"system",
			"user",
			"assistant",
			"user",
		]);
		expect(second.slice(1).map((m) => m.content)).toEqual([
			"Pertanyaan pertama",
			"Jawaban pertama",
			"Pertanyaan kedua",
		]);
	});

	it("prompt sistem memuat konteks halaman & modul yang tidak diizinkan; tool difilter izin", async () => {
		const berandaTool: ToolDefinition = {
			...keuanganTool,
			name: "ringkasan_beranda",
			requiredFeature: "view-dashboard",
		};
		const { turn, provider } = setup([{ type: "text", text: "ok" }], {
			tools: [keuanganTool, berandaTool],
		});
		await turn({
			principal: principal(["use-ai-assistant", "view-dashboard"]),
			pageContext: {
				route: "/keuangan-anggaran",
				title: "Keuangan",
				lang: "en",
			},
		});
		const call = provider.calls[0];
		const system = call?.messages[0]?.content ?? "";
		expect(system).toContain("(/keuangan-anggaran)");
		expect(system).toContain("TIDAK punya akses ke modul");
		expect(system).toContain("Keuangan & Anggaran");
		expect(system).toContain("Answer in English");
		expect(call?.toolNames).toEqual(["ringkasan_beranda"]);
	});

	it("tanpa tool data sama sekali → prompt menyatakan tidak punya akses data", async () => {
		const { turn, provider } = setup([{ type: "text", text: "ok" }]);
		await turn({ principal: principal(["use-ai-assistant"]) });
		expect(provider.calls[0]?.messages[0]?.content).toContain(
			"tidak memiliki akses ke modul data mana pun",
		);
		expect(provider.calls[0]?.toolNames).toEqual([]);
	});

	it("LLM memanggil tool yang tidak diizinkan → ditolak executor, toolsUsed kosong", async () => {
		const handlerCalls: string[] = [];
		const { turn, provider } = setup(
			[
				{
					type: "tool_calls",
					toolCalls: [{ id: "c1", name: "ringkasan_keuangan", args: {} }],
				},
				{ type: "text", text: "Anda tidak punya akses ke modul Keuangan." },
			],
			{
				tools: [
					{
						...keuanganTool,
						handler: async () => {
							handlerCalls.push("dipanggil");
							return { ok: true, data: {} };
						},
					},
				],
			},
		);
		const res = await turn({ principal: principal(["use-ai-assistant"]) });
		if (!res.ok) throw new Error("harus ok");
		expect(handlerCalls).toEqual([]);
		expect(res.value.message.toolsUsed).toEqual([]);
		expect(provider.calls[1]?.messages.at(-1)?.content).toContain(
			"tidak tersedia untuk pengguna ini",
		);
	});
});

describe("runChatTurn — kegagalan provider", () => {
	it("provider tidak tersedia → 503, pertanyaan tersimpan berstatus error", async () => {
		const { turn, messages } = setup([
			new AiProviderError("unavailable", "upstream 502", 502),
		]);
		const res = await turn({ message: "Ringkas desa" });
		expect(res).toEqual({
			ok: false,
			status: 503,
			error: CHAT_MESSAGES.unavailable,
			conversationId: expect.any(String),
		});
		expect(messages.map((m) => [m.role, m.status])).toEqual([
			["user", "error"],
		]);
	});

	it("provider sibuk → 503 pesan sibuk; percakapan lama dipakai", async () => {
		const { turn } = setup([
			{ type: "text", text: "ok" },
			new AiProviderError("busy", "429", 429),
		]);
		const first = await turn();
		if (!first.ok) throw new Error("harus ok");
		expect(await turn({ conversationId: first.value.conversationId })).toEqual({
			ok: false,
			status: 503,
			error: CHAT_MESSAGES.busy,
			conversationId: first.value.conversationId,
		});
	});

	it("error non-provider dicatat lalu diteruskan", async () => {
		const { turn, messages } = setup([new Error("bug internal")]);
		await expect(turn()).rejects.toThrow("Assistant turn failed for user u1");
		expect(messages.map((m) => m.status)).toEqual(["error"]);
	});
});
