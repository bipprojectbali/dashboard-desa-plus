import { describe, expect, it } from "bun:test";
import { runChatTurn } from "@/api/assistant/chat/chat.service";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider } from "@/api/assistant/provider/mock";
import { ASSISTANT_TOOLS } from "@/api/assistant/tools/registry";
import type { ToolDefinition } from "@/api/assistant/tools/types";
import { FEATURES } from "@/utils/permission";
import { keywordRouterStep } from "./__fixtures__/keyword-router";
import {
	createMemoryRepo,
	enabledSettings,
} from "./__fixtures__/memory-chat-repo";

/**
 * Set evaluasi (03 §12, 04 §8): 18 pertanyaan contoh lewat runChatTurn dengan
 * deskripsi & izin tool ASLI, handler diganti rekaman (tanpa jaringan).
 * Memastikan tool yang benar terpilih dan tool tanpa izin tidak pernah jalan.
 */

const EVAL_SET: Array<{
	q: string;
	tool: string;
	args?: Record<string, unknown>;
}> = [
	{ q: "Ringkas kondisi desa hari ini", tool: "ringkasan_beranda" },
	{ q: "Berapa skor SDGs desa?", tool: "ringkasan_beranda" },
	{ q: "Agenda kegiatan mendatang minggu ini?", tool: "ringkasan_beranda" },
	{
		q: "Berapa persen realisasi APBDes tahun ini?",
		tool: "ringkasan_keuangan",
	},
	{ q: "Sektor dengan alokasi anggaran terbesar?", tool: "ringkasan_keuangan" },
	{ q: "Berapa dana bantuan yang sudah cair?", tool: "ringkasan_keuangan" },
	{
		q: "Berapa realisasi belanja desa tahun 2024?",
		tool: "ringkasan_keuangan",
		args: { tahun: 2024 },
	},
	{ q: "Ada berapa pengaduan aktif?", tool: "statistik_pengaduan" },
	{
		q: "Jenis surat apa yang paling banyak diajukan?",
		tool: "statistik_pengaduan",
	},
	{ q: "Tren pengaduan 7 bulan terakhir", tool: "statistik_pengaduan" },
	{ q: "Banjar dengan penduduk terbanyak?", tool: "statistik_demografi" },
	{ q: "Pekerjaan paling umum warga?", tool: "statistik_demografi" },
	{ q: "Berapa jumlah kepala keluarga?", tool: "statistik_demografi" },
	{
		q: "Berapa kelahiran dan kematian tahun ini?",
		tool: "statistik_demografi",
	},
	{ q: "Divisi mana yang paling aktif?", tool: "kinerja_divisi" },
	{
		q: "Berapa persen progres proyek perbaikan irigasi?",
		tool: "kinerja_divisi",
	},
	{ q: "Bagaimana cara mengekspor data?", tool: "lookup_faq" },
	{ q: "Bagaimana cara mengganti password akun?", tool: "lookup_faq" },
];

const ALL = FEATURES.map((f) => f.key);

function setup(features: string[]) {
	const executed: Array<{ name: string; args: Record<string, unknown> }> = [];
	const tools: ToolDefinition[] = ASSISTANT_TOOLS.map((t) => ({
		...t,
		handler: async (args) => {
			executed.push({ name: t.name, args });
			return { ok: true, data: { sumber: t.name } };
		},
	}));
	const provider = new MockProvider(
		Array.from({ length: 2 * EVAL_SET.length }, () => keywordRouterStep),
	);
	const ask = (message: string) =>
		runChatTurn(
			{
				principal: {
					user: { id: "eval", role: "user" },
					allowedFeatures: features,
				},
				message,
			},
			{
				loadSettings: async () => enabledSettings({ ratePerMinutePerUser: 0 }),
				resolveProvider: async () => ({
					ok: true,
					provider,
					slot: "chat",
					model: "mock",
				}),
				getUsage: async () => ({ messagesToday: 0, tokensToday: 0 }),
				rateLimiter: new SlidingWindowRateLimiter(),
				tools,
				repo: createMemoryRepo().repo,
			},
		);
	return { executed, provider, ask };
}

describe("set evaluasi — tool yang benar terpilih (semua izin)", () => {
	for (const item of EVAL_SET) {
		it(`"${item.q}" → ${item.tool}`, async () => {
			const { executed, ask } = setup(ALL);
			const res = await ask(item.q);
			if (!res.ok) throw new Error(`gagal: ${res.error}`);
			expect(res.value.message.toolsUsed).toEqual([item.tool]);
			expect(executed.map((e) => e.name)).toEqual([item.tool]);
			if (item.args) expect(executed[0]?.args).toEqual(item.args);
		});
	}
});

describe("set evaluasi — izin dihormati", () => {
	const dataItems = EVAL_SET.filter((i) => i.tool !== "lookup_faq");

	it("hanya use-ai-assistant: tidak satu pun tool data ditawarkan atau dijalankan", async () => {
		const { executed, provider, ask } = setup(["use-ai-assistant"]);
		for (const item of dataItems) {
			const res = await ask(item.q);
			if (!res.ok) throw new Error(`gagal: ${res.error}`);
		}
		const offered = new Set(provider.calls.flatMap((c) => c.toolNames));
		expect([...offered]).toEqual(["lookup_faq"]);
		expect(executed.filter((e) => e.name !== "lookup_faq")).toEqual([]);
	});

	const byTool = [...new Set(dataItems.map((i) => i.tool))];
	for (const toolName of byTool) {
		const feature = ASSISTANT_TOOLS.find(
			(t) => t.name === toolName,
		)?.requiredFeature;
		it(`tanpa ${feature}: ${toolName} tidak pernah ditawarkan/dijalankan`, async () => {
			const { executed, provider, ask } = setup(
				ALL.filter((f) => f !== feature),
			);
			for (const item of dataItems.filter((i) => i.tool === toolName)) {
				await ask(item.q);
			}
			expect(provider.calls.flatMap((c) => c.toolNames)).not.toContain(
				toolName,
			);
			expect(executed.map((e) => e.name)).not.toContain(toolName);
		});
	}
});
