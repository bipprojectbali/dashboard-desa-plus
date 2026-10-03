import { useEffect, useState } from "react";
import type { FaqItem } from "./help-content.types";

/** Ambil FAQ publik dari `/api/bantuan/faq`; gagal memuat → daftar kosong (kartu menampilkan keadaan kosong). */
export function useFaqItems() {
	const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
	const [faqLoading, setFaqLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/bantuan/faq")
			.then((r) => r.json())
			.then((json: { data?: FaqItem[] }) => {
				if (!cancelled) setFaqItems(json.data ?? []);
			})
			.catch(() => {
				if (!cancelled) setFaqItems([]);
			})
			.finally(() => {
				if (!cancelled) setFaqLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return { faqItems, faqLoading };
}
