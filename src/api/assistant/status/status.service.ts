import type { AssistantStatusDto } from "@/types/ai-assistant-chat";
import { isSecretCryptoConfigured } from "@/utils/secret-crypto";
import {
	type AssistantSettingsValues,
	getAssistantSettings,
	getProviderConfigs,
	PROVIDER_SLOTS,
	type ProviderConfigRow,
	type ProviderSlot,
} from "../config/settings.repo";
import { isSlotUsable, pickSlot } from "../provider/resolve";

/**
 * Susun status dari pengaturan & slot. Slot `pointer` dianggap siap bila bisa
 * jatuh ke `chat` (sama seperti getProvider). Slot `voice` TIDAK jatuh ke
 * `chat`: model chat tidak bisa transkripsi/suara, jadi `voice` siap hanya bila
 * slot voice sendiri terisi dan aktif. Tanpa kunci enkripsi, tidak ada slot
 * yang bisa dipakai.
 */
export function buildAssistantStatus(
	settings: Pick<
		AssistantSettingsValues,
		"enabled" | "assistantName" | "maxInputChars"
	>,
	configs: Record<ProviderSlot, ProviderConfigRow>,
	cryptoConfigured: boolean,
): AssistantStatusDto {
	const slots = {} as Record<ProviderSlot, boolean>;
	for (const slot of PROVIDER_SLOTS) {
		const usable =
			slot === "voice"
				? isSlotUsable(configs.voice)
				: pickSlot(configs, slot) !== null;
		slots[slot] = cryptoConfigured && usable;
	}
	return {
		enabled: settings.enabled,
		assistantName: settings.assistantName,
		maxInputChars: settings.maxInputChars,
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
