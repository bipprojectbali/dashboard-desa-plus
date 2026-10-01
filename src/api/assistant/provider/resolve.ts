import logger from "@/utils/logger";
import { decryptSecret, SecretCryptoError } from "@/utils/secret-crypto";
import {
	getProviderConfigs,
	type ProviderConfigRow,
	type ProviderSlot,
} from "../config/settings.repo";
import { OpenAICompatibleProvider } from "./openai-compatible";
import type { AIProvider } from "./types";

export { invalidateAssistantConfigCache } from "../config/settings.repo";

/**
 * Alasan provider tidak tersedia: `not_configured` = slot (dan fallback chat)
 * belum lengkap/aktif; `crypto_unconfigured` = AI_CREDENTIALS_KEY kosong/salah;
 * `key_unreadable` = API key tersimpan tidak bisa didekripsi (kunci diganti) →
 * admin perlu mengisi ulang.
 */
export type ProviderUnavailableReason =
	| "not_configured"
	| "crypto_unconfigured"
	| "key_unreadable";

export type ResolveProviderResult =
	| { ok: true; provider: AIProvider; slot: ProviderSlot; model: string }
	| { ok: false; reason: ProviderUnavailableReason };

const SUPPORTED_PROVIDER_TYPE = "openai-compatible";

/** Slot siap dipakai: aktif, tipe didukung, dan URL + API key + model terisi. */
export function isSlotUsable(config: ProviderConfigRow): boolean {
	return Boolean(
		config.enabled &&
			config.providerType === SUPPORTED_PROVIDER_TYPE &&
			config.baseUrl &&
			config.apiKeyEnc &&
			config.model,
	);
}

/** Pilih slot untuk fitur: slot sendiri bila siap, selain itu slot `chat`; null bila keduanya tidak siap. */
export function pickSlot(
	configs: Record<ProviderSlot, ProviderConfigRow>,
	feature: ProviderSlot,
): ProviderConfigRow | null {
	if (isSlotUsable(configs[feature])) return configs[feature];
	if (feature !== "chat" && isSlotUsable(configs.chat)) return configs.chat;
	return null;
}

export interface ResolveDeps {
	loadConfigs?: () => Promise<Record<ProviderSlot, ProviderConfigRow>>;
	fetchImpl?: (input: string, init: RequestInit) => Promise<Response>;
}

/** Bangun provider untuk fitur (`chat`/`pointer`/`voice`) dari konfigurasi DB. */
export async function getProvider(
	feature: ProviderSlot,
	deps: ResolveDeps = {},
): Promise<ResolveProviderResult> {
	const configs = await (deps.loadConfigs ?? getProviderConfigs)();
	const config = pickSlot(configs, feature);
	if (!config?.baseUrl || !config.apiKeyEnc || !config.model) {
		return { ok: false, reason: "not_configured" };
	}

	let apiKey: string;
	try {
		apiKey = await decryptSecret(config.apiKeyEnc);
	} catch (err) {
		if (!(err instanceof SecretCryptoError)) {
			throw new Error(
				`Failed to decrypt API key for slot "${config.feature}": ${(err as Error).message}`,
				{ cause: err },
			);
		}
		logger.warn(
			{ slot: config.feature, code: err.code },
			"[ASSISTANT] Provider API key cannot be decrypted",
		);
		const unconfigured =
			err.code === "KEY_MISSING" || err.code === "KEY_INVALID";
		return {
			ok: false,
			reason: unconfigured ? "crypto_unconfigured" : "key_unreadable",
		};
	}

	const provider = new OpenAICompatibleProvider(
		{
			baseUrl: config.baseUrl,
			apiKey,
			model: config.model,
			temperature: config.temperature,
			maxTokens: config.maxTokens,
			timeoutMs: config.timeoutMs,
		},
		deps.fetchImpl,
	);
	return {
		ok: true,
		provider,
		slot: config.feature as ProviderSlot,
		model: config.model,
	};
}
