import Elysia, { t } from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import logger from "@/utils/logger";
import { type ChatServiceDeps, runChatTurn } from "../chat/chat.service";
import { authorizeAssistantUser } from "../http/access";

/**
 * `POST /api/assistant/chat` — satu giliran tanya-jawab. Sesi browser,
 * terverifikasi, izin `use-ai-assistant`; role & izin dibaca dari DB.
 * Kontrak: `src/types/ai-assistant-chat.ts`. Log tanpa isi pesan.
 */

const chatBody = t.Object({
	conversationId: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
	// Panjang maksimal dicek service (maxInputChars dari pengaturan admin).
	message: t.String(),
	pageContext: t.Optional(
		t.Object({
			route: t.String({ maxLength: 500 }),
			title: t.Optional(t.String({ maxLength: 500 })),
			lang: t.Optional(t.UnionEnum(["id", "en"])),
		}),
	),
});

/** Factory agar test bisa menyuntik provider/pengaturan; produksi memakai `assistantChatApi`. */
export function createAssistantChatApi(deps: ChatServiceDeps = {}) {
	return new Elysia({ prefix: "/assistant" }).use(apiMiddleware).post(
		"/chat",
		async ({ user, body, set }) => {
			try {
				const access = await authorizeAssistantUser(user);
				if ("denied" in access) {
					set.status = access.denied.status;
					return { error: access.denied.error };
				}
				const outcome = await runChatTurn(
					{ principal: access.principal, ...body },
					deps,
				);
				if (outcome.ok) return outcome.value;
				set.status = outcome.status;
				if (outcome.retryAfterSec)
					set.headers["retry-after"] = String(outcome.retryAfterSec);
				return outcome.conversationId
					? { error: outcome.error, conversationId: outcome.conversationId }
					: { error: outcome.error };
			} catch (err) {
				logger.error(
					{ err, userId: user?.id, conversationId: body.conversationId },
					"[ASSISTANT] Chat turn failed",
				);
				set.status = 500;
				return { error: "Terjadi kesalahan server" };
			}
		},
		{ body: chatBody, detail: { summary: "Ask the AI assistant (one turn)" } },
	);
}

export const assistantChatApi = createAssistantChatApi();
