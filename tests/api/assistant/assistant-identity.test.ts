import { describe, expect, it } from "bun:test";
import {
	buildSystemPrompt,
	type SystemPromptInput,
} from "@/api/assistant/prompt/system-prompt";
import {
	ASSISTANT_NAME_MAX_CHARS,
	ASSISTANT_VENDOR_NAMES,
	buildLiveSessionInstruction,
	cleanAssistantName,
	LIVE_INSTRUCTIONS_MAX,
	VOICE_READ_EXACT_DEFAULT,
	VOICE_READ_EXACT_MAX_CHARS,
} from "@/config/assistant-identity";

/** Identitas asisten sama untuk chat & suara: nama dari setelan, tanpa vendor, jujur sebagai AI. */
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
	it("memakai nama dari setelan dan aturan jujur tanpa vendor", () => {
		const section = identitySection(buildSystemPrompt(BASE));
		expect(section).toContain("jawab sebagai Sari, asisten virtual Dashboard");
		for (const vendor of ASSISTANT_VENDOR_NAMES)
			expect(section).toContain(vendor);
		expect(section).toContain("jangan menyangkal bahwa kamu AI");
		expect(section).toContain("admin/pengelola");
		expect(section).not.toContain("Jenna");
	});

	it("nama lain di setelan ikut terpakai", () => {
		const p = buildSystemPrompt({ ...BASE, assistantName: "Made" });
		expect(identitySection(p)).toContain("jawab sebagai Made");
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
	it("berisi nama, larangan mengaku vendor, dan perintah delegasi", () => {
		const text = buildLiveSessionInstruction("Sari", null);
		expect(text).toContain(
			"Kamu Sari, asisten virtual dashboard Desa Darmasaba",
		);
		expect(text).toContain("Jangan pernah mengaku ChatGPT, OpenAI");
		expect(text).toContain("Delegasikan SEMUA pertanyaan");
		expect(text).toContain("termasuk identitas dan teknologi");
		expect(text).toContain(VOICE_READ_EXACT_DEFAULT);
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
