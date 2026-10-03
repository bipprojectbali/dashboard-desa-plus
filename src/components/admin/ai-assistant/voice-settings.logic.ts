import { VOICE_READ_EXACT_MAX_CHARS } from "@/config/assistant-identity";
import type { AssistantSettingsDto } from "@/types/ai-assistant-admin";
import {
	VOICE_NAME_PATTERNS,
	VOICE_SETTINGS_LIMITS,
} from "@/types/ai-assistant-voice";

/**
 * Validasi setelan suara (Fitur 3) — dipakai form admin dan server supaya
 * aturannya sama. Angka: rentang `VOICE_SETTINGS_LIMITS`; teks: pola nama
 * model/suara GPT-Live dan batas instruksi baca-persis.
 */

type VoiceTextKey =
	| "voiceLiveModel"
	| "voiceName"
	| "voiceReadExactInstruction";
export type VoiceNumberKey =
	| "voiceDailyMinutesUser"
	| "voiceDailyMinutesKiosk"
	| "voiceSessionMaxMinutes"
	| "voiceIdleOffSeconds";
export type VoiceSettingsKey = VoiceTextKey | VoiceNumberKey;

const L = VOICE_SETTINGS_LIMITS;

/** Rentang angka suara. `zeroUnlimited` = 0 berarti tanpa batas. */
export const VOICE_LIMIT_RULES: Record<
	VoiceNumberKey,
	{ label: string; min: number; max: number; zeroUnlimited: boolean }
> = {
	voiceDailyMinutesUser: {
		label: "Menit suara per hari per user",
		min: 0,
		max: L.dailyMinutesMax,
		zeroUnlimited: true,
	},
	voiceDailyMinutesKiosk: {
		label: "Menit suara per hari akun kiosk",
		min: 0,
		max: L.dailyMinutesMax,
		zeroUnlimited: true,
	},
	voiceSessionMaxMinutes: {
		label: "Batas satu sesi suara (menit)",
		min: L.sessionMaxMinutesMin,
		max: L.sessionMaxMinutesMax,
		zeroUnlimited: false,
	},
	voiceIdleOffSeconds: {
		label: "Matikan otomatis bila hening (detik)",
		min: L.idleOffSecondsMin,
		max: L.idleOffSecondsMax,
		zeroUnlimited: false,
	},
};

/** Error per field suara; objek kosong = valid. */
export function validateVoiceSettings(
	s: Pick<AssistantSettingsDto, VoiceSettingsKey>,
): Partial<Record<VoiceSettingsKey, string>> {
	const errors: Partial<Record<VoiceSettingsKey, string>> = {};
	if (!VOICE_NAME_PATTERNS.model.test(s.voiceLiveModel.trim()))
		errors.voiceLiveModel =
			"Nama model tidak valid (huruf, angka, titik, - atau _)";
	const voice = s.voiceName?.trim() ?? "";
	if (voice && !VOICE_NAME_PATTERNS.voice.test(voice))
		errors.voiceName = "Nama suara tidak valid (huruf kecil, angka, - atau _)";
	if (
		(s.voiceReadExactInstruction?.trim().length ?? 0) >
		VOICE_READ_EXACT_MAX_CHARS
	)
		errors.voiceReadExactInstruction = `Maksimal ${VOICE_READ_EXACT_MAX_CHARS} karakter`;
	for (const key of Object.keys(VOICE_LIMIT_RULES) as VoiceNumberKey[]) {
		const { min, max } = VOICE_LIMIT_RULES[key];
		const v = s[key];
		if (!Number.isInteger(v) || v < min || v > max)
			errors[key] =
				`Harus bilangan bulat ${min}–${max.toLocaleString("id-ID")}`;
	}
	return errors;
}
