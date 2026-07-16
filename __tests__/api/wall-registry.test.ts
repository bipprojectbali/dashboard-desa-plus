import { describe, expect, it } from "bun:test";
import {
	ALL_WIDGET_IDS,
	DEFAULT_LAYOUT,
	isKnownWidgetId,
} from "@/components/wall/wall-layout-utils";
import {
	allWidgets,
	getWidget,
	unplacedWidgets,
} from "@/components/wall/widget-registry";

describe("widget registry — kelengkapan & konsistensi", () => {
	it("tiap id di katalog punya definisi lengkap", () => {
		for (const id of ALL_WIDGET_IDS) {
			const def = getWidget(id);
			expect(def).toBeDefined();
			expect(def?.id).toBe(id);
			expect(typeof def?.title).toBe("string");
			expect(def?.title.length).toBeGreaterThan(0);
			expect(typeof def?.category).toBe("string");
			expect(typeof def?.selectData).toBe("function");
			expect(typeof def?.Body).toBe("function");
		}
	});

	it("semua id DEFAULT_LAYOUT ada di registry", () => {
		for (const id of DEFAULT_LAYOUT) {
			expect(getWidget(id)).toBeDefined();
		}
	});

	it("allWidgets() balikin semua widget katalog", () => {
		expect(allWidgets()).toHaveLength(ALL_WIDGET_IDS.length);
	});

	it("getWidget(id tak dikenal) → undefined", () => {
		expect(getWidget("tidak-ada")).toBeUndefined();
	});

	it("isKnownWidgetId membedakan id valid vs tidak", () => {
		expect(isKnownWidgetId("ops-panel")).toBe(true);
		expect(isKnownWidgetId("widget-hantu")).toBe(false);
	});

	it("selectData(undefined) → null untuk semua widget (empty state aman)", () => {
		for (const id of ALL_WIDGET_IDS) {
			expect(getWidget(id)?.selectData(undefined)).toBeNull();
			expect(getWidget(id)?.selectData(null)).toBeNull();
		}
	});
});

describe("unplacedWidgets — sumber galeri", () => {
	it("kecualikan yang sudah terpasang", () => {
		const unplaced = unplacedWidgets(DEFAULT_LAYOUT);
		const unplacedIds = unplaced.map((w) => w.id);
		for (const id of DEFAULT_LAYOUT) {
			expect(unplacedIds).not.toContain(id);
		}
		expect(unplaced).toHaveLength(
			ALL_WIDGET_IDS.length - DEFAULT_LAYOUT.length,
		);
	});

	it("order kosong → semua widget tersedia", () => {
		expect(unplacedWidgets([])).toHaveLength(ALL_WIDGET_IDS.length);
	});

	it("id tak dikenal di order tak mempengaruhi hasil", () => {
		const a = unplacedWidgets(["ops-panel"]);
		const b = unplacedWidgets(["ops-panel", "tidak-ada"]);
		expect(a.map((w) => w.id)).toEqual(b.map((w) => w.id));
	});
});
