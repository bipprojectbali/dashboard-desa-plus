import type {
	AiAssistantAdminOverviewDto,
	ApiKeyStatus,
	AssistantSettingsDto,
	AssistantSettingsUpdate,
	ProviderSlotDto,
	ProviderSlotUpdate,
} from "@/types/ai-assistant-admin";
import { prisma } from "@/utils/db";
import {
	decryptSecret,
	encryptSecret,
	isSecretCryptoConfigured,
	SecretCryptoError,
} from "@/utils/secret-crypto";
import {
	getAssistantSettings,
	getProviderConfigs,
	invalidateAssistantConfigCache,
	PROVIDER_SLOTS,
	type ProviderConfigRow,
	type ProviderSlot,
} from "../config/settings.repo";
import {
	type FieldErrors,
	formatFieldErrors,
	normalizeOptionalText,
	normalizeSettings,
	validateProviderUpdate,
	validateSettingsUpdate,
} from "./admin.validation";
import {
	getTodayStats,
	isVerifiedUser,
	listKioskCandidates,
} from "./admin-stats.repo";
import { maskApiKey } from "./api-key-hint";

/**
 * Layanan halaman admin AI assistant: baca overview, simpan pengaturan, dan
 * simpan slot kredensial. API key hanya keluar sebagai status + hint; setiap
 * simpan membuang cache config (provider/resolve membaca ulang dari DB).
 */

const SETTINGS_ID = "singleton";

export type ServiceResult<T> =
	| { ok: true; value: T; changed: string[] }
	| { ok: false; status: 409 | 422; error: string };

type Decrypt = (payload: string) => Promise<string>;

/** Status kunci tersimpan. Kunci tak terbaca (AI_CREDENTIALS_KEY berganti/data rusak) → `needs-reentry`. */
export async function apiKeyStatusOf(
	apiKeyEnc: string | null,
	decrypt: Decrypt = decryptSecret,
): Promise<ApiKeyStatus> {
	if (!apiKeyEnc) return "missing";
	try {
		await decrypt(apiKeyEnc);
		return "set";
	} catch (err) {
		if (!(err instanceof SecretCryptoError)) {
			throw new Error(
				`Failed to check stored API key: ${(err as Error).message}`,
				{ cause: err },
			);
		}
		if (err.code === "DECRYPT_FAILED" || err.code === "BAD_FORMAT")
			return "needs-reentry";
		// KEY_MISSING/KEY_INVALID: kunci tersimpan, server belum bisa membacanya —
		// ditandai lewat `cryptoConfigured: false`, bukan dengan meminta isi ulang.
		return "set";
	}
}

/** Baris slot → DTO untuk browser (tanpa `apiKeyEnc`). */
export async function toSlotDto(
	row: ProviderConfigRow,
	decrypt?: Decrypt,
): Promise<ProviderSlotDto> {
	return {
		feature: row.feature as ProviderSlot,
		enabled: row.enabled,
		label: row.label,
		providerType: row.providerType,
		baseUrl: row.baseUrl,
		model: row.model,
		temperature: row.temperature,
		maxTokens: row.maxTokens,
		timeoutMs: row.timeoutMs,
		apiKeyStatus: await apiKeyStatusOf(row.apiKeyEnc, decrypt),
		apiKeyHint: row.apiKeyHint,
		lastTestAt: row.lastTestAt?.toISOString() ?? null,
		lastTestOk: row.lastTestOk,
	};
}

function toSettingsDto(
	values: AssistantSettingsDto & { id?: string },
): AssistantSettingsDto {
	const { id: _id, ...settings } = values;
	return settings;
}

/** Data halaman `/admin/ai-assistant`. */
export async function getAdminOverview(): Promise<AiAssistantAdminOverviewDto> {
	const [settings, configs, today, kioskCandidates] = await Promise.all([
		getAssistantSettings(),
		getProviderConfigs(),
		getTodayStats(),
		listKioskCandidates(),
	]);
	return {
		settings: toSettingsDto(settings),
		providers: await Promise.all(
			PROVIDER_SLOTS.map((slot) => toSlotDto(configs[slot])),
		),
		today,
		kioskCandidates,
		cryptoConfigured: isSecretCryptoConfigured(),
	};
}

