import { describe, expect, it } from "bun:test";
import {
	type OpenAICompatibleConfig,
	OpenAICompatibleProvider,
} from "@/api/assistant/provider/openai-compatible";
import { AiProviderError } from "@/api/assistant/provider/types";

/** Mode stream provider OpenAI-compatible (`stream: true`) dengan fetch tiruan. */

const CONFIG: OpenAICompatibleConfig = {
	baseUrl: "https://proxy.example.test/v1", // test-only
	apiKey: "sk-test-key", // test-only
	model: "claude-test",
	temperature: null,
	maxTokens: null,
	timeoutMs: 1000,
};

const chunk = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;

/** Body SSE tiruan; `signal` diisi → body error saat abort, seperti fetch sungguhan. */
function sseResponse(parts: string[], signal?: AbortSignal | null) {
	const encoder = new TextEncoder();
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			for (const p of parts) controller.enqueue(encoder.encode(p));
			if (!signal) return controller.close();
			signal.addEventListener("abort", () =>
				controller.error(new DOMException("aborted", "AbortError")),
			);
		},
	});
	return new Response(body, {
		headers: { "content-type": "text/event-stream" },
	});
}

function provider(response: (init: RequestInit) => Response) {
	const bodies: Record<string, unknown>[] = [];
	const p = new OpenAICompatibleProvider(CONFIG, async (_url, init) => {
		bodies.push(JSON.parse(String(init.body)));
		return response(init);
	});
	return { p, bodies };
}

async function providerError(promise: Promise<unknown>) {
	const err = await promise.then(
		() => null,
		(e: unknown) => e,
	);
	expect(err).toBeInstanceOf(AiProviderError);
	return err as AiProviderError;
}

describe("OpenAICompatibleProvider — stream", () => {
	it("teks: delta berurutan, hasil utuh, usage dari chunk terakhir, body stream:true", async () => {
		const { p, bodies } = provider(() =>
			sseResponse([
				chunk({
					choices: [{ delta: { role: "assistant", content: "Total " } }],
				}),
				chunk({ choices: [{ delta: { content: "Rp 1.000" } }] }).slice(0, 20),
				chunk({ choices: [{ delta: { content: "Rp 1.000" } }] }).slice(20),
				chunk({
					choices: [],
					usage: { prompt_tokens: 9, completion_tokens: 4 },
				}),
				"data: [DONE]\n\n",
			]),
		);
		const deltas: string[] = [];
		const res = await p.chat([{ role: "user", content: "x" }], {
			onDelta: (t) => deltas.push(t),
		});
		expect(deltas).toEqual(["Total ", "Rp 1.000"]);
		expect(res).toEqual({
			type: "text",
			text: "Total Rp 1.000",
			usage: { inputTokens: 9, outputTokens: 4 },
		});
		expect(bodies[0]).toMatchObject({
			stream: true,
			stream_options: { include_usage: true },
		});
	});

	it("tool_calls dirakit dari potongan per index (argumen bersambung)", async () => {
		const tc = (o: unknown) =>
			chunk({ choices: [{ delta: { tool_calls: [o] } }] });
		const { p } = provider(() =>
			sseResponse([
				chunk({ choices: [{ delta: { content: "Saya cek dulu. " } }] }),
				tc({
					index: 0,
					id: "c1",
					function: { name: "ringkasan_keuangan", arguments: "" },
				}),
				tc({ index: 0, function: { arguments: '{"tah' } }),
				tc({ index: 0, function: { arguments: 'un":2024}' } }),
				tc({
					index: 1,
					id: "c2",
					function: { name: "lookup_faq", arguments: "{bad" },
				}),
				"data: [DONE]\n\n",
			]),
		);
		const res = await p.chat([{ role: "user", content: "x" }], {
			onDelta: () => {},
		});
		expect(res).toEqual({
			type: "tool_calls",
			text: "Saya cek dulu. ",
			usage: undefined,
			toolCalls: [
				{ id: "c1", name: "ringkasan_keuangan", args: { tahun: 2024 } },
				{ id: "c2", name: "lookup_faq", args: {} },
			],
		});
	});

	it("proxy mengabaikan stream (balas JSON) → satu delta berisi seluruh teks", async () => {
		const { p } = provider(
			() =>
				new Response(
					JSON.stringify({ choices: [{ message: { content: "Halo" } }] }),
					{
						headers: { "content-type": "application/json" },
					},
				),
		);
		const deltas: string[] = [];
		const res = await p.chat([{ role: "user", content: "x" }], {
			onDelta: (t) => deltas.push(t),
		});
		expect([deltas, res.text]).toEqual([["Halo"], "Halo"]);
	});

	it("chunk JSON rusak / stream kosong → bad_response; HTTP 429 → busy", async () => {
		const bad = provider(() => sseResponse(["data: {rusak\n\n"]));
		expect(
			(await providerError(bad.p.chat([], { onDelta: () => {} }))).kind,
		).toBe("bad_response");
		const empty = provider(() => sseResponse([]));
		expect(
			(await providerError(empty.p.chat([], { onDelta: () => {} }))).kind,
		).toBe("bad_response");
		const busy = provider(() => new Response("{}", { status: 429 }));
		expect(
			(await providerError(busy.p.chat([], { onDelta: () => {} }))).kind,
		).toBe("busy");
	});

	it("giliran dibatalkan saat stream berjalan → unavailable", async () => {
		const controller = new AbortController();
		const { p } = provider((init) =>
			sseResponse(
				[chunk({ choices: [{ delta: { content: "Ha" } }] })],
				init.signal,
			),
		);
		const promise = p.chat([], {
			signal: controller.signal,
			onDelta: () => controller.abort(),
		});
		expect((await providerError(promise)).kind).toBe("unavailable");
	});
});
