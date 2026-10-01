import { describe, expect, it } from "bun:test";
import {
	createSseResponse,
	formatSseEvent,
	SSE_HEADERS,
} from "@/api/assistant/chat/chat.sse";
import { createSseParser, type SseEvent } from "@/utils/sse-parser";

/** Parser SSE bersama (server & browser) dan respons SSE endpoint stream. */

function parseAll(chunks: string[]): SseEvent[] {
	const events: SseEvent[] = [];
	const parser = createSseParser((e) => events.push(e));
	for (const c of chunks) parser.push(c);
	parser.end();
	return events;
}

describe("createSseParser", () => {
	it("event & data terpotong di sembarang tempat", () => {
		const text =
			'event: status\ndata: {"tool":"x"}\n\nevent: delta\ndata: {"text":"Hai"}\n\n';
		const oneByOne = parseAll([...text]);
		expect(oneByOne).toEqual([
			{ event: "status", data: '{"tool":"x"}' },
			{ event: "delta", data: '{"text":"Hai"}' },
		]);
		expect(parseAll([text.slice(0, 17), text.slice(17)])).toEqual(oneByOne);
	});

	it("CRLF, komentar, data multi-baris, tanpa nama event, tanpa baris kosong penutup", () => {
		expect(
			parseAll([": ping\r\n\r\ndata: a\r\ndata: b\r\n\r\ndata: [DONE]"]),
		).toEqual([
			{ event: "message", data: "a\nb" },
			{ event: "message", data: "[DONE]" },
		]);
	});
});

async function readText(res: Response): Promise<string> {
	return new Response(res.body).text();
}

describe("createSseResponse", () => {
	it("header SSE anti-buffer & event berurutan, lalu stream ditutup", async () => {
		const res = createSseResponse(async (send) => {
			send("status", { tool: "ringkasan_keuangan" });
			send("done", { ok: 1 });
		});
		for (const [name, value] of Object.entries(SSE_HEADERS))
			expect(res.headers.get(name)).toBe(value);
		const events = parseAll([await readText(res)]);
		expect(events.map((e) => e.event)).toEqual(["status", "done"]);
		expect(formatSseEvent("delta", { text: "a\nb" })).toBe(
			'event: delta\ndata: {"text":"a\\nb"}\n\n',
		);
	});

	it("klien memutus → event setelahnya tidak ditulis", async () => {
		const controller = new AbortController();
		const res = createSseResponse(async (send) => {
			send("delta", { text: "sebelum" });
			controller.abort();
			send("delta", { text: "sesudah" });
		}, controller.signal);
		const text = await readText(res);
		expect(text).toContain("sebelum");
		expect(text).not.toContain("sesudah");
	});
});
