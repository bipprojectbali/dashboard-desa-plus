export const HEALTH_RECORDS_PAGE_SIZE = 10;

export interface BanjarPage<T> {
	total: number;
	totalPages: number;
	data: T[];
}

/** Filter baris per banjar (null = semua) lalu ambil satu halaman. */
export function paginateByBanjar<T>(
	rows: T[],
	banjarId: string | null,
	banjarOf: (row: T) => string | undefined,
	page: number,
): BanjarPage<T> {
	const filtered = banjarId
		? rows.filter((row) => banjarOf(row) === banjarId)
		: rows;
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / HEALTH_RECORDS_PAGE_SIZE));
	const data = filtered.slice(
		(page - 1) * HEALTH_RECORDS_PAGE_SIZE,
		page * HEALTH_RECORDS_PAGE_SIZE,
	);
	return { total, totalPages, data };
}
