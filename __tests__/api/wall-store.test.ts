import { beforeEach, describe, expect, it } from "bun:test";
import {
	DEFAULT_LAYOUT,
	type WidgetId,
} from "@/components/wall/wall-layout-utils";
import {
	addWidget,
	initBufferFrom,
	isDirty,
	moveWidget,
	removeWidget,
	resetToDefault,
	resizeWidget,
	setOrder,
	wallLayoutStore,
} from "@/store/wall-layout";

// Reset buffer ke baseline sebelum tiap test — store adalah singleton modul.
beforeEach(() => {
	wallLayoutStore.order = [...DEFAULT_LAYOUT];
	wallLayoutStore.saved = [...DEFAULT_LAYOUT];
	wallLayoutStore.sizes = {};
	wallLayoutStore.savedSizes = {};
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

	it("initBufferFrom seed order + baseline saved (isDirty false)", () => {
		const custom: WidgetId[] = ["ops-panel", "keuangan-sdgs", "demografi-age"];
		initBufferFrom(custom);
		expect(wallLayoutStore.order).toEqual(custom);
		expect(wallLayoutStore.saved).toEqual(custom);
		expect(isDirty()).toBe(false);
		expect(wallLayoutStore.status).toBe("idle");
		expect(wallLayoutStore.error).toBeNull();
	});

	it("initBufferFrom lalu ubah → dirty", () => {
		initBufferFrom(["ops-panel", "keuangan-sdgs"]);
		addWidget("demografi-age");
		expect(isDirty()).toBe(true);
	});
});

describe("wall-layout store — resize (ukuran widget)", () => {
	it("resizeWidget menyetel geometri & menandai dirty", () => {
		initBufferFrom(["ops-panel"]);
		expect(isDirty()).toBe(false);
		resizeWidget("ops-panel", { w: 3, h: 2 });
		expect(wallLayoutStore.sizes["ops-panel"]).toEqual({ w: 3, h: 2 });
		expect(isDirty()).toBe(true);
	});

	it("resizeWidget menjepit geometri di luar batas", () => {
		initBufferFrom(["ops-panel"]);
		resizeWidget("ops-panel", { w: 99, h: 99 });
		expect(wallLayoutStore.sizes["ops-panel"]).toEqual({ w: 4, h: 3 });
	});

	it("initBufferFrom dengan sizes → isDirty false sampai diubah", () => {
		initBufferFrom(["ops-panel"], { "ops-panel": { w: 2, h: 2 } });
		expect(wallLayoutStore.sizes["ops-panel"]).toEqual({ w: 2, h: 2 });
		expect(isDirty()).toBe(false);
	});

	it("removeWidget membuang override ukurannya juga", () => {
		initBufferFrom(["ops-panel", "keuangan-sdgs"], {
			"ops-panel": { w: 2, h: 2 },
		});
		removeWidget("ops-panel");
		expect(wallLayoutStore.sizes["ops-panel"]).toBeUndefined();
	});

	it("resetToDefault mengosongkan override ukuran", () => {
		initBufferFrom(["ops-panel"], { "ops-panel": { w: 3, h: 1 } });
		resetToDefault();
		expect(wallLayoutStore.sizes).toEqual({});
	});
});
