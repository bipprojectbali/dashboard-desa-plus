import { describe, expect, it } from "bun:test";
import {
	buildSystemPrompt,
	type SystemPromptInput,
} from "@/api/assistant/prompt/system-prompt";
import {
	ASSISTANT_NAME_MAX_CHARS,
	buildLiveSessionInstruction,
	cleanAssistantName,
	LIVE_INSTRUCTIONS_MAX,
	VOICE_READ_EXACT_DEFAULT,
	VOICE_READ_EXACT_MAX_CHARS,
} from "@/config/assistant-identity";

/** Keputusan #55: nama vendor tidak disebut sama sekali, termasuk di aturan larangannya. */
const VENDORS = ["OpenAI", "ChatGPT", "Claude", "Anthropic", "GPT"];

/** Identitas asisten sama untuk chat & suara (#55): nama dari setelan, larangan + pengganti, tanpa vendor. */
const BASE: SystemPromptInput = {
	assistantName: "Sari",
	personaNote: null,
	userRole: "user",
	now: new Date("2026-10-01T02:00:00Z"),
	lang: "id",
	unavailableModules: [],
	hasDataTools: true,
};

function identitySection(prompt: string): string {
	const start = prompt.indexOf("## Identitas");
	const end = prompt.indexOf("\n## ", start + 1);
	return prompt.slice(start, end === -1 ? undefined : end);
}

describe("aturan identitas di prompt chat", () => {
	it("memakai nama dari setelan, arahkan ke admin, tanpa nama vendor", () => {
		const section = identitySection(buildSystemPrompt(BASE));
		expect(section).toContain(
			"jawab bahwa kamu Sari, asisten virtual Dashboard Desa Darmasaba",
		);
		expect(section).toContain("detail teknis bisa ditanyakan ke admin");
		expect(section).toContain("jangan menyangkal bahwa kamu asisten AI");
		for (const vendor of VENDORS) expect(section).not.toContain(vendor);
		expect(section).not.toContain("Jenna");
	});

	it("larangan aturan dasar selalu disertai pengganti", () => {
		const p = buildSystemPrompt(BASE);
		expect(p).toContain("sebutkan menu tempat pengguna bisa melakukannya");
		expect(p).toContain("tolak singkat dengan sopan lalu tawarkan bantuan");
		expect(p).toContain("sebutkan modul yang bisa dicek");
	});

	it("nama lain di setelan ikut terpakai", () => {
		const p = buildSystemPrompt({ ...BASE, assistantName: "Made" });
		expect(identitySection(p)).toContain("jawab bahwa kamu Made");
	});

	it("mode suara menambah aturan 2–4 kalimat tanpa markdown", () => {
		const p = buildSystemPrompt({ ...BASE, voice: true });
		expect(p).toContain("DIBACAKAN");
		expect(p).toContain("2–4 kalimat");
		expect(p).toContain("Jangan memakai markdown, tabel");
		expect(buildSystemPrompt(BASE)).not.toContain("DIBACAKAN");
	});
});

describe("instruksi sesi GPT-Live", () => {
	it("berisi nama, delegasi, dan larangan + pengganti tanpa nama vendor", () => {
		const text = buildLiveSessionInstruction("Sari", null);
		expect(text).toStartWith(
			"Kamu Sari, asisten virtual Dashboard Desa Darmasaba.",
		);
		expect(text).toContain("Untuk SETIAP pertanyaan pengguna");
		expect(text).toContain("teruskan ke backend dan bacakan jawabannya");
		expect(text).toContain(
			"Jangan menyebut nama model atau perusahaan teknologi; bila ditanya, katakan kamu Sari",
		);
		expect(text).toContain("Jangan menjawab dari pengetahuanmu sendiri.");
		for (const vendor of VENDORS) expect(text).not.toContain(vendor);
		expect(text.endsWith(`\n${VOICE_READ_EXACT_DEFAULT}`)).toBe(true);
		expect(text.length).toBeLessThanOrEqual(LIVE_INSTRUCTIONS_MAX);
	});

	it("tetap ≤ 500 karakter dengan nama & instruksi admin terpanjang", () => {
		const text = buildLiveSessionInstruction(
			"N".repeat(ASSISTANT_NAME_MAX_CHARS + 20),
			"b".repeat(VOICE_READ_EXACT_MAX_CHARS),
		);
		expect(text.length).toBeLessThanOrEqual(LIVE_INSTRUCTIONS_MAX);
		expect(text.endsWith("b".repeat(VOICE_READ_EXACT_MAX_CHARS))).toBe(true);
	});

	it("instruksi admin menggantikan bawaan bacakan-persis", () => {
		const text = buildLiveSessionInstruction("Sari", "  Baca pelan.  ");
		expect(text.endsWith("\nBaca pelan.")).toBe(true);
		expect(text).not.toContain(VOICE_READ_EXACT_DEFAULT);
	});

	it("nama dibersihkan dari baris baru dan karakter kontrol", () => {
		expect(cleanAssistantName("Sa\nri\u0000 ")).toBe("Sa ri");
		expect(cleanAssistantName("   ")).toBe("Asisten");
	});
});
