import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	AssistantApiError,
	deleteConversation,
	fetchAssistantStatus,
	fetchConversations,
	fetchMessages,
	fetchMyPermissions,
	renameConversation,
	sendChatMessage,
} from "@/components/assistant/assistant.api";

/** Klien `/api/assistant/*` dengan fetch tiruan. */

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

/** Body Response hanya bisa dibaca sekali — tiap panggilan mendapat salinan baru. */
function mockFetch(response: Response | Error) {
	const fn = mock(async (_url: string, _init?: RequestInit) => {
		if (response instanceof Error) throw response;
		return response.clone();
	});
	globalThis.fetch = fn as unknown as typeof fetch;
	return fn;
}

const json = (
	body: unknown,
	status = 200,
	headers: Record<string, string> = {},
) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json", ...headers },
	});

async function catchError(p: Promise<unknown>): Promise<AssistantApiError> {
	try {
		await p;
	} catch (err) {
		if (err instanceof AssistantApiError) return err;
		throw err;
	}
	throw new Error("harus gagal");
}

describe("sendChatMessage", () => {
	it("POST /api/assistant/chat dengan body & cookie sesi", async () => {
		const reply = { conversationId: "c1", message: { id: "m1" }, actions: [] };
		const fn = mockFetch(json(reply));
		const body = {
			message: "Halo",
			pageContext: { route: "/", title: "Dashboard", lang: "id" as const },
		};
		expect(await sendChatMessage(body)).toEqual(reply as never);
		const [url, init] = fn.mock.calls[0] ?? [];
		expect(url).toBe("/api/assistant/chat");
		expect(init?.method).toBe("POST");
		expect(init?.credentials).toBe("include");
		expect(JSON.parse(String(init?.body))).toEqual(body);
	});

	it("429 → status + retryAfterSec dari header Retry-After", async () => {
		mockFetch(
			json({ error: "Kuota harian habis." }, 429, { "retry-after": "120" }),
		);
		const err = await catchError(sendChatMessage({ message: "x" }));
		expect(err.status).toBe(429);
		expect(err.retryAfterSec).toBe(120);
	});

	it("503 membawa conversationId yang tersimpan", async () => {
		mockFetch(json({ error: "Layanan AI…", conversationId: "c9" }, 503));
		const err = await catchError(sendChatMessage({ message: "x" }));
		expect([err.status, err.conversationId]).toEqual([503, "c9"]);
	});

	it("jaringan putus → status null", async () => {
		mockFetch(new TypeError("Failed to fetch"));
		expect(
			(await catchError(sendChatMessage({ message: "x" }))).status,
		).toBeNull();
	});

	it("respons bukan JSON (mis. fallback SPA) → status null", async () => {
		mockFetch(new Response("<html></html>", { status: 200 }));
		expect((await catchError(fetchAssistantStatus())).status).toBeNull();
	});
});

describe("percakapan", () => {
	it("daftar & pesan memakai cursor; id di-encode", async () => {
		const fn = mockFetch(json({ items: [], nextCursor: null }));
		await fetchConversations();
		await fetchConversations("abc");
		await fetchMessages("a/b", "cur");
		expect(fn.mock.calls.map((c) => c[0])).toEqual([
			"/api/assistant/conversations",
			"/api/assistant/conversations?cursor=abc",
			"/api/assistant/conversations/a%2Fb/messages?cursor=cur",
		]);
	});

	it("PATCH judul & DELETE", async () => {
		const fn = mockFetch(json({ ok: true }));
		await renameConversation("c1", "Judul");
		await deleteConversation("c1");
		expect(fn.mock.calls.map((c) => c[1]?.method)).toEqual(["PATCH", "DELETE"]);
		expect(JSON.parse(String(fn.mock.calls[0]?.[1]?.body))).toEqual({
			title: "Judul",
		});
	});

	it("404 → AssistantApiError status 404", async () => {
		mockFetch(json({ error: "Percakapan tidak ditemukan." }, 404));
		expect((await catchError(fetchMessages("x"))).status).toBe(404);
	});
});

describe("fetchMyPermissions", () => {
	it("hanya string yang diambil", async () => {
		mockFetch(
			json({ allowed: ["use-ai-assistant", 3, null, "view-dashboard"] }),
		);
		expect(await fetchMyPermissions()).toEqual([
			"use-ai-assistant",
			"view-dashboard",
		]);
	});
	it("gagal → error dengan status", async () => {
		mockFetch(json({}, 401));
		expect((await catchError(fetchMyPermissions())).status).toBe(401);
	});
});
