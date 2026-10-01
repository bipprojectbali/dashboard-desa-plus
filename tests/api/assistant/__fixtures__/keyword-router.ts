import type { MockStep } from "@/api/assistant/provider/mock";
import type { ChatMessage, ToolSpec } from "@/api/assistant/provider/types";

/**
 * "LLM" tiruan untuk set evaluasi (test-only): memilih tool yang deskripsinya
 * paling banyak memuat kata dari pertanyaan. Hanya tool yang DITAWARKAN
 * (sudah difilter izin) yang bisa dipilih — persis seperti LLM sungguhan.
 * Setelah hasil tool diterima, menjawab teks.
 */

const STOPWORDS = new Set([
	"apa",
	"ada",
	"berapa",
	"dan",
	"data",
	"dengan",
	"desa",
	"ini",
	"itu",
	"mana",
	"paling",
	"saja",
	"sudah",
	// Kata waktu umum; tahun spesifik dibaca dari angka (lihat `year` di bawah).
	"tahun",
	"yang",
]);

const NO_TOOL_ANSWER = "Maaf, saya tidak punya akses ke data itu.";

function countOccurrences(haystack: string, needle: string): number {
	return haystack.split(needle).length - 1;
}

/** Tool dengan skor tertinggi (>0) untuk pertanyaan; null bila tidak ada yang cocok. */
export function pickTool(question: string, tools: ToolSpec[]): ToolSpec | null {
	const words = (question.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
		(w) => w.length >= 4 && !STOPWORDS.has(w),
	);
	let best: { tool: ToolSpec; score: number } | null = null;
	for (const tool of tools) {
		const desc = tool.description.toLowerCase();
		const score = words.reduce((n, w) => n + countOccurrences(desc, w), 0);
		if (score > 0 && (!best || score > best.score)) best = { tool, score };
	}
	return best?.tool ?? null;
}

function lastUserQuestion(messages: ChatMessage[]): string {
	return [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

/** Satu langkah MockProvider yang bisa diulang untuk setiap panggilan. */
export const keywordRouterStep: MockStep = (messages, opts) => {
	if (messages.at(-1)?.role === "tool") {
		return { type: "text", text: "Jawaban berdasarkan data." };
	}
	const question = lastUserQuestion(messages);
	const tool = pickTool(question, opts.tools ?? []);
	if (!tool) return { type: "text", text: NO_TOOL_ANSWER };
	const year = question.match(/\b(19|20)\d{2}\b/)?.[0];
	const args: Record<string, unknown> = {};
	if (tool.name === "ringkasan_keuangan" && year) args.tahun = Number(year);
	if (tool.name === "lookup_faq") args.pertanyaan = question;
	return {
		type: "tool_calls",
		toolCalls: [{ id: "call-1", name: tool.name, args }],
	};
};
