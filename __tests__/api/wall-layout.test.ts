import { describe, expect, it } from "bun:test";
import {
	DEFAULT_LAYOUT,
	type WidgetId,
	WALL_SLOTS,
	resolveLayout,
	validateLayout,
} from "@/components/wall/wall-layout-utils";

describe("resolveLayout — selalu balikin grid penuh valid", () => {
	it("input kosong → DEFAULT_LAYOUT (6 widget)", () => {
		const out = resolveLayout([]);
		expect(out).toEqual(DEFAULT_LAYOUT);
		expect(out).toHaveLength(WALL_SLOTS);
	});

	it("null/undefined → DEFAULT_LAYOUT", () => {
		expect(resolveLayout(null)).toEqual(DEFAULT_LAYOUT);
		expect(resolveLayout(undefined)).toEqual(DEFAULT_LAYOUT);
	});

	it("buang id tak dikenal lalu backfill dari default", () => {
		const out = resolveLayout(["keuangan-sdgs", "tidak-ada", "bukan-widget"]);
		expect(out).toHaveLength(WALL_SLOTS);
		expect(out[0]).toBe("keuangan-sdgs");
		expect(out).not.toContain("tidak-ada");
		// Sisanya diisi default yang belum terpakai.
		expect(new Set(out).size).toBe(WALL_SLOTS);
	});

	it("dedupe id duplikat", () => {
		const out = resolveLayout(["ops-panel", "ops-panel", "ops-panel"]);
		expect(out.filter((id) => id === "ops-panel")).toHaveLength(1);
		expect(out).toHaveLength(WALL_SLOTS);
		expect(new Set(out).size).toBe(WALL_SLOTS);
	});

	it("cap kelebihan slot (7 → 6), pertahankan urutan awal", () => {
		const seven: WidgetId[] = [
			"keuangan-apbdes",
			"keuangan-kepuasan",
			"keuangan-sdgs",
			"pengaduan-status",
			"pengaduan-trend",
			"demografi-gender",
			"ops-panel",
		];
		const out = resolveLayout(seven);
		expect(out).toHaveLength(WALL_SLOTS);
		expect(out).toEqual(seven.slice(0, WALL_SLOTS));
	});

	it("output selalu unik", () => {
		const out = resolveLayout(["demografi-religion", "demografi-religion"]);
		expect(new Set(out).size).toBe(out.length);
	});
});

describe("validateLayout — strict guard sebelum simpan", () => {
	it("layout valid → ok", () => {
		const res = validateLayout(["keuangan-apbdes", "ops-panel"]);
		expect(res.ok).toBe(true);
		expect(res.errors).toHaveLength(0);
	});

	it("tolak kosong", () => {
		const res = validateLayout([]);
		expect(res.ok).toBe(false);
	});

	it("tolak melebihi WALL_SLOTS", () => {
		const seven: WidgetId[] = [
			"keuangan-apbdes",
			"keuangan-kepuasan",
			"keuangan-sdgs",
			"pengaduan-status",
			"pengaduan-trend",
			"demografi-gender",
			"ops-panel",
		];
		const res = validateLayout(seven);
		expect(res.ok).toBe(false);
		expect(res.errors.some((e) => e.includes("slot"))).toBe(true);
	});

	it("tolak id tak dikenal", () => {
		const res = validateLayout(["keuangan-apbdes", "widget-hantu"]);
		expect(res.ok).toBe(false);
		expect(res.errors.some((e) => e.includes("widget-hantu"))).toBe(true);
	});

	it("tolak duplikat", () => {
		const res = validateLayout(["ops-panel", "ops-panel"]);
		expect(res.ok).toBe(false);
		expect(res.errors.some((e) => e.includes("duplikat"))).toBe(true);
	});
});

describe("konstanta grid", () => {
	it("WALL_SLOTS === 6", () => {
		expect(WALL_SLOTS).toBe(6);
	});

	it("DEFAULT_LAYOUT punya tepat WALL_SLOTS widget unik", () => {
		expect(DEFAULT_LAYOUT).toHaveLength(WALL_SLOTS);
		expect(new Set(DEFAULT_LAYOUT).size).toBe(WALL_SLOTS);
	});
});
