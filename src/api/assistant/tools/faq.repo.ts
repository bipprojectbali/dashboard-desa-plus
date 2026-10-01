import { prisma } from "@/utils/db";

/** Pencarian FAQ terpublikasi untuk asisten — full-text Postgres (`simple`), pola sama dengan search.ts. */

export const FAQ_RESULT_LIMIT = 5;
const MAX_TERMS = 12;
const MIN_TERM_CHARS = 3;

export interface FaqHit {
	question: string;
	answer: string;
	category: string;
}

/**
 * Kata kunci → tsquery OR dengan pencocokan awalan (`ekspor:*`). Hanya huruf/
 * angka yang lolos, jadi tidak ada sintaks tsquery dari input. null bila
 * tidak ada kata yang cukup panjang.
 */
export function buildFaqTsQuery(text: string): string | null {
	const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
	const terms = [...new Set(words.filter((w) => w.length >= MIN_TERM_CHARS))]
		.slice(0, MAX_TERMS)
		.map((w) => `${w}:*`);
	return terms.length > 0 ? terms.join(" | ") : null;
}

/** FAQ terpublikasi paling relevan (maks FAQ_RESULT_LIMIT); kosong bila tak ada kata kunci. */
export async function searchPublishedFaq(text: string): Promise<FaqHit[]> {
	const tsQuery = buildFaqTsQuery(text);
	if (!tsQuery) return [];
	return prisma.$queryRaw<FaqHit[]>`
    SELECT question, answer, category
    FROM "faq"
    WHERE "isPublished" = true
      AND to_tsvector('simple', coalesce(question,'') || ' ' || coalesce(answer,''))
          @@ to_tsquery('simple', ${tsQuery})
    ORDER BY ts_rank(
        to_tsvector('simple', coalesce(question,'') || ' ' || coalesce(answer,'')),
        to_tsquery('simple', ${tsQuery})
      ) DESC, "order" ASC
    LIMIT ${FAQ_RESULT_LIMIT}
  `;
}
