import { describe, expect, it } from "bun:test";
import api from "@/api";

/**
 * Route percakapan F1-b ter-mount di belakang apiMiddleware: tanpa sesi selalu
 * 401 JSON, sebelum handler menyentuh DB. Skenario dengan sesi nyata ada di
 * tests/db/assistant-chat.test.ts.
 */
const cases: Array<[string, string, unknown?]> = [
	["POST", "/api/assistant/chat", { message: "Halo" }],
	["GET", "/api/assistant/conversations"],
	["GET", "/api/assistant/conversations/abc/messages"],
	["PATCH", "/api/assistant/conversations/abc", { title: "Judul" }],
	["DELETE", "/api/assistant/conversations/abc"],
];

describe("AI assistant chat routes tanpa sesi", () => {
	for (const [method, path, body] of cases) {
		it(`${method} ${path} → 401 JSON`, async () => {
			const res = await api.handle(
				new Request(`http://localhost${path}`, {
					method,
					headers: { "content-type": "application/json" },
					body: body === undefined ? undefined : JSON.stringify(body),
				}),
			);
			expect(res.status).toBe(401);
			expect(res.headers.get("content-type")).toContain("application/json");
		});
	}
});
