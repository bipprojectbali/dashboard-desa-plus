import { isSecretCryptoConfigured } from "@/utils/secret-crypto";
import {
	type AssistantSettingsValues,
	getAssistantSettings,
	getProviderConfigs,
	PROVIDER_SLOTS,
	type ProviderConfigRow,
	type ProviderSlot,
} from "../config/settings.repo";
import { pickSlot } from "../provider/resolve";

/** Respons `GET /api/assistant/status` — hanya boolean + nama, tanpa detail kredensial. */
export interface AssistantStatusDto {
	enabled: boolean;
	assistantName: string;
	slots: Record<ProviderSlot, boolean>;
}

/**
 * Susun status dari pengaturan & slot. Slot `pointer`/`voice` dianggap siap
 * bila bisa jatuh ke `chat` (sama seperti getProvider). Tanpa kunci enkripsi,
 * tidak ada slot yang bisa dipakai.
 */
export function buildAssistantStatus(
	settings: Pick<AssistantSettingsValues, "enabled" | "assistantName">,
	configs: Record<ProviderSlot, ProviderConfigRow>,
	cryptoConfigured: boolean,
): AssistantStatusDto {
	const slots = {} as Record<ProviderSlot, boolean>;
	for (const slot of PROVIDER_SLOTS) {
		slots[slot] = cryptoConfigured && pickSlot(configs, slot) !== null;
	}
	return {
		enabled: settings.enabled,
		assistantName: settings.assistantName,
		slots,
	};
}

/** Status asisten saat ini (pengaturan & slot dari cache 30 detik). */
export async function getAssistantStatus(): Promise<AssistantStatusDto> {
	const [settings, configs] = await Promise.all([
		getAssistantSettings(),
		getProviderConfigs(),
	]);
	return buildAssistantStatus(settings, configs, isSecretCryptoConfigured());
}
