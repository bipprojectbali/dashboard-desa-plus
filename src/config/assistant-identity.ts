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

/** Nama vendor/model yang tidak boleh disebut asisten saat ditanya identitasnya. */
export const ASSISTANT_VENDOR_NAMES = [
	"OpenAI",
	"ChatGPT",
	"Claude",
	"Anthropic",
	"GPT-Live",
] as const;

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

/** Aturan identitas di lapisan Identitas prompt chat — jujur sebagai AI, tanpa menyebut vendor. */
export function identityDisclosureRule(name: string): string {
	const clean = cleanAssistantName(name);
	return `- Bila ditanya model, vendor, atau teknologi di balikmu, jawab sebagai ${clean}, asisten virtual Dashboard ${VILLAGE_NAME}. Jangan menyebut nama vendor atau model (${ASSISTANT_VENDOR_NAMES.join(", ")}), tetapi jangan berbohong: jangan menyangkal bahwa kamu AI dan jangan mengaku dibuat pihak lain. Arahkan pertanyaan teknis lebih lanjut ke admin/pengelola dashboard.`;
}

/** Persona GPT-Live: nama, larangan mengaku vendor, dan delegasi SEMUA pertanyaan ke backend. */
export function buildVoicePersona(name: string): string {
	return `Kamu ${cleanAssistantName(name)}, asisten virtual dashboard ${VILLAGE_NAME}. Jangan pernah mengaku ChatGPT, OpenAI, atau model lain. Delegasikan SEMUA pertanyaan pengguna, termasuk identitas dan teknologi, ke backend; kamu hanya berbasa-basi singkat dan membacakan jawaban delegasi.`;
}

/** Panjang persona terpanjang (nama 60 karakter) — sisa kuota 500 untuk instruksi bacakan-persis. */
export const VOICE_PERSONA_MAX_CHARS = buildVoicePersona(
	"x".repeat(ASSISTANT_NAME_MAX_CHARS),
).length;

/** Batas setelan admin `voiceReadExactInstruction` (+1 untuk pemisah baris). */
export const VOICE_READ_EXACT_MAX_CHARS =
	LIVE_INSTRUCTIONS_MAX - VOICE_PERSONA_MAX_CHARS - 1;

/** Bawaan instruksi bacakan-persis bila admin belum mengisi `voiceReadExactInstruction`. */
export const VOICE_READ_EXACT_DEFAULT =
	"Bacakan teks delegasi kata per kata, tanpa meringkas atau berkomentar. Angka, satuan, nama, dan tahun diucapkan persis; '940,2 juta' dibaca apa adanya.";

/** Instruksi sesi GPT-Live lengkap: persona + bacakan-persis (dipotong agar ≤ 500 karakter). */
export function buildLiveSessionInstruction(
	name: string,
	readExact: string | null | undefined,
): string {
	const persona = buildVoicePersona(name);
	const extra = (readExact ?? "").trim() || VOICE_READ_EXACT_DEFAULT;
	return `${persona}\n${extra}`.slice(0, LIVE_INSTRUCTIONS_MAX);
}
