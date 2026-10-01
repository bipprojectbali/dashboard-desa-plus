import { describe, expect, it } from "bun:test";
import {
	type OpenAICompatibleConfig,
	OpenAICompatibleProvider,
} from "@/api/assistant/provider/openai-compatible";
import { AiProviderError } from "@/api/assistant/provider/types";

/** Provider OpenAI-compatible dengan fetch tiruan — tanpa jaringan. */
const CONFIG: OpenAICompatibleConfig = {
	baseUrl: "https://proxy.example.test/v1/", // test-only
	apiKey: "sk-test-key", // test-only
	model: "claude-test",
	temperature: null,
	maxTokens: null,
	timeoutMs: 1000,
};

interface Captured {
	url: string;
	init: RequestInit;
	body: Record<string, unknown>;
}

function fakeFetch(response: () => Response | Promise<Response>) {
	const calls: Captured[] = [];
	const impl = async (url: string, init: RequestInit) => {
		calls.push({ url, init, body: JSON.parse(String(init.body)) });
		return response();
	};
	return { calls, impl };
}

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

const TEXT_REPLY = {
	choices: [{ message: { content: "Halo" } }],
	usage: { prompt_tokens: 12, completion_tokens: 3 },
};

async function expectProviderError(
	promise: Promise<unknown>,
	kind: AiProviderError["kind"],
) {
	const err = await promise.then(
		() => null,
		(e: unknown) => e,
	);
	expect(err).toBeInstanceOf(AiProviderError);
	expect((err as AiProviderError).kind).toBe(kind);
	return err as AiProviderError;
}

describe("OpenAICompatibleProvider — request", () => {
	it("POST {baseUrl}/chat/completions dengan Bearer, tanpa temperature/max_tokens bila null", async () => {
		const f = fakeFetch(() => jsonResponse(TEXT_REPLY));
		const provider = new OpenAICompatibleProvider(CONFIG, f.impl);
		await provider.chat([{ role: "user", content: "hai" }]);

		const call = f.calls[0];
		expect(call?.url).toBe("https://proxy.example.test/v1/chat/completions");
		expect(call?.init.method).toBe("POST");
		const headers = call?.init.headers as Record<string, string>;
		expect(headers.authorization).toBe("Bearer sk-test-key");
		expect(call?.init.redirect).toBe("manual");
		expect(call?.body.model).toBe("claude-test");
		expect("temperature" in (call?.body ?? {})).toBe(false);
		expect("max_tokens" in (call?.body ?? {})).toBe(false);
		expect("tools" in (call?.body ?? {})).toBe(false);
	});

	it("temperature & max_tokens dikirim bila diisi (termasuk temperature 0)", async () => {
		const f = fakeFetch(() => jsonResponse(TEXT_REPLY));
		const provider = new OpenAICompatibleProvider(
			{ ...CONFIG, temperature: 0, maxTokens: 512 },
			f.impl,
		);
		await provider.chat([{ role: "user", content: "hai" }]);
		expect(f.calls[0]?.body.temperature).toBe(0);
		expect(f.calls[0]?.body.max_tokens).toBe(512);
	});

	it("tools & riwayat tool dikonversi ke format OpenAI", async () => {
		const f = fakeFetch(() => jsonResponse(TEXT_REPLY));
		const provider = new OpenAICompatibleProvider(CONFIG, f.impl);
		await provider.chat(
			[
				{ role: "user", content: "berapa?" },
				{
					role: "assistant",
					content: "",
					toolCalls: [{ id: "c1", name: "ringkasan", args: { tahun: 2025 } }],
				},
				{ role: "tool", toolCallId: "c1", content: "[DATA ringkasan]" },
			],
			{
				tools: [
					{
						name: "ringkasan",
						description: "Ringkasan",
						parameters: { type: "object", properties: {} },
					},
				],
			},
		);
		const body = f.calls[0]?.body as {
			tools: Array<{ type: string; function: { name: string } }>;
			tool_choice: string;
			messages: Array<Record<string, unknown>>;
		};
		expect(body.tool_choice).toBe("auto");
		expect(body.tools[0]).toMatchObject({
			type: "function",
			function: { name: "ringkasan" },
		});
		expect(body.messages[1]).toEqual({
			role: "assistant",
			content: null,
			tool_calls: [
				{
					id: "c1",
					type: "function",
					function: { name: "ringkasan", arguments: '{"tahun":2025}' },
				},
			],
		});
		expect(body.messages[2]).toEqual({
			role: "tool",
			tool_call_id: "c1",
			content: "[DATA ringkasan]",
		});
	});
});

describe("OpenAICompatibleProvider — response", () => {
	it("jawaban teks + usage", async () => {
		const f = fakeFetch(() => jsonResponse(TEXT_REPLY));
		const res = await new OpenAICompatibleProvider(CONFIG, f.impl).chat([]);
		expect(res).toEqual({
			type: "text",
			text: "Halo",
			usage: { inputTokens: 12, outputTokens: 3 },
		});
	});

	it("tool_calls diparse; argumen JSON rusak → {}", async () => {
		const f = fakeFetch(() =>
			jsonResponse({
				choices: [
					{
						message: {
							content: null,
							tool_calls: [
								{ id: "a", function: { name: "x", arguments: '{"n":1}' } },
								{ id: "b", function: { name: "y", arguments: "{rusak" } },
							],
						},
					},
				],
			}),
		);
		const res = await new OpenAICompatibleProvider(CONFIG, f.impl).chat([]);
		expect(res.type).toBe("tool_calls");
		if (res.type !== "tool_calls") return;
		expect(res.toolCalls).toEqual([
			{ id: "a", name: "x", args: { n: 1 } },
			{ id: "b", name: "y", args: {} },
		]);
	});

	it("respons tanpa choices → bad_response", async () => {
		const f = fakeFetch(() => jsonResponse({}));
		await expectProviderError(
			new OpenAICompatibleProvider(CONFIG, f.impl).chat([]),
			"bad_response",
		);
	});
});

describe("OpenAICompatibleProvider — pemetaan error", () => {
	const cases: Array<[number, AiProviderError["kind"]]> = [
		[401, "config"],
		[403, "config"],
		[404, "config"],
		[302, "config"],
		[429, "busy"],
		[500, "unavailable"],
		[503, "unavailable"],
	];
	for (const [status, kind] of cases) {
		it(`HTTP ${status} → ${kind}`, async () => {
			const f = fakeFetch(
				() => new Response("secret upstream detail sk-test-key", { status }),
			);
			const err = await expectProviderError(
				new OpenAICompatibleProvider(CONFIG, f.impl).chat([]),
				kind,
			);
			expect(err.status).toBe(status);
			expect(err.message).not.toContain("sk-test-key");
		});
	}

	it("timeout → unavailable", async () => {
		const impl = (_url: string, init: RequestInit) =>
			new Promise<Response>((_resolve, reject) => {
				init.signal?.addEventListener("abort", () =>
					reject(init.signal?.reason),
				);
			});
		await expectProviderError(
			new OpenAICompatibleProvider({ ...CONFIG, timeoutMs: 20 }, impl).chat([]),
			"unavailable",
		);
	});

	it("error jaringan → unavailable", async () => {
		const impl = async () => {
			throw new TypeError("fetch failed");
		};
		await expectProviderError(
			new OpenAICompatibleProvider(CONFIG, impl).chat([]),
			"unavailable",
		);
	});
});
