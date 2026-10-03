import { isVerified, UNVERIFIED_MESSAGE } from "@/middleware/verified-user";
import { prisma } from "@/utils/db";
import { loadAllowedFeatures } from "@/utils/permission";

/**
 * Penjaga akses endpoint AI assistant. apiMiddleware sudah menolak request
 * tanpa user (401) dan user belum terverifikasi (403); di sini ditambah aturan
 * khusus asisten: hanya sesi browser (bukan API key dashboard), izin
 * `use-ai-assistant`, dan role yang selalu dibaca dari DB.
 */

export const ACCESS_MESSAGES = {
	unauthorized: "Unauthorized",
	sessionOnly: "Asisten AI hanya bisa dipakai lewat sesi browser",
	unverified: UNVERIFIED_MESSAGE,
	noPermission: "Anda tidak punya akses ke asisten AI",
	adminOnly: "Hanya admin yang boleh mengatur asisten AI",
	noVoicePermission: "Anda tidak punya izin memakai mode suara.",
} as const;

export interface AccessUser {
	id: string;
	role?: string | null;
	emailVerified?: boolean | null;
	authMethod?: "session" | "apiKey";
}

export type AccessDenied = { status: 401 | 403; error: string };

/** Aturan dasar semua endpoint asisten: ada user, sesi browser, terverifikasi. */
export function checkSessionUser(
	user: AccessUser | null | undefined,
): AccessDenied | null {
	if (!user) return { status: 401, error: ACCESS_MESSAGES.unauthorized };
	if (user.authMethod !== "session")
		return { status: 403, error: ACCESS_MESSAGES.sessionOnly };
	if (!isVerified(user))
		return { status: 403, error: ACCESS_MESSAGES.unverified };
	return null;
}

/**
 * Role dari DB, bukan dari sesi: role di sesi bisa basi hingga 30 hari
 * (cookieCache Better Auth), sehingga izin yang dicabut admin atau role yang
 * diturunkan tidak langsung berlaku. null bila user sudah dihapus.
 */
async function loadDbRole(userId: string): Promise<string | null> {
	const row = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});
	return row ? (row.role ?? "user") : null;
}

/** Pemakai asisten yang lolos: role & izin dari DB, siap dipakai ToolContext. */
export interface AssistantPrincipal {
	user: { id: string; role: string };
	allowedFeatures: string[];
}

/** Pemakai asisten: aturan dasar + izin `use-ai-assistant` untuk role-nya (dari DB). */
export async function authorizeAssistantUser(
	user: AccessUser | null | undefined,
): Promise<{ denied: AccessDenied } | { principal: AssistantPrincipal }> {
	const denied = checkSessionUser(user);
	if (denied || !user)
		return {
			denied: denied ?? { status: 401, error: ACCESS_MESSAGES.unauthorized },
		};
	const role = await loadDbRole(user.id);
	if (role === null)
		return { denied: { status: 401, error: ACCESS_MESSAGES.unauthorized } };
	const allowedFeatures = await loadAllowedFeatures(role);
	if (!allowedFeatures.includes("use-ai-assistant"))
		return { denied: { status: 403, error: ACCESS_MESSAGES.noPermission } };
	return { principal: { user: { id: user.id, role }, allowedFeatures } };
}

/** Izin mode suara: pemakai asisten yang role-nya juga punya `use-ai-voice` (dari DB). */
export function hasVoicePermission(principal: AssistantPrincipal): boolean {
	return principal.allowedFeatures.includes("use-ai-voice");
}

/** Pemakai mode suara: authorizeAssistantUser + izin `use-ai-voice`. */
export async function authorizeVoiceUser(
	user: AccessUser | null | undefined,
): Promise<{ denied: AccessDenied } | { principal: AssistantPrincipal }> {
	const result = await authorizeAssistantUser(user);
	if ("denied" in result) return result;
	if (!hasVoicePermission(result.principal))
		return {
			denied: { status: 403, error: ACCESS_MESSAGES.noVoicePermission },
		};
	return result;
}

/** Versi ringkas authorizeAssistantUser: hanya penolakan (null = boleh). */
export async function checkAssistantUser(
	user: AccessUser | null | undefined,
): Promise<AccessDenied | null> {
	const result = await authorizeAssistantUser(user);
	return "denied" in result ? result.denied : null;
}

/** Admin asisten: aturan dasar + role `admin` (dari DB) — endpoint ini mengubah kredensial AI. */
export async function checkAdminUser(
	user: AccessUser | null | undefined,
): Promise<AccessDenied | null> {
	const denied = checkSessionUser(user);
	if (denied || !user) return denied;
	return (await loadDbRole(user.id)) === "admin"
		? null
		: { status: 403, error: ACCESS_MESSAGES.adminOnly };
}
