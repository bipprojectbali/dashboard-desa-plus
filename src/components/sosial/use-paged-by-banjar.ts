import { useEffect, useState } from "react";

/** Reset ke halaman 1 setiap kali filter banjar berubah. */
export function usePagedByBanjar(banjarId: string | null) {
	const [page, setPage] = useState(1);
	// biome-ignore lint/correctness/useExhaustiveDependencies: banjarId change should reset page to 1
	useEffect(() => {
		setPage(1);
	}, [banjarId]);
	return { page, setPage };
}
