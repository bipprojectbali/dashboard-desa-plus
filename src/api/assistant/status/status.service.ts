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
import { type AssistantPrincipal, hasVoicePermission } from "../http/access";
import { isSlotUsable, pickSlot } from "../provider/resolve";
import { hasConsent } from "../voice/voice.session.repo";

/** Hak mode suara user ini: izin `use-ai-voice` & persetujuan mikrofon. */
export interface VoiceAccess {
	permitted: boolean;
	consented: boolean;
}

const NO_VOICE: VoiceAccess = { permitted: false, consented: false };

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
	voice: VoiceAccess = NO_VOICE,
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
		voiceAllowed: settings.enabled && slots.voice && voice.permitted,
		voiceConsented: voice.consented,
	};
}

/** Status asisten untuk user ini (pengaturan & slot dari cache 30 detik, persetujuan suara dari DB). */
export async function getAssistantStatus(
	principal: AssistantPrincipal,
): Promise<AssistantStatusDto> {
	const permitted = hasVoicePermission(principal);
	const [settings, configs, consented] = await Promise.all([
		getAssistantSettings(),
		getProviderConfigs(),
		permitted ? hasConsent(principal.user.id) : Promise.resolve(false),
	]);
	return buildAssistantStatus(settings, configs, isSecretCryptoConfigured(), {
		permitted,
		consented,
	});
}
