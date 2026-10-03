import { createHash } from "node:crypto";
import { decryptSecret, SecretCryptoError } from "@/utils/secret-crypto";
import {
	getProviderConfigs,
	type ProviderConfigRow,
	type ProviderSlot,
} from "../config/settings.repo";
import { VOICE_SLOT_MESSAGES } from "./voice.constants";

/** Kredensial slot Suara yang siap dipakai server — tidak pernah dikirim ke browser. */
export interface VoiceSlotCredentials {
	baseUrl: string;
	apiKey: string;
}

export type VoiceSlotResult =
	| { ok: true; slot: VoiceSlotCredentials }
	| { ok: false; status: number; error: string; code: VoiceSlotErrorCode };

export type VoiceSlotErrorCode =
	| "voice_slot_empty"
	| "voice_slot_disabled"
	| "crypto_unconfigured"
	| "key_unreadable";

export interface VoiceSlotDeps {
	loadConfigs?: () => Promise<Record<ProviderSlot, ProviderConfigRow>>;
	decrypt?: (payload: string) => Promise<string>;
}

const fail = (
	status: number,
	code: VoiceSlotErrorCode,
	error: string,
): VoiceSlotResult => ({ ok: false, status, error, code });

/**
 * Ambil kredensial HANYA dari slot `voice` — sengaja tidak memakai `pickSlot`
 * (yang jatuh balik ke slot Chat): kunci Chat bukan kunci OpenAI untuk suara,
 * dan mode suara/halaman uji tidak boleh diam-diam memakai kunci lain.
 */
export async function resolveVoiceSlot(
	deps: VoiceSlotDeps = {},
): Promise<VoiceSlotResult> {
	const configs = await (deps.loadConfigs ?? getProviderConfigs)();
	const row = configs.voice;
	if (!row.baseUrl || !row.apiKeyEnc)
		return fail(409, "voice_slot_empty", VOICE_SLOT_MESSAGES.slotEmpty);
	if (!row.enabled)
		return fail(409, "voice_slot_disabled", VOICE_SLOT_MESSAGES.slotDisabled);
	try {
		const apiKey = await (deps.decrypt ?? decryptSecret)(row.apiKeyEnc);
		return {
			ok: true,
			slot: { baseUrl: row.baseUrl.replace(/\/+$/, ""), apiKey },
		};
	} catch (err) {
		if (!(err instanceof SecretCryptoError)) {
			throw new Error(
				`Failed to read API key for slot "voice": ${(err as Error).message}`,
				{ cause: err },
			);
		}
		const missing = err.code === "KEY_MISSING" || err.code === "KEY_INVALID";
		return missing
			? fail(503, "crypto_unconfigured", VOICE_SLOT_MESSAGES.cryptoMissing)
			: fail(409, "key_unreadable", VOICE_SLOT_MESSAGES.needsReentry);
	}
}

/** Pengenal pengguna untuk header `OpenAI-Safety-Identifier`: hash SHA-256 ID user (bukan email). */
export function hashSafetyIdentifier(userId: string): string {
	return createHash("sha256").update(`voice-lab:${userId}`).digest("hex");
}
