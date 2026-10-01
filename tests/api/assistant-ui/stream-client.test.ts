import { afterEach, describe, expect, it, mock } from "bun:test";
import { AssistantApiError } from "@/components/assistant/assistant.api";
import { streamStatusLabel } from "@/components/assistant/assistant.logic";
import {
	type AskApi,
	askAssistant,
	StreamUnavailableError,
	streamChatMessage,
} from "@/components/assistant/assistant-stream.api";
import { assistantTexts } from "@/locales/assistant";
import type { AssistantChatResponse } from "@/types/ai-assistant-chat";

/** Klien stream panel (fetch + ReadableStream) dan aturan fallback ke /chat. */

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

const DONE: AssistantChatResponse = {
	conversationId: "c1",
	message: {
		id: "m1",
		role: "assistant",
		content: "Rp 1.000",
		toolsUsed: ["ringkasan_keuangan"],
		createdAt: "2026-10-02T00:00:00.000Z",
	},
	actions: [],
};

const ev = (event: string, data: unknown) =>
	`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

function sse(text: string) {
	return new Response(text, {
		headers: { "content-type": "text/event-stream" },
	});
}

function mockFetch(make: () => Response | Promise<Response>) {
	const fn = mock(async (_url: string, _init?: RequestInit) => make());
	globalThis.fetch = fn as unknown as typeof fetch;
	return fn;
}

function collect() {
	const events: Array<[string, string]> = [];
	return {
		events,
		handlers: {
			onStatus: (t: string) => events.push(["status", t]),
			onDelta: (t: string) => events.push(["delta", t]),
		},
	};
}

async function rejection(p: Promise<unknown>): Promise<unknown> {
	return p.then(
		() => {
			throw new Error("harus gagal");
		},
		(e: unknown) => e,
	);
}

describe("streamChatMessage", () => {
	it("status → delta → done, POST ke /chat/stream", async () => {
		const fn = mockFetch(() =>
			sse(
				`: open\n\n${ev("status", { tool: "ringkasan_keuangan" })}${ev("delta", { text: "Rp " })}${ev("delta", { text: "1.000" })}${ev("done", DONE)}`,
			),
		);
		const { events, handlers } = collect();
		expect(await streamChatMessage({ message: "x" }, handlers)).toEqual(DONE);
		expect(events).toEqual([
			["status", "ringkasan_keuangan"],
			["delta", "Rp "],
			["delta", "1.000"],
		]);
		expect(fn.mock.calls[0]?.[0]).toBe("/api/assistant/chat/stream");
		expect(fn.mock.calls[0]?.[1]?.method).toBe("POST");
	});

	it("event error → AssistantApiError dengan kode, retry, conversationId", async () => {
		mockFetch(() =>
			sse(
				ev("error", {
					status: 429,
					error: "Kuota",
					retryAfterSec: 30,
					conversationId: "c9",
				}),
			),
		);
		const err = (await rejection(
			streamChatMessage({ message: "x" }, collect().handlers),
		)) as AssistantApiError;
		expect([err.status, err.retryAfterSec, err.conversationId]).toEqual([
			429,
			30,
			"c9",
		]);
	});

	it("401 JSON → AssistantApiError 401 (bukan fallback); 404 / bukan SSE → StreamUnavailableError", async () => {
		mockFetch(
			() =>
				new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
				}),
		);
		expect(
			(
				(await rejection(
					streamChatMessage({ message: "x" }, collect().handlers),
				)) as AssistantApiError
			).status,
		).toBe(401);
		mockFetch(() => new Response("not found", { status: 404 }));
		expect(
			await rejection(streamChatMessage({ message: "x" }, collect().handlers)),
		).toBeInstanceOf(StreamUnavailableError);
		mockFetch(
			() =>
				new Response(JSON.stringify(DONE), {
					headers: { "content-type": "application/json" },
				}),
		);
		expect(
			await rejection(streamChatMessage({ message: "x" }, collect().handlers)),
		).toBeInstanceOf(StreamUnavailableError);
	});

	it("stream berakhir tanpa done/error → error jaringan (status null)", async () => {
		mockFetch(() => sse(ev("delta", { text: "setengah" })));
		const err = (await rejection(
			streamChatMessage({ message: "x" }, collect().handlers),
		)) as AssistantApiError;
		expect(err.status).toBeNull();
	});
});

describe("askAssistant — fallback", () => {
	const api = (stream: AskApi["stream"]) => {
		const send = mock(async () => DONE);
		return { api: { stream, send } as AskApi, send };
	};

	it("stream tidak tersedia → jatuh ke /chat", async () => {
		const { api: a, send } = api(async () => {
			throw new StreamUnavailableError("x");
		});
		expect(
			await askAssistant({ message: "x" }, collect().handlers, undefined, a),
		).toEqual(DONE);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("gagal di tengah stream / error server → tidak fallback (hindari tanya dua kali)", async () => {
		const { api: a, send } = api(async () => {
			throw new AssistantApiError(503, "Layanan AI…");
		});
		expect(
			await rejection(
				askAssistant({ message: "x" }, collect().handlers, undefined, a),
			),
		).toBeInstanceOf(AssistantApiError);
		expect(send).not.toHaveBeenCalled();
	});

	it("dibatalkan user → tidak fallback", async () => {
		const controller = new AbortController();
		controller.abort();
		const { api: a, send } = api(async () => {
			throw new StreamUnavailableError("x");
		});
		await rejection(
			askAssistant({ message: "x" }, collect().handlers, controller.signal, a),
		);
		expect(send).not.toHaveBeenCalled();
	});
});

describe("label status", () => {
	it("nama tool → 'Memeriksa data <modul>…' sesuai bahasa", () => {
		expect(streamStatusLabel("ringkasan_keuangan", assistantTexts.id)).toBe(
			"Memeriksa data Keuangan & Anggaran…",
		);
		expect(streamStatusLabel("tool_baru", assistantTexts.en)).toBe(
			"Checking tool_baru data…",
		);
	});
});
