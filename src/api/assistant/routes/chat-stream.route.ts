import Elysia from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import logger from "@/utils/logger";
import {
	type ChatServiceDeps,
	CLIENT_CLOSED,
	runChatTurn,
} from "../chat/chat.service";
import { createSseResponse } from "../chat/chat.sse";
import { authorizeAssistantUser } from "../http/access";
import { chatBody } from "./chat.route";

/**
 * `POST /api/assistant/chat/stream` — satu giliran yang sama dengan
 * `/chat` (guard, batas, kuota, penyimpanan via runChatTurn), dialirkan
 * sebagai SSE: `status` { tool } saat tool berjalan, `delta` { text },
 * lalu `done` (bentuk sama dengan respons `/chat`) atau `error`
 * { status, error, retryAfterSec?, conversationId? }. Penolakan akses &
 * body tidak valid tetap respons HTTP biasa (401/403/422 JSON).
 */
export function createAssistantChatStreamApi(deps: ChatServiceDeps = {}) {
	return new Elysia({ prefix: "/assistant" }).use(apiMiddleware).post(
		"/chat/stream",
		async ({ user, body, set, request }) => {
			const access = await authorizeAssistantUser(user);
			if ("denied" in access) {
				set.status = access.denied.status;
				return { error: access.denied.error };
			}
			return createSseResponse(async (send) => {
				try {
					const outcome = await runChatTurn(
						{
							principal: access.principal,
							...body,
							signal: request.signal,
							stream: {
								onStatus: (tool) => send("status", { tool }),
								onDelta: (text) => send("delta", { text }),
							},
						},
						deps,
					);
					if (outcome.ok) return send("done", outcome.value);
					if (outcome.status === CLIENT_CLOSED) return;
					const { ok: _ok, ...error } = outcome;
					send("error", error);
				} catch (err) {
					logger.error(
						{ err, userId: user?.id, conversationId: body.conversationId },
						"[ASSISTANT] Chat stream failed",
					);
					send("error", { status: 500, error: "Terjadi kesalahan server" });
				}
			}, request.signal);
		},
		{
			body: chatBody,
			detail: {
				summary: "Ask the AI assistant, streamed as server-sent events",
			},
		},
	);
}

export const assistantChatStreamApi = createAssistantChatStreamApi();
