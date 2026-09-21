import { describe, expect, it } from "bun:test";
import { WALL_BENTO_ROW } from "@/components/wall/wall-bento";
import {
	LIST_ITEM_COMPACT_PX,
	LIST_ITEM_REGULAR_PX,
	LIST_ITEM_TALL_PX,
	maxVisibleItems,
} from "@/components/wall/wall-item-cap";

describe("wall-item-cap — maxVisibleItems", () => {
	it("tanpa geom (belum di-thread) → asumsikan h=1", () => {
		// h=1 → (1*240 - 70) / 52 = 3.26 → 3
		expect(maxVisibleItems(undefined, LIST_ITEM_REGULAR_PX)).toBe(3);
	});

	it("widget lebih tinggi (h besar) → cap lebih banyak", () => {
		const capH1 = maxVisibleItems({ w: 1, h: 1 }, LIST_ITEM_REGULAR_PX);
		const capH2 = maxVisibleItems({ w: 1, h: 2 }, LIST_ITEM_REGULAR_PX);
		const capH3 = maxVisibleItems({ w: 1, h: 3 }, LIST_ITEM_REGULAR_PX);
		expect(capH2).toBeGreaterThan(capH1);
		expect(capH3).toBeGreaterThan(capH2);
	});

	it("lebar (w) tidak memengaruhi cap — hanya tinggi (h) yang dipakai", () => {
		const narrow = maxVisibleItems({ w: 1, h: 2 }, LIST_ITEM_REGULAR_PX);
		const wide = maxVisibleItems({ w: 4, h: 2 }, LIST_ITEM_REGULAR_PX);
		expect(narrow).toBe(wide);
	});

	it("tidak pernah di bawah MIN_VISIBLE_ITEMS (2) walau widget sangat kecil", () => {
		// h=1, itemPx besar → available/itemPx bisa < 2, tetap dijepit ke 2
		expect(
			maxVisibleItems({ w: 1, h: 1 }, LIST_ITEM_TALL_PX),
		).toBeGreaterThanOrEqual(2);
		expect(maxVisibleItems({ w: 1, h: 1 }, 1000)).toBe(2);
	});

	it("item lebih pendek (compact) muat lebih banyak dari item tinggi (tall) di geom sama", () => {
		const geom = { w: 2, h: 2 };
		const compactCap = maxVisibleItems(geom, LIST_ITEM_COMPACT_PX);
		const tallCap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
		expect(compactCap).toBeGreaterThan(tallCap);
	});

	it("hasil sesuai formula: floor((h*WALL_BENTO_ROW - 70) / itemPx), dijepit minimal 2", () => {
		for (const h of [1, 2, 3]) {
			for (const itemPx of [
				LIST_ITEM_COMPACT_PX,
				LIST_ITEM_REGULAR_PX,
				LIST_ITEM_TALL_PX,
			]) {
				const expected = Math.max(
					2,
					Math.floor((h * WALL_BENTO_ROW - 70) / itemPx),
				);
				expect(maxVisibleItems({ w: 1, h }, itemPx)).toBe(expected);
			}
		}
	});

	it("default itemPx (tanpa parameter kedua) = LIST_ITEM_REGULAR_PX", () => {
		expect(maxVisibleItems({ w: 1, h: 2 })).toBe(
			maxVisibleItems({ w: 1, h: 2 }, LIST_ITEM_REGULAR_PX),
		);
	});
});
