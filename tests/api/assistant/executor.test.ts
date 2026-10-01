import { describe, expect, it } from "bun:test";
import { MockProvider } from "@/api/assistant/provider/mock";
import {
	AiProviderError,
	type ChatMessage,
} from "@/api/assistant/provider/types";
import {
	executeWithTools,
	MAX_ITERATIONS_MESSAGE,
	sanitizeResponse,
	TOOL_DATA_NOTE,
	wrapToolResult,
} from "@/api/assistant/tools/executor";
import {
	buildToolContext,
	getAvailableTools,
	getUnavailableModules,
} from "@/api/assistant/tools/registry";
import type { ToolContext, ToolDefinition } from "@/api/assistant/tools/types";

/** Registry & executor dengan MockProvider — tanpa jaringan/DB. */
function tool(
	name: string,
	requiredFeature: ToolDefinition["requiredFeature"],
	handler: ToolDefinition["handler"] = async () => ({
		ok: true,
		data: { name },
	}),
): ToolDefinition {
	return {
		name,
		description: name,
		parameters: { type: "object", properties: {} },
		requiredFeature,
		handler,
	};
}

const KEUANGAN = tool("ringkasan_keuangan", "view-keuangan", async () => ({
	ok: true,
	data: { totalBelanja: 1_500_000 },
}));
const DEMOGRAFI = tool("statistik_demografi", "view-demografi");

function ctx(allowed: string[]): ToolContext {
	return {
		user: { id: "user-1", role: "user" },
		allowedFeatures: new Set(allowed),
		now: new Date("2026-10-01T02:00:00Z"),
	};
}

const MESSAGES: ChatMessage[] = [
	{ role: "system", content: "sys" },
	{ role: "user", content: "berapa belanja?" },
];

function callTool(name: string, id = "c1") {
	return {
		type: "tool_calls" as const,
		toolCalls: [{ id, name, args: {} }],
		usage: { inputTokens: 10, outputTokens: 2 },
	};
}

describe("registry", () => {
	it("hanya tool yang requiredFeature-nya dimiliki user", () => {
		const tools = getAvailableTools(ctx(["view-demografi"]), [
			KEUANGAN,
			DEMOGRAFI,
		]);
		expect(tools.map((t) => t.name)).toEqual(["statistik_demografi"]);
	});

	it("modul view-* tanpa akses dilaporkan dengan label", () => {
		const missing = getUnavailableModules(new Set(["view-dashboard"]));
		expect(missing).toContain("Keuangan & Anggaran");
		expect(missing).not.toContain("Beranda / Dashboard");
		expect(missing).not.toContain("AI Assistant");
	});

	it("buildToolContext memakai izin dari loader (bukan argumen LLM)", async () => {
		const c = await buildToolContext(
			{ user: { id: "u", role: "user" } },
			{ loadAllowed: async () => ["view-keuangan"] },
		);
		expect([...c.allowedFeatures]).toEqual(["view-keuangan"]);
	});

	it("error DB saat membaca izin diteruskan (tidak jatuh ke default)", async () => {
		const failing = async () => {
			throw new Error("db down");
		};
		await expect(
			buildToolContext(
				{ user: { id: "u", role: "user" } },
				{ loadAllowed: failing },
			),
		).rejects.toThrow("db down");
	});
});

