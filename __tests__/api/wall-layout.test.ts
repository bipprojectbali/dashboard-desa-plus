import { describe, expect, it } from "bun:test";
import {
	ALL_WIDGET_IDS,
	DEFAULT_LAYOUT,
	resolveLayout,
	validateLayout,
	WALL_DEFAULT_COUNT,
	WALL_MAX_SLOTS,
	type WidgetId,
} from "@/components/wall/wall-layout-utils";

describe("resolveLayout — daftar valid tanpa batas atas (selain katalog)", () => {
	it("input kosong → DEFAULT_LAYOUT", () => {
		const out = resolveLayout([]);
		expect(out).toEqual(DEFAULT_LAYOUT);
	});

	it("null/undefined → DEFAULT_LAYOUT", () => {
		expect(resolveLayout(null)).toEqual(DEFAULT_LAYOUT);
		expect(resolveLayout(undefined)).toEqual(DEFAULT_LAYOUT);
	});

	it("buang id tak dikenal, pertahankan yang valid (tanpa backfill)", () => {
		const out = resolveLayout(["keuangan-sdgs", "tidak-ada", "bukan-widget"]);
		expect(out).toEqual(["keuangan-sdgs"]);
	});

	it("semua id rusak → fallback DEFAULT_LAYOUT (wall tak boot kosong)", () => {
		const out = resolveLayout(["tidak-ada", "hantu"]);
		expect(out).toEqual(DEFAULT_LAYOUT);
	});

	it("dedupe id duplikat", () => {
		const out = resolveLayout(["ops-panel", "ops-panel", "ops-panel"]);
		expect(out).toEqual(["ops-panel"]);
	});

	it("TIDAK cap: 7 widget valid tetap 7", () => {
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
		expect(out).toEqual(seven);
		expect(out).toHaveLength(7);
	});

	it("terima seluruh katalog sekaligus", () => {
		const out = resolveLayout(ALL_WIDGET_IDS);
		expect(out).toHaveLength(WALL_MAX_SLOTS);
		expect(new Set(out).size).toBe(WALL_MAX_SLOTS);
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

	it("terima 7 widget (di atas default 6, di bawah maks)", () => {
		const seven: WidgetId[] = [
			"keuangan-apbdes",
			"keuangan-kepuasan",
			"keuangan-sdgs",
			"pengaduan-status",
			"pengaduan-trend",
			"demografi-gender",
			"ops-panel",
		];
		expect(validateLayout(seven).ok).toBe(true);
	});

	it("terima seluruh katalog (batas atas = jumlah widget)", () => {
		expect(validateLayout([...ALL_WIDGET_IDS]).ok).toBe(true);
	});

	it("tolak kosong", () => {
		const res = validateLayout([]);
		expect(res.ok).toBe(false);
	});

	it("tolak melebihi WALL_MAX_SLOTS (duplikat memperpanjang array)", () => {
		const tooMany = [...ALL_WIDGET_IDS, ALL_WIDGET_IDS[0] as WidgetId];
		const res = validateLayout(tooMany);
		expect(res.ok).toBe(false);
		// Melebihi maks DAN duplikat — dua-duanya harus terdeteksi.
		expect(res.errors.some((e) => e.includes("widget"))).toBe(true);
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

describe("konstanta layout", () => {
	it("WALL_DEFAULT_COUNT === 6", () => {
		expect(WALL_DEFAULT_COUNT).toBe(6);
	});

	it("WALL_MAX_SLOTS === jumlah widget katalog", () => {
		expect(WALL_MAX_SLOTS).toBe(ALL_WIDGET_IDS.length);
	});

	it("DEFAULT_LAYOUT punya WALL_DEFAULT_COUNT widget unik", () => {
		expect(DEFAULT_LAYOUT).toHaveLength(WALL_DEFAULT_COUNT);
		expect(new Set(DEFAULT_LAYOUT).size).toBe(WALL_DEFAULT_COUNT);
	});
});
