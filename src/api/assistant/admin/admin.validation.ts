import {
	validateBaseUrl,
	validateSettings,
} from "@/components/admin/ai-assistant/ai-assistant.logic";
import type {
	AssistantSettingsUpdate,
	ProviderSlotUpdate,
} from "@/types/ai-assistant-admin";

/**
 * Validasi server untuk endpoint admin AI assistant. Aturan rentang batas
 * memakai fungsi yang sama dengan form UI (`ai-assistant.logic.ts`) supaya
 * keduanya tidak berbeda; server menambah aturan yang tidak bisa dipercaya
 * dari klien (http di produksi, panjang field, rentang angka slot).
 */

export const PROVIDER_FIELD_LIMITS = {
	labelMax: 60,
	modelMax: 120,
	apiKeyMax: 500,
	temperatureMin: 0,
	temperatureMax: 2,
	maxTokensMin: 1,
	maxTokensMax: 200_000,
	timeoutMsMin: 5_000,
	timeoutMsMax: 300_000,
} as const;

export type FieldErrors = Record<string, string>;

/** Rapikan teks bebas: trim, string kosong → null. */
export function normalizeOptionalText(value: string | null): string | null {
	const trimmed = value?.trim() ?? "";
	return trimmed === "" ? null : trimmed;
}

/** Bentuk akhir pengaturan yang disimpan (nama & personaNote dirapikan). */
export function normalizeSettings(
	body: AssistantSettingsUpdate,
): AssistantSettingsUpdate {
	return {
		...body,
		assistantName: body.assistantName.trim(),
		personaNote: normalizeOptionalText(body.personaNote),
		kioskUserId: normalizeOptionalText(body.kioskUserId),
		voiceLiveModel: body.voiceLiveModel.trim(),
		voiceName: normalizeOptionalText(body.voiceName),
		voiceReadExactInstruction: normalizeOptionalText(
			body.voiceReadExactInstruction,
		),
	};
}

/** Error per field pengaturan; objek kosong = valid. */
export function validateSettingsUpdate(
	body: AssistantSettingsUpdate,
): FieldErrors {
	return validateSettings(normalizeSettings(body)) as FieldErrors;
}

/**
 * Base URL slot: aturan form (https, http hanya localhost, diakhiri `/v1`)
 * ditambah larangan http sama sekali di produksi.
 */
export function validateProviderBaseUrl(
	raw: string,
	isProduction: boolean,
): string | null {
	const formError = validateBaseUrl(raw);
	if (formError || !raw.trim()) return formError;
	if (isProduction && new URL(raw.trim()).protocol !== "https:")
		return "Wajib https:// di produksi";
	return null;
}

function outOfRange(
	value: number | null,
	min: number,
	max: number,
	integer: boolean,
): boolean {
	if (value === null) return false;
	if (integer && !Number.isInteger(value)) return true;
	return !Number.isFinite(value) || value < min || value > max;
}

/** Error per field slot kredensial; objek kosong = valid. */
export function validateProviderUpdate(
	body: ProviderSlotUpdate,
	isProduction: boolean,
): FieldErrors {
	const L = PROVIDER_FIELD_LIMITS;
	const errors: FieldErrors = {};
	if ((body.label?.trim().length ?? 0) > L.labelMax)
		errors.label = `Maksimal ${L.labelMax} karakter`;
	if ((body.model?.trim().length ?? 0) > L.modelMax)
		errors.model = `Maksimal ${L.modelMax} karakter`;
	if (body.baseUrl?.trim()) {
		const urlError = validateProviderBaseUrl(body.baseUrl, isProduction);
		if (urlError) errors.baseUrl = urlError;
	}
	if (outOfRange(body.temperature, L.temperatureMin, L.temperatureMax, false))
		errors.temperature = `Harus ${L.temperatureMin}–${L.temperatureMax}`;
	if (outOfRange(body.maxTokens, L.maxTokensMin, L.maxTokensMax, true))
		errors.maxTokens = `Harus bilangan bulat ${L.maxTokensMin}–${L.maxTokensMax}`;
	if (outOfRange(body.timeoutMs, L.timeoutMsMin, L.timeoutMsMax, true))
		errors.timeoutMs = `Harus bilangan bulat ${L.timeoutMsMin}–${L.timeoutMsMax}`;
	if (body.apiKey !== undefined) {
		const key = body.apiKey.trim();
		if (key.length > L.apiKeyMax)
			errors.apiKey = `Maksimal ${L.apiKeyMax} karakter`;
		else if (/\s/.test(key)) errors.apiKey = "API key tidak boleh berisi spasi";
	}
	return errors;
}

/** Ringkas error per field menjadi satu pesan untuk respons 422. */
export function formatFieldErrors(errors: FieldErrors): string {
	return Object.entries(errors)
		.map(([field, message]) => `${field}: ${message}`)
		.join("; ");
}
