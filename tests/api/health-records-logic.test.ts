import { describe, expect, it } from "bun:test";
import {
	fmtDate,
	IBU_HAMIL_STATUS,
	resolveHealthStatus,
	STUNTING_STATUS,
} from "@/components/sosial/health-records.format";
import {
	HEALTH_RECORDS_PAGE_SIZE,
	paginateByBanjar,
} from "@/components/sosial/health-records.paging";

const rows = Array.from({ length: 23 }, (_, i) => ({
	id: `r${i}`,
	banjar: i % 2 === 0 ? "b-even" : "b-odd",
}));
const banjarOf = (r: { banjar: string }) => r.banjar;

describe("paginateByBanjar", () => {
	it("pages all rows when no banjar is selected", () => {
		const first = paginateByBanjar(rows, null, banjarOf, 1);
		expect(first.total).toBe(23);
		expect(first.totalPages).toBe(3);
		expect(first.data).toHaveLength(HEALTH_RECORDS_PAGE_SIZE);
		expect(
			paginateByBanjar(rows, null, banjarOf, 3).data.map((r) => r.id),
		).toEqual(["r20", "r21", "r22"]);
	});

	it("filters by banjar before paging", () => {
		const page = paginateByBanjar(rows, "b-odd", banjarOf, 2);
		expect(page.total).toBe(11);
		expect(page.totalPages).toBe(2);
		expect(page.data.map((r) => r.id)).toEqual(["r21"]);
	});

	it("reports one page and no data for an empty result", () => {
		expect(paginateByBanjar(rows, "unknown", banjarOf, 1)).toEqual({
			total: 0,
			totalPages: 1,
			data: [],
		});
	});

	it("excludes rows without a banjar when filtering", () => {
		const mixed = [{ b: undefined }, { b: "x" }];
		expect(paginateByBanjar(mixed, "x", (r) => r.b, 1).total).toBe(1);
	});
});

describe("health status & date formatting", () => {
	it("maps known status codes and falls back to gray for unknown ones", () => {
		expect(resolveHealthStatus(IBU_HAMIL_STATUS, "AKTIF")).toEqual({
			label: "Aktif",
			color: "green",
		});
		expect(resolveHealthStatus(STUNTING_STATUS, "STUNTING").color).toBe("red");
		expect(resolveHealthStatus(STUNTING_STATUS, "LAINNYA")).toEqual({
			label: "LAINNYA",
			color: "gray",
		});
	});

	it("renders an em dash for missing dates", () => {
		expect(fmtDate(null)).toBe("—");
		expect(fmtDate("2026-01-15T00:00:00.000Z")).toContain("2026");
	});
});
