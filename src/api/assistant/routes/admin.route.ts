import Elysia, { t } from "elysia";
import { apiMiddleware } from "@/middleware/apiMiddleware";
import { PROVIDER_FEATURES } from "@/types/ai-assistant-admin";
import logger from "@/utils/logger";
import {
	getAdminOverview,
	saveProvider,
	saveSettings,
} from "../admin/admin.service";
import { logAssistantAdminActivity } from "../admin/admin-activity";
import { testProviderConnection } from "../admin/connection-test";
import type { ProviderSlot } from "../config/settings.repo";
import { checkAdminUser } from "../http/access";

/**
 * `/api/admin/ai-assistant/*` — pengaturan & kredensial AI assistant
 * (admin, sesi browser). Kontrak: `src/types/ai-assistant-admin.ts`.
 * API key tidak pernah ada di respons maupun ActivityLog.
 */

const isProduction = () => process.env.NODE_ENV === "production";

const settingsBody = t.Object({
	enabled: t.Boolean(),
	assistantName: t.String(),
	personaNote: t.Union([t.String(), t.Null()]),
	dailyMessageLimitPerUser: t.Number(),
	dailyTokenLimitGlobal: t.Number(),
	ratePerMinutePerUser: t.Number(),
	maxInputChars: t.Number(),
	historyWindow: t.Number(),
	retentionDays: t.Number(),
	kioskUserId: t.Union([t.String(), t.Null()]),
	dailyMessageLimitKiosk: t.Number(),
});

const providerBody = t.Object({
	enabled: t.Boolean(),
	label: t.Union([t.String(), t.Null()]),
	baseUrl: t.Union([t.String(), t.Null()]),
	model: t.Union([t.String(), t.Null()]),
	temperature: t.Union([t.Number(), t.Null()]),
	maxTokens: t.Union([t.Number(), t.Null()]),
	timeoutMs: t.Number(),
	apiKey: t.Optional(t.String()),
});

const featureParams = t.Object({
	feature: t.UnionEnum([...PROVIDER_FEATURES]),
});

export const assistantAdminApi = new Elysia({ prefix: "/admin/ai-assistant" })
	.use(apiMiddleware)
	.onBeforeHandle(async ({ user, set }) => {
		const denied = await checkAdminUser(user);
		if (denied) {
			set.status = denied.status;
			return { error: denied.error };
		}
	})
	.onError(({ error, code, set, request }) => {
		if (code === "VALIDATION" || code === "NOT_FOUND") return;
		logger.error(
			{
				err: error,
				method: request.method,
				path: new URL(request.url).pathname,
			},
			"[ASSISTANT_ADMIN] Request failed",
		);
		set.status = 500;
		return { error: "Terjadi kesalahan server" };
	})
	.get("/", () => getAdminOverview(), {
		detail: { summary: "AI assistant settings, slots and today stats (admin)" },
	})
	.put(
		"/settings",
		async ({ user, body, set, request }) => {
			const adminId = user?.id ?? "";
			const result = await saveSettings(adminId, body);
			if (!result.ok) {
				set.status = result.status;
				return { error: result.error };
			}
			await logAssistantAdminActivity(
				adminId,
				"assistant-settings-update",
				{ changed: result.changed },
				request,
			);
			return result.value;
		},
		{ body: settingsBody, detail: { summary: "Update AI assistant settings" } },
	)
	.put(
		"/providers/:feature",
		async ({ user, params, body, set, request }) => {
			const adminId = user?.id ?? "";
			const feature = params.feature as ProviderSlot;
			const result = await saveProvider(adminId, feature, body, isProduction());
			if (!result.ok) {
				set.status = result.status;
				return { error: result.error };
			}
			await logAssistantAdminActivity(
				adminId,
				"assistant-provider-update",
				{ feature, changed: result.changed, apiKey: result.apiKeyAction },
				request,
			);
			return result.value;
		},
		{
			params: featureParams,
			body: providerBody,
			detail: { summary: "Update one AI provider slot (chat/pointer/voice)" },
		},
	)
	.post(
		"/providers/:feature/test",
		async ({ user, params, request }) => {
			const feature = params.feature as ProviderSlot;
			const result = await testProviderConnection(feature, {
				isProduction: isProduction(),
			});
			await logAssistantAdminActivity(
				user?.id ?? "",
				"assistant-provider-test",
				{ feature, ok: result.ok },
				request,
			);
			return result;
		},
		{
			params: featureParams,
			detail: { summary: "Test the stored credentials of one slot" },
		},
	);
