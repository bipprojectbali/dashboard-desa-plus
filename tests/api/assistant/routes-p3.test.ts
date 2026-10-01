import { describe, expect, it } from "bun:test";
import api from "@/api";
import { DEFAULT_ASSISTANT_SETTINGS } from "@/api/assistant/config/settings.repo";

/**
 * Route P3 ter-mount di belakang apiMiddleware: tanpa sesi selalu 401 dengan
 * body JSON (ditolak sebelum handler menyentuh DB). Skenario dengan sesi
 * nyata ada di tests/db/assistant-admin.test.ts. Body dibuat valid karena
 * validasi skema Elysia berjalan sebelum guard (body rusak → 422).
 */
const { id: _id, ...settingsBody } = DEFAULT_ASSISTANT_SETTINGS;
const providerBody = {
	enabled: false,
	label: null,
	baseUrl: null,
	model: null,
	temperature: null,
	maxTokens: null,
	timeoutMs: 60_000,
};

const cases: Array<[string, string, unknown?]> = [
	["GET", "/api/assistant/status"],
	["GET", "/api/admin/ai-assistant"],
	["PUT", "/api/admin/ai-assistant/settings", settingsBody],
	["PUT", "/api/admin/ai-assistant/providers/chat", providerBody],
	["POST", "/api/admin/ai-assistant/providers/chat/test"],
];

describe("AI assistant routes tanpa sesi", () => {
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
