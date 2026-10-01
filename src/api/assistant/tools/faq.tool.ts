import { type FaqHit, searchPublishedFaq } from "./faq.repo";
import type { ToolDefinition } from "./types";

/** Batas teks satu jawaban FAQ yang dikirim ke LLM. */
export const FAQ_ANSWER_MAX_CHARS = 1500;
const QUERY_MAX_CHARS = 300;

export interface FaqToolDeps {
	search: (text: string) => Promise<FaqHit[]>;
}

/** `lookup_faq` — cari jawaban di FAQ terpublikasi (halaman Bantuan). */
export function createLookupFaqTool(
	deps: FaqToolDeps = { search: searchPublishedFaq },
): ToolDefinition {
	return {
		name: "lookup_faq",
		description:
			"Cari jawaban di FAQ (pertanyaan umum) halaman Bantuan tentang cara memakai dashboard: cara melakukan sesuatu, fitur, menu, akun, ekspor data, dan pengaturan. Pakai untuk pertanyaan 'bagaimana cara...' tentang aplikasi, bukan untuk angka/statistik desa.",
		parameters: {
			type: "object",
			properties: {
				pertanyaan: {
					type: "string",
					description:
						"Kata kunci atau pertanyaan pengguna, mis. 'cara ekspor data'.",
				},
			},
			required: ["pertanyaan"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args) {
			const text =
				typeof args.pertanyaan === "string"
					? args.pertanyaan.slice(0, QUERY_MAX_CHARS)
					: "";
			if (!text.trim())
				return { ok: false, error: "Parameter pertanyaan wajib diisi." };
			const hits = await deps.search(text);
			return {
				ok: true,
				data: {
					jumlah: hits.length,
					hasil: hits.map((h) => ({
						kategori: h.category,
						pertanyaan: h.question,
						jawaban:
							h.answer.length > FAQ_ANSWER_MAX_CHARS
								? `${h.answer.slice(0, FAQ_ANSWER_MAX_CHARS)}…`
								: h.answer,
					})),
				},
			};
		},
	};
}

export const lookupFaqTool = createLookupFaqTool();
