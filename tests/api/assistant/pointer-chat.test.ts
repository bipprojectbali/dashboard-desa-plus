import { describe, expect, it } from "bun:test";
import {
	type ChatServiceDeps,
	type ChatTurnInput,
	runChatTurn,
} from "@/api/assistant/chat/chat.service";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider, type MockStep } from "@/api/assistant/provider/mock";
import { ASSISTANT_TOOLS } from "@/api/assistant/tools/registry";
import type { ToolDefinition } from "@/api/assistant/tools/types";
import { MAX_UI_ACTIONS } from "@/api/assistant/tools/ui-actions";
import {
	createMemoryRepo,
	enabledSettings,
} from "./__fixtures__/memory-chat-repo";

/** F2-b: aksi penunjuk keluar di `actions` (/chat dan `done` stream), hanya yang lolos validasi. */

const FEATURES = ["use-ai-assistant", "view-keuangan"];

const call = (name: string, args: Record<string, unknown>): MockStep => ({
	type: "tool_calls",
	toolCalls: [{ id: `c-${name}`, name, args }],
});

function setup(
	steps: MockStep[],
	o: { tools?: readonly ToolDefinition[]; features?: string[] } = {},
) {
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
		tools: o.tools ?? ASSISTANT_TOOLS,
		repo: createMemoryRepo().repo,
	};
	const turn = (input: Partial<ChatTurnInput> = {}) =>
		runChatTurn(
			{
				principal: {
					user: { id: "u1", role: "user" },
					allowedFeatures: o.features ?? FEATURES,
				},
				message: "Tunjukkan laporan APBDes",
				pageContext: { route: "/beranda" },
				...input,
			},
			deps,
		);
	return { provider, turn };
}

describe("runChatTurn — aksi penunjuk", () => {
	it("tunjukkan_elemen dari halaman lain → navigate + pointTo di actions", async () => {
		const { turn } = setup([
			call("tunjukkan_elemen", { target: "keuangan.laporan" }),
			{ type: "text", text: "Ini laporannya." },
		]);
		const res = await turn();
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([
			{ type: "navigate", route: "/keuangan-anggaran" },
			{ type: "pointTo", target: "keuangan.laporan" },
		]);
		expect(res.value.message.toolsUsed).toEqual(["tunjukkan_elemen"]);
	});

	it("sudah di halaman target → hanya pointTo", async () => {
		const { turn } = setup([
			call("tunjukkan_elemen", { target: "keuangan.laporan" }),
			{ type: "text", text: "Ini." },
		]);
		const res = await turn({ pageContext: { route: "/keuangan-anggaran" } });
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([
			{ type: "pointTo", target: "keuangan.laporan" },
		]);
	});

	it("mode stream: event done (= value) membawa actions yang sama", async () => {
		const { turn } = setup([
			call("tunjukkan_elemen", { target: "keuangan.laporan" }),
			{ type: "text", text: "Ini." },
		]);
		const res = await turn({
			stream: { onStatus: () => {}, onDelta: () => {} },
		});
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toHaveLength(2);
	});

	it("target tidak terdaftar / tanpa izin → tidak ada aksi", async () => {
		const unknown = setup([
			call("tunjukkan_elemen", { target: "karangan.llm" }),
			{ type: "text", text: "Maaf." },
		]);
		const a = await unknown.turn();
		if (!a.ok) throw new Error(a.error);
		expect(a.value.actions).toEqual([]);

		const noAccess = setup(
			[
				call("tunjukkan_elemen", { target: "keuangan.laporan" }),
				{ type: "text", text: "Maaf." },
			],
			{ features: ["use-ai-assistant"] },
		);
		const b = await noAccess.turn();
		if (!b.ok) throw new Error(b.error);
		expect(b.value.actions).toEqual([]);
	});

	it("target tulis tidak bisa diklik: klik_elemen ditolak, tanpa aksi", async () => {
		const { turn } = setup([
			call("klik_elemen", { target: "keuangan.laporan" }),
			{ type: "text", text: "Silakan tekan sendiri." },
		]);
		const res = await turn();
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([]);
	});

	it("bentuk aksi tidak valid dari tool dibuang; duplikat digabung; jumlah dibatasi", async () => {
		const noisy: ToolDefinition = {
			name: "tool_berisik",
			description: "tool uji",
			parameters: { type: "object", properties: {} },
			requiredFeature: "use-ai-assistant",
			handler: async () => ({
				ok: true,
				data: {
					actions: [
						{ type: "hapus_semua", target: "x" },
						{ type: "pointTo" },
						"bukan objek",
						{ type: "pointTo", target: "a" },
						{ type: "pointTo", target: "a" },
						...Array.from({ length: 10 }, (_, i) => ({
							type: "pointTo",
							target: `b${i}`,
						})),
					],
				},
			}),
		};
		const { turn } = setup(
			[call("tool_berisik", {}), { type: "text", text: "." }],
			{
				tools: [noisy],
			},
		);
		const res = await turn();
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toHaveLength(MAX_UI_ACTIONS);
		expect(res.value.actions[0]).toEqual({ type: "pointTo", target: "a" });
		expect(res.value.actions.every((a) => a.type === "pointTo")).toBe(true);
	});

	it("tanpa tool penunjuk yang jalan → actions kosong", async () => {
		const { turn } = setup([{ type: "text", text: "Halo." }]);
		const res = await turn({ message: "Halo" });
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([]);
	});
});

describe("runChatTurn — prompt penunjuk", () => {
	const systemPrompt = (p: MockProvider) => p.calls[0]?.messages[0]?.content;

	it("user ber-izin: prompt memuat aturan 'hanya bila diminta' + 'silakan tekan sendiri'", async () => {
		const { turn, provider } = setup([{ type: "text", text: "Halo." }]);
		await turn({ message: "Halo" });
		const prompt = systemPrompt(provider) ?? "";
		expect(prompt).toContain("Penunjuk di layar");
		expect(prompt).toContain("HANYA bila pengguna meminta");
		expect(prompt).toContain("silakan tekan sendiri");
		expect(prompt).toContain("Satu urutan aksi per jawaban");
	});

	it("tanpa tool penunjuk tersedia: aturan tidak dimuat", async () => {
		const { turn, provider } = setup([{ type: "text", text: "Halo." }], {
			tools: [],
		});
		await turn({ message: "Halo" });
		expect(systemPrompt(provider)).not.toContain("Penunjuk di layar");
	});
});
