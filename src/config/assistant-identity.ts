/**
 * Identitas asisten yang sama untuk chat (prompt Claude) dan suara (instruksi
 * sesi GPT-Live). Nama selalu dari `AssistantSettings.assistantName`; modul
 * ini murni (tanpa DB) sehingga dipakai server, halaman uji, dan test.
 */

export const VILLAGE_NAME = "Desa Darmasaba";
export const ASSISTANT_NAME_MAX_CHARS = 60;
const FALLBACK_NAME = "Asisten";

/** Batas instruksi sesi GPT-Live (dokumen OpenAI `/live/sessions`). */
export const LIVE_INSTRUCTIONS_MAX = 500;

/** Nama aman untuk prompt: satu baris, tanpa karakter kontrol, maks 60 karakter. */
export function cleanAssistantName(name: string): string {
	return (
		name
			.replace(/[\p{Cc}\p{Cf}]+/gu, " ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, ASSISTANT_NAME_MAX_CHARS) || FALLBACK_NAME
	);
}

/**
 * Aturan identitas lapisan Identitas prompt chat (keputusan #55): larangan
 * selalu disertai pengganti, tanpa menyebut nama vendor agar kata itu tidak tertanam.
 */
export function identityDisclosureRule(name: string): string {
	const clean = cleanAssistantName(name);
	return `- Bila ditanya model, vendor, atau teknologi yang dipakai: jawab bahwa kamu ${clean}, asisten virtual Dashboard ${VILLAGE_NAME}, dan detail teknis bisa ditanyakan ke admin. Jangan menyebut nama model atau perusahaan teknologi, dan jangan menyangkal bahwa kamu asisten AI.`;
}

/** Nama di instruksi suara dipotong agar persona terpanjang tetap menyisakan ruang di batas 500. */
export const VOICE_NAME_MAX_CHARS = 30;

/** Persona GPT-Live final (keputusan #55): perintah positif, delegasi semua pertanyaan, larangan + pengganti. */
export function buildVoicePersona(name: string): string {
	const n = cleanAssistantName(name).slice(0, VOICE_NAME_MAX_CHARS).trim();
	return `Kamu ${n}, asisten virtual Dashboard ${VILLAGE_NAME}. Untuk SETIAP pertanyaan pengguna, termasuk tentang dirimu, teruskan ke backend dan bacakan jawabannya apa adanya; angka dan nama jangan diubah. Boleh berbasa-basi singkat saat menunggu. Jangan menyebut nama model atau perusahaan teknologi; bila ditanya, katakan kamu ${n} dan detail teknis bisa ditanyakan ke admin. Jangan menjawab dari pengetahuanmu sendiri.`;
}

/** Panjang persona terpanjang — sisa kuota 500 untuk tambahan bacakan-persis dari admin. */
export const VOICE_PERSONA_MAX_CHARS = buildVoicePersona(
	"x".repeat(VOICE_NAME_MAX_CHARS),
).length;

/** Batas setelan admin `voiceReadExactInstruction` (+1 untuk pemisah baris). */
export const VOICE_READ_EXACT_MAX_CHARS =
	LIVE_INSTRUCTIONS_MAX - VOICE_PERSONA_MAX_CHARS - 1;

/** Bawaan tambahan bacakan-persis bila admin belum mengisi; persona sudah memuat "apa adanya". */
export const VOICE_READ_EXACT_DEFAULT = "Jangan meringkas atau berkomentar.";

/** Instruksi sesi GPT-Live lengkap: persona + bacakan-persis (dipotong agar ≤ 500 karakter). */
export function buildLiveSessionInstruction(
	name: string,
	readExact: string | null | undefined,
): string {
	const persona = buildVoicePersona(name);
	const extra = (readExact ?? "").trim() || VOICE_READ_EXACT_DEFAULT;
	return `${persona}\n${extra}`.slice(0, LIVE_INSTRUCTIONS_MAX);
}
