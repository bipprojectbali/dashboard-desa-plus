import { prisma } from "@/utils/db";
import logger from "@/utils/logger";

/** Aksi admin AI assistant yang dicatat ke ActivityLog. */
export type AssistantAdminAction =
	| "assistant-settings-update"
	| "assistant-provider-update"
	| "assistant-provider-test";

/**
 * Catat aksi admin ke ActivityLog. `detail` hanya boleh berisi nama field,
 * slot, dan hasil — tidak pernah API key, URL lengkap, atau isi personaNote.
 * Gagal mencatat tidak membatalkan perubahan yang sudah tersimpan.
 */
export async function logAssistantAdminActivity(
	userId: string,
	action: AssistantAdminAction,
	detail: Record<string, unknown>,
	request: Request,
): Promise<void> {
	try {
		await prisma.activityLog.create({
			data: {
				userId,
				action,
				detail: JSON.stringify(detail),
				ipAddress:
					request.headers.get("x-forwarded-for") ??
					request.headers.get("x-real-ip") ??
					null,
				userAgent: request.headers.get("user-agent") ?? null,
			},
		});
	} catch (err) {
		logger.error(
			{ err, userId, action },
			"[ASSISTANT_ADMIN] Failed to write activity log",
		);
	}
}
