import type { FaqItem } from "./help-content.types";

/** Kelompokkan FAQ per kategori, urutan kategori & item mengikuti urutan masukan. */
export function groupFaqByCategory(
	items: FaqItem[],
): Record<string, FaqItem[]> {
	return items.reduce<Record<string, FaqItem[]>>((acc, faq) => {
		const bucket = acc[faq.category];
		if (bucket) {
			bucket.push(faq);
		} else {
			acc[faq.category] = [faq];
		}
		return acc;
	}, {});
}
