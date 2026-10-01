import Elysia from "elysia";
import type { ChatServiceDeps } from "@/api/assistant/chat/chat.service";
import { invalidateAssistantConfigCache } from "@/api/assistant/config/settings.repo";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider, type MockStep } from "@/api/assistant/provider/mock";
import { createAssistantChatApi } from "@/api/assistant/routes/chat.route";
import type { ToolDefinition } from "@/api/assistant/tools/types";
import { prisma } from "@/utils/db";
import { SETTINGS_BODY } from "./assistant-admin.helpers";

/** Helper test DB endpoint chat F1-b. Semua nilai test-only. */

/** Tulis pengaturan singleton (default skema + override) dan buang cache config. */
export async function setAssistantSettings(
	o: Partial<typeof SETTINGS_BODY> = {},
): Promise<void> {
	const data = {
		...SETTINGS_BODY,
		enabled: true,
		ratePerMinutePerUser: 0,
		...o,
	};
	await prisma.assistantSettings.upsert({
		where: { id: "singleton" },
		create: { id: "singleton", ...data },
		update: data,
	});
	invalidateAssistantConfigCache();
}

/** Tool palsu tanpa jaringan dengan izin asli keuangan. */
export const FAKE_KEUANGAN_TOOL: ToolDefinition = {
	name: "ringkasan_keuangan",
	description: "Data keuangan desa (APBDes)",
	parameters: { type: "object", properties: {} },
	requiredFeature: "view-keuangan",
	handler: async () => ({ ok: true, data: { totalAnggaran: 1000 } }),
};

/**
 * App uji: route chat asli (apiMiddleware + guard + service) dengan provider
 * MockProvider yang skripnya bisa diganti per test lewat `script()`.
 */
export function createChatTestApp(o: Partial<ChatServiceDeps> = {}) {
	let provider = new MockProvider();
	const app = new Elysia({ prefix: "/api" }).use(
		createAssistantChatApi({
			resolveProvider: async () => ({
				ok: true,
				provider,
				slot: "chat",
				model: "mock",
			}),
			rateLimiter: new SlidingWindowRateLimiter(),
			tools: [FAKE_KEUANGAN_TOOL],
			...o,
		}),
	);
	return {
		script(steps: MockStep[]) {
			provider = new MockProvider(steps);
			return provider;
		},
		chat(headers: Record<string, string>, body: unknown) {
			return app.handle(
				new Request("http://localhost/api/assistant/chat", {
					method: "POST",
					headers: { "content-type": "application/json", ...headers },
					body: JSON.stringify(body),
				}),
			);
		},
	};
}
