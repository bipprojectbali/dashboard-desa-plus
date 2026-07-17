import { describe, expect, it } from "bun:test";
import {
	clampGeom,
	GEOM_BOUNDS,
	isValidGeom,
	sizeToGeom,
	spanStyle,
	type WallSize,
	type WidgetGeom,
} from "@/components/wall/wall-bento";
import {
	ALL_WIDGET_IDS,
	DEFAULT_WIDGET_SIZE,
	defaultGeom,
} from "@/components/wall/wall-layout-utils";

const SIZES: WallSize[] = ["sm", "wide", "tall", "lg"];

describe("wall-bento — sizeToGeom (preset → geometri)", () => {
	it("memetakan tiap token preset ke {w,h}", () => {
		expect(sizeToGeom("sm")).toEqual({ w: 1, h: 1 });
		expect(sizeToGeom("wide")).toEqual({ w: 2, h: 1 });
		expect(sizeToGeom("tall")).toEqual({ w: 1, h: 2 });
		expect(sizeToGeom("lg")).toEqual({ w: 2, h: 2 });
	});

	it("mengembalikan objek baru (bukan referensi bersama)", () => {
		const a = sizeToGeom("sm");
		a.w = 99;
		expect(sizeToGeom("sm").w).toBe(1);
	});

	it("tiap preset menghasilkan geometri dalam batas", () => {
		for (const size of SIZES) {
			expect(isValidGeom(sizeToGeom(size))).toBe(true);
		}
	});
});

describe("wall-bento — clampGeom", () => {
	it("menjepit w/h di atas batas ke maksimum", () => {
		expect(clampGeom({ w: 99, h: 99 })).toEqual({
			w: GEOM_BOUNDS.maxW,
			h: GEOM_BOUNDS.maxH,
		});
	});

	it("menjepit w/h di bawah batas ke minimum", () => {
		expect(clampGeom({ w: 0, h: -3 })).toEqual({
			w: GEOM_BOUNDS.minW,
			h: GEOM_BOUNDS.minH,
		});
	});

	it("membulatkan pecahan ke integer terdekat", () => {
		expect(clampGeom({ w: 2.4, h: 1.6 })).toEqual({ w: 2, h: 2 });
	});

	it("NaN / non-finite → batas bawah (aman)", () => {
		expect(clampGeom({ w: Number.NaN, h: Number.POSITIVE_INFINITY })).toEqual({
			w: GEOM_BOUNDS.minW,
			h: GEOM_BOUNDS.minH,
		});
	});

	it("nilai valid dilewatkan apa adanya", () => {
		expect(clampGeom({ w: 3, h: 2 })).toEqual({ w: 3, h: 2 });
	});
});

describe("wall-bento — isValidGeom", () => {
	it("true untuk geometri integer dalam batas", () => {
		expect(isValidGeom({ w: 4, h: 3 })).toBe(true);
		expect(isValidGeom({ w: 1, h: 1 })).toBe(true);
	});

	it("false untuk w/h di luar batas", () => {
		expect(isValidGeom({ w: 5, h: 1 })).toBe(false);
		expect(isValidGeom({ w: 1, h: 0 })).toBe(false);
		expect(isValidGeom({ w: 0, h: 2 })).toBe(false);
	});

	it("false untuk pecahan", () => {
		expect(isValidGeom({ w: 2.5, h: 1 })).toBe(false);
	});
});

describe("wall-bento — spanStyle", () => {
	it("menghasilkan grid-column/grid-row span dari geometri", () => {
		expect(spanStyle({ w: 2, h: 3 })).toEqual({
			gridColumn: "span 2",
			gridRow: "span 3",
		});
	});

	it("menjepit geometri berlebih sebelum menulis span", () => {
		expect(spanStyle({ w: 10, h: 10 })).toEqual({
			gridColumn: `span ${GEOM_BOUNDS.maxW}`,
			gridRow: `span ${GEOM_BOUNDS.maxH}`,
		});
	});
});

describe("registry — default size tiap widget", () => {
	it("tiap id katalog punya preset default yang dikenal", () => {
		for (const id of ALL_WIDGET_IDS) {
			expect(SIZES).toContain(DEFAULT_WIDGET_SIZE[id]);
		}
	});

	it("defaultGeom tiap widget selalu dalam batas", () => {
		for (const id of ALL_WIDGET_IDS) {
			const geom: WidgetGeom = defaultGeom(id);
			expect(isValidGeom(geom)).toBe(true);
		}
	});
});