describe("executeWithTools", () => {
	it("tool dijalankan, hasil dibungkus DATA, jawaban akhir disanitasi", async () => {
		const provider = new MockProvider([
			callTool("ringkasan_keuangan"),
			{
				type: "text",
				text: "[DATA ringkasan_keuangan]\nTotal belanja Rp 1.500.000.\n[/DATA]",
				usage: { inputTokens: 20, outputTokens: 5 },
			},
		]);
		const res = await executeWithTools(
			provider,
			MESSAGES,
			[KEUANGAN],
			ctx(["view-keuangan"]),
		);

		expect(res.text).toBe("Total belanja Rp 1.500.000.");
		expect(res.toolsUsed).toEqual(["ringkasan_keuangan"]);
		expect(res.iterations).toBe(2);
		expect(res.usage).toEqual({ inputTokens: 30, outputTokens: 7 });
		expect(res.stopReason).toBe("answer");
		expect(provider.calls[0]?.toolNames).toEqual(["ringkasan_keuangan"]);

		const toolMsg = provider.calls[1]?.messages.at(-1);
		expect(toolMsg?.role).toBe("tool");
		expect(toolMsg?.toolCallId).toBe("c1");
		expect(toolMsg?.content).toContain("[DATA ringkasan_keuangan]");
		expect(toolMsg?.content).toContain(TOOL_DATA_NOTE);
		expect(toolMsg?.content).toContain('"totalBelanja":1500000');
	});

	it("tool di luar daftar user (dikarang LLM) ditolak, handler tidak dipanggil", async () => {
		let called = false;
		const secret = tool("data_rahasia", "sync-noc", async () => {
			called = true;
			return { ok: true, data: "rahasia" };
		});
		const provider = new MockProvider([
			callTool("data_rahasia"),
			{ type: "text", text: "maaf" },
		]);
		const allowed = getAvailableTools(ctx(["view-keuangan"]), [
			KEUANGAN,
			secret,
		]);
		const res = await executeWithTools(
			provider,
			MESSAGES,
			allowed,
			ctx(["view-keuangan"]),
		);

		expect(called).toBe(false);
		expect(res.toolsUsed).toEqual([]);
		const toolMsg = provider.calls[1]?.messages.at(-1);
		expect(toolMsg?.content).toContain("[ERROR data_rahasia]");
		expect(toolMsg?.content).toContain("tidak tersedia");
	});

	it("berhenti di 6 iterasi bila LLM terus meminta tool", async () => {
		const provider = new MockProvider(
			Array.from({ length: 10 }, () => callTool("ringkasan_keuangan")),
		);
		const res = await executeWithTools(
			provider,
			MESSAGES,
			[KEUANGAN],
			ctx(["view-keuangan"]),
		);
		expect(res.iterations).toBe(6);
		expect(provider.calls).toHaveLength(6);
		expect(res.stopReason).toBe("max_iterations");
		expect(res.text).toBe(MAX_ITERATIONS_MESSAGE);
	});

	it("tool melebihi batas waktu → ERROR ke LLM, giliran tetap lanjut", async () => {
		const slow = tool("lambat", "view-keuangan", () => new Promise(() => {}));
		const provider = new MockProvider([
			callTool("lambat"),
			{ type: "text", text: "data belum tersedia" },
		]);
		const res = await executeWithTools(
			provider,
			MESSAGES,
			[slow],
			ctx(["view-keuangan"]),
			{
				toolTimeoutMs: 20,
			},
		);
		expect(res.text).toBe("data belum tersedia");
		expect(provider.calls[1]?.messages.at(-1)?.content).toContain(
			"batas waktu",
		);
	});

	it("tool melempar error → ERROR generik (detail internal tidak bocor ke LLM)", async () => {
		const broken = tool("rusak", "view-keuangan", async () => {
			throw new Error("password=supersecret");
		});
		const provider = new MockProvider([
			callTool("rusak"),
			{ type: "text", text: "ok" },
		]);
		await executeWithTools(
			provider,
			MESSAGES,
			[broken],
			ctx(["view-keuangan"]),
		);
		const content = provider.calls[1]?.messages.at(-1)?.content ?? "";
		expect(content).toContain("Pengambilan data gagal.");
		expect(content).not.toContain("supersecret");
	});

	it("batas waktu satu giliran → AiProviderError unavailable", async () => {
		const slow = tool("lambat", "view-keuangan", () => new Promise(() => {}));
		const provider = new MockProvider([callTool("lambat")]);
		const err = await executeWithTools(
			provider,
			MESSAGES,
			[slow],
			ctx(["view-keuangan"]),
			{
				toolTimeoutMs: 1000,
				turnTimeoutMs: 20,
			},
		).catch((e: unknown) => e);
		expect(err).toBeInstanceOf(AiProviderError);
		expect((err as AiProviderError).kind).toBe("unavailable");
	});

	it("error provider diteruskan apa adanya", async () => {
		const provider = new MockProvider([
			new AiProviderError("busy", "sibuk", 429),
		]);
		const err = await executeWithTools(provider, MESSAGES, [], ctx([])).catch(
			(e: unknown) => e,
		);
		expect((err as AiProviderError).kind).toBe("busy");
	});

	it("tanpa tool: tools tidak dikirim ke provider", async () => {
		const provider = new MockProvider([
			{ type: "text", text: "Anda tidak punya akses." },
		]);
		const res = await executeWithTools(provider, MESSAGES, [], ctx([]));
		expect(provider.calls[0]?.toolNames).toEqual([]);
		expect(res.text).toBe("Anda tidak punya akses.");
	});
});

describe("wrapToolResult & sanitizeResponse", () => {
	it("hasil panjang dipotong ke batas karakter", () => {
		const wrapped = wrapToolResult(
			"t",
			{ ok: true, data: "x".repeat(20_000) },
			8000,
		);
		expect(wrapped).toContain("…(dipotong)");
		expect(wrapped.length).toBeLessThan(8300);
	});

	it("ERROR memakai pesan error tool", () => {
		expect(
			wrapToolResult("t", { ok: false, error: "tahun tidak ada" }),
		).toContain("[ERROR t]");
	});

	it("sanitize membuang penanda & catatan internal", () => {
		const raw = `[DATA x]\n${TOOL_DATA_NOTE}\nJawaban.\n[/DATA]\n\n\n[ERROR y]`;
		expect(sanitizeResponse(raw)).toBe("Jawaban.");
	});
});