function changedKeys<T extends object>(before: T, after: T): string[] {
	return (Object.keys(after) as (keyof T)[])
		.filter((k) => before[k] !== after[k])
		.map(String);
}

function invalid(errors: FieldErrors): {
	ok: false;
	status: 422;
	error: string;
} {
	return { ok: false, status: 422, error: formatFieldErrors(errors) };
}

/** Validasi lalu simpan pengaturan umum & batas pemakaian. */
export async function saveSettings(
	adminId: string,
	body: AssistantSettingsUpdate,
): Promise<ServiceResult<AssistantSettingsDto>> {
	const errors = validateSettingsUpdate(body);
	if (Object.keys(errors).length > 0) return invalid(errors);
	const next = normalizeSettings(body);
	if (next.kioskUserId && !(await isVerifiedUser(next.kioskUserId)))
		return invalid({ kioskUserId: "Akun kiosk harus user terverifikasi" });

	const before = toSettingsDto(await getAssistantSettings());
	const row = await prisma.assistantSettings.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...next, updatedBy: adminId },
		update: { ...next, updatedBy: adminId },
	});
	invalidateAssistantConfigCache();
	const { updatedAt: _u, updatedBy: _b, ...saved } = row;
	const settings = toSettingsDto(saved);
	return { ok: true, value: settings, changed: changedKeys(before, settings) };
}

export type ApiKeyAction = "unchanged" | "replaced" | "removed";

/** `apiKey` tidak dikirim = pertahankan, `""` = hapus, string = ganti. */
export function apiKeyActionOf(apiKey: string | undefined): ApiKeyAction {
	if (apiKey === undefined) return "unchanged";
	return apiKey.trim() === "" ? "removed" : "replaced";
}

/** Validasi lalu simpan satu slot kredensial. Hasil test lama dibuang bila URL/model/kunci berubah. */
export async function saveProvider(
	adminId: string,
	feature: ProviderSlot,
	body: ProviderSlotUpdate,
	isProduction: boolean,
): Promise<ServiceResult<ProviderSlotDto> & { apiKeyAction?: ApiKeyAction }> {
	const errors = validateProviderUpdate(body, isProduction);
	if (Object.keys(errors).length > 0) return invalid(errors);

	const apiKeyAction = apiKeyActionOf(body.apiKey);
	if (apiKeyAction === "replaced" && !isSecretCryptoConfigured()) {
		return {
			ok: false,
			status: 409,
			error:
				"AI_CREDENTIALS_KEY belum diset di server — API key tidak bisa disimpan",
		};
	}

	const fields = {
		enabled: body.enabled,
		label: normalizeOptionalText(body.label),
		baseUrl: normalizeOptionalText(body.baseUrl)?.replace(/\/+$/, "") ?? null,
		model: normalizeOptionalText(body.model),
		temperature: body.temperature,
		maxTokens: body.maxTokens,
		timeoutMs: body.timeoutMs,
	};
	const keyFields =
		apiKeyAction === "replaced"
			? {
					apiKeyEnc: await encryptSecret((body.apiKey ?? "").trim()),
					apiKeyHint: maskApiKey(body.apiKey ?? ""),
				}
			: apiKeyAction === "removed"
				? { apiKeyEnc: null, apiKeyHint: null }
				: {};

	const before = await prisma.aiProviderConfig.findUnique({
		where: { feature },
	});
	const changed = before
		? changedKeys(
				{
					enabled: before.enabled,
					label: before.label,
					baseUrl: before.baseUrl,
					model: before.model,
					temperature: before.temperature,
					maxTokens: before.maxTokens,
					timeoutMs: before.timeoutMs,
				},
				fields,
			)
		: Object.keys(fields);
	const connectionChanged =
		apiKeyAction !== "unchanged" ||
		changed.includes("baseUrl") ||
		changed.includes("model");
	const testReset = connectionChanged
		? { lastTestAt: null, lastTestOk: null }
		: {};

	const row = await prisma.aiProviderConfig.upsert({
		where: { feature },
		create: { feature, ...fields, ...keyFields, updatedBy: adminId },
		update: { ...fields, ...keyFields, ...testReset, updatedBy: adminId },
	});
	invalidateAssistantConfigCache();
	const { updatedAt: _u, updatedBy: _b, ...saved } = row;
	return { ok: true, value: await toSlotDto(saved), changed, apiKeyAction };
}
