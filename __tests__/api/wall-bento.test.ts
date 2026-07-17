import { describe, expect, it } from "bun:test";
import {
	BENTO_SPAN,
	bentoClass,
	bentoCss,
	WALL_BENTO_COLLAPSE_PX,
	type WallSize,
} from "@/components/wall/wall-bento";
import { ALL_WIDGET_IDS } from "@/components/wall/wall-layout-utils";
import { allWidgets, getWidget } from "@/components/wall/widget-registry";

const SIZES: WallSize[] = ["sm", "wide", "tall", "lg"];

describe("wall-bento — peta span", () => {
	it("tiap ukuran punya span col/row >= 1", () => {
		for (const size of SIZES) {
			const span = BENTO_SPAN[size];
			expect(span.col).toBeGreaterThanOrEqual(1);
			expect(span.row).toBeGreaterThanOrEqual(1);
		}
	});

	it("span maksimum 2 di tiap sumbu (aman untuk collapse 1 kolom)", () => {
		for (const size of SIZES) {
			expect(BENTO_SPAN[size].col).toBeLessThanOrEqual(2);
			expect(BENTO_SPAN[size].row).toBeLessThanOrEqual(2);
		}
	});

	it("sm = unit dasar 1x1", () => {
		expect(BENTO_SPAN.sm).toEqual({ col: 1, row: 1 });
	});

	it("lg mengisi dua sumbu, wide horizontal, tall vertikal", () => {
		expect(BENTO_SPAN.lg).toEqual({ col: 2, row: 2 });
		expect(BENTO_SPAN.wide).toEqual({ col: 2, row: 1 });
		expect(BENTO_SPAN.tall).toEqual({ col: 1, row: 2 });
	});
});

describe("bentoClass", () => {
	it("sm (unit dasar) → string kosong (tanpa class span)", () => {
		expect(bentoClass("sm")).toBe("");
	});

	it("ukuran non-sm → class wall-bento-<size>", () => {
		expect(bentoClass("wide")).toBe("wall-bento-wide");
		expect(bentoClass("tall")).toBe("wall-bento-tall");
		expect(bentoClass("lg")).toBe("wall-bento-lg");
	});
});

describe("bentoCss", () => {
	it("mendefinisikan span untuk tiap class non-sm", () => {
		expect(bentoCss).toContain(".wall-bento-wide");
		expect(bentoCss).toContain(".wall-bento-tall");
		expect(bentoCss).toContain(".wall-bento-lg");
	});

	it("punya media query collapse pada ambang yang ditentukan", () => {
		expect(bentoCss).toContain(`max-width: ${WALL_BENTO_COLLAPSE_PX}px`);
	});
});

describe("registry — tiap widget punya size bento valid", () => {
	it("semua id katalog punya size di daftar ukuran yang dikenal", () => {
		for (const id of ALL_WIDGET_IDS) {
			const size = getWidget(id)?.size;
			expect(SIZES).toContain(size as WallSize);
		}
	});

	it("allWidgets() semuanya membawa size", () => {
		for (const def of allWidgets()) {
			expect(SIZES).toContain(def.size);
		}
	});
});
