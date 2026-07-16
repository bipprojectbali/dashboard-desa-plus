import { beforeEach, describe, expect, it } from "bun:test";
import {
	DEFAULT_LAYOUT,
	type WidgetId,
} from "@/components/wall/wall-layout-utils";
import {
	addWidget,
	isDirty,
	moveWidget,
	removeWidget,
	resetToDefault,
	setOrder,
	wallLayoutStore,
} from "@/store/wall-layout";

// Reset buffer ke baseline sebelum tiap test — store adalah singleton modul.
beforeEach(() => {
	wallLayoutStore.order = [...DEFAULT_LAYOUT];
	wallLayoutStore.saved = [...DEFAULT_LAYOUT];
	wallLayoutStore.status = "idle";
	wallLayoutStore.error = null;
});

describe("wall-layout store — mutasi buffer", () => {
	it("isDirty false saat order === saved", () => {
		expect(isDirty()).toBe(false);
	});

	it("addWidget menambah widget belum terpasang → dirty", () => {
		setOrder(["ops-panel"]);
		addWidget("keuangan-sdgs");
		expect(wallLayoutStore.order).toEqual(["ops-panel", "keuangan-sdgs"]);
		expect(isDirty()).toBe(true);
	});

	it("addWidget mengabaikan duplikat", () => {
		setOrder(["ops-panel"]);
		addWidget("ops-panel");
		expect(wallLayoutStore.order).toEqual(["ops-panel"]);
	});

	it("removeWidget membuang widget", () => {
		setOrder(["ops-panel", "keuangan-sdgs"]);
		removeWidget("ops-panel");
		expect(wallLayoutStore.order).toEqual(["keuangan-sdgs"]);
	});

	it("moveWidget menukar posisi", () => {
		setOrder(["a", "b", "c"] as never);
		moveWidget(0, 2);
		expect(wallLayoutStore.order).toEqual(["b", "c", "a"] as never);
	});

	it("resetToDefault mengembalikan ke DEFAULT_LAYOUT", () => {
		setOrder(["ops-panel"]);
		resetToDefault();
		expect(wallLayoutStore.order).toEqual(DEFAULT_LAYOUT);
	});

	it("isDirty mendeteksi perubahan urutan dengan panjang sama", () => {
		const [first, second, ...rest] = DEFAULT_LAYOUT;
		setOrder([second, first, ...rest] as WidgetId[]);
		expect(isDirty()).toBe(true);
	});
});
