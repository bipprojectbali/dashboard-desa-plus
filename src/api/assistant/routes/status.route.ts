import Elysia from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import logger from "@/utils/logger";
import { checkAssistantUser } from "../http/access";
import { getAssistantStatus } from "../status/status.service";

/**
 * `GET /api/assistant/status` — dipakai tombol FAB untuk tampil/sembunyi.
 * Hanya sesi browser, user terverifikasi, dan izin `use-ai-assistant`.
 * Isinya boolean + nama asisten; tidak ada detail kredensial.
 */
export const assistantStatusApi = new Elysia({ prefix: "/assistant" })
	.use(apiMiddleware)
	.get(
		"/status",
		async ({ user, set }) => {
			try {
				const denied = await checkAssistantUser(user);
				if (denied) {
					set.status = denied.status;
					return { error: denied.error };
				}
				return await getAssistantStatus();
			} catch (err) {
				logger.error(
					{ err, userId: user?.id },
					"[ASSISTANT] Failed to read assistant status",
				);
				set.status = 500;
				return { error: "Gagal membaca status asisten AI" };
			}
		},
		{ detail: { summary: "AI assistant availability for the current user" } },
	);
