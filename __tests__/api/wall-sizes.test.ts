import { describe, expect, it } from "bun:test";
import {
	defaultGeom,
	resolveSizes,
	validateSizes,
	type WallSizeMap,
} from "@/components/wall/wall-layout-utils";

describe("resolveSizes — geometri final per widget", () => {
	it("tanpa override → tiap widget pakai default preset", () => {
		const order = ["demografi-gender", "pengaduan-status"];
		const out = resolveSizes(order, null);
		expect(out["demografi-gender"]).toEqual(defaultGeom("demografi-gender"));
		expect(out["pengaduan-status"]).toEqual(defaultGeom("pengaduan-status"));
	});

	it("override valid dipakai (di-clamp ke batas)", () => {
		const raw: WallSizeMap = { "pengaduan-status": { w: 3, h: 2 } };
		const out = resolveSizes(["pengaduan-status"], raw);
		expect(out["pengaduan-status"]).toEqual({ w: 3, h: 2 });
	});

	it("override berlebih dijepit ke batas", () => {
		const raw: WallSizeMap = { "pengaduan-status": { w: 99, h: 99 } };
		const out = resolveSizes(["pengaduan-status"], raw);
		expect(out["pengaduan-status"]).toEqual({ w: 4, h: 3 });
	});

	it("id tak dikenal di order diabaikan", () => {
		const out = resolveSizes(["widget-hantu", "ops-panel"], null);
		expect(out["widget-hantu"]).toBeUndefined();
		expect(out["ops-panel"]).toEqual(defaultGeom("ops-panel"));
	});

	it("override untuk id di luar order tak muncul di hasil", () => {
		const raw: WallSizeMap = { "demografi-age": { w: 4, h: 1 } };
		const out = resolveSizes(["ops-panel"], raw);
		expect(out["demografi-age"]).toBeUndefined();
	});

	it("override bentuk cacat → jatuh ke default", () => {
		const raw = { "ops-panel": { w: "x" } } as unknown as WallSizeMap;
		const out = resolveSizes(["ops-panel"], raw);
		expect(out["ops-panel"]).toEqual(defaultGeom("ops-panel"));
	});
});

describe("validateSizes — guard sebelum simpan", () => {
	it("null / undefined (tanpa override) → valid", () => {
		expect(validateSizes(null).ok).toBe(true);
		expect(validateSizes(undefined).ok).toBe(true);
	});

	it("peta kosong → valid", () => {
		expect(validateSizes({}).ok).toBe(true);
	});

	it("geometri valid → ok", () => {
		expect(validateSizes({ "ops-panel": { w: 2, h: 3 } }).ok).toBe(true);
	});

	it("tolak w di luar batas", () => {
		const res = validateSizes({ "ops-panel": { w: 5, h: 1 } });
		expect(res.ok).toBe(false);
		expect(res.errors.join()).toContain("di luar batas");
	});

	it("tolak h = 0", () => {
		expect(validateSizes({ "ops-panel": { w: 1, h: 0 } }).ok).toBe(false);
	});

	it("tolak id tak dikenal", () => {
		const res = validateSizes({ "widget-hantu": { w: 1, h: 1 } });
		expect(res.ok).toBe(false);
		expect(res.errors.join()).toContain("tak dikenal");
	});

	it("tolak geometri bukan {w,h} angka", () => {
		const res = validateSizes({
			"ops-panel": { w: 1 },
		} as unknown as WallSizeMap);
		expect(res.ok).toBe(false);
	});

	it("tolak nilai non-objek (array)", () => {
		expect(validateSizes([] as unknown as WallSizeMap).ok).toBe(false);
	});
});
