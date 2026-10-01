import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	anchorSelector,
	findPointerRoute,
	findPointerTarget,
	POINTER_ROUTES,
	POINTER_TARGETS,
	parseUiAction,
} from "@/config/assistant-pointer";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function sourceFiles(dir: string): string[] {
	return readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap(
		(e) =>
			e.isDirectory()
				? sourceFiles(`${dir}/${e.name}`)
				: e.name.endsWith(".tsx")
					? [`${dir}/${e.name}`]
					: [],
	);
}

describe("registry target penunjuk", () => {
	it("id unik, berformat modul.bagian, dan rutenya terdaftar", () => {
		const ids = POINTER_TARGETS.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const t of POINTER_TARGETS) {
			expect(t.id).toMatch(/^[a-z0-9-]+\.[a-z0-9-]+$/);
			expect(findPointerRoute(t.route)).toBeDefined();
			expect(t.label.length).toBeGreaterThan(0);
			expect(t.deskripsi.length).toBeGreaterThan(0);
		}
	});

	it("elemen clickable/pilih hanya pada target view", () => {
		for (const t of POINTER_TARGETS) {
			if (t.kind === "write") {
				expect(t.clickable).toBeFalsy();
				expect(t.pilih).toBeUndefined();
			}
		}
	});

	it("setiap data-ai-target di komponen Keuangan ada di registry, dan sebaliknya", () => {
		const files = [
			"src/components/keuangan-anggaran.tsx",
			...sourceFiles("src/components/keuangan"),
		];
		const marked = new Set<string>();
		for (const f of files)
			for (const m of read(f).matchAll(
				/data-ai-target"?[=:]\s*\{?["']([^"']+)["']/g,
			))
				marked.add(m[1]);
		// kpi-cards memakai `target: "keuangan.xxx"` lalu data-ai-target={item.target}
		for (const m of read("src/components/keuangan/kpi-cards.tsx").matchAll(
			/target:\s*"(keuangan\.[^"]+)"/g,
		))
			marked.add(m[1]);
		const registered = POINTER_TARGETS.filter((t) =>
			t.id.startsWith("keuangan."),
		).map((t) => t.id);
		expect([...marked].sort()).toEqual([...registered].sort());
	});

	it("data-ai-clickable hanya ada pada target yang clickable di registry", () => {
		const clickable = POINTER_TARGETS.filter((t) => t.clickable).map(
			(t) => t.id,
		);
		const src = read("src/components/keuangan-anggaran.tsx");
		expect(src.match(/data-ai-clickable/g)?.length ?? 0).toBe(clickable.length);
		expect(clickable).toEqual(["keuangan.coba-lagi"]);
	});

	it("POINTER_ROUTES sama dengan menu sidebar (tidak melenceng)", () => {
		const sidebar = read("src/components/sidebar.tsx");
		const paths = [...sidebar.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
		expect(POINTER_ROUTES.map((r) => r.route).sort()).toEqual(
			[...paths].sort(),
		);
	});

	it("helper pencarian & selector", () => {
		expect(findPointerTarget("keuangan.laporan")?.route).toBe(
			"/keuangan-anggaran",
		);
		expect(findPointerTarget("nope")).toBeUndefined();
		expect(findPointerTarget(42)).toBeUndefined();
		expect(anchorSelector("keuangan.laporan")).toBe(
			'[data-ai-target="keuangan.laporan"]',
		);
	});
});

describe("parseUiAction", () => {
	it("menerima keempat jenis aksi yang valid", () => {
		expect(parseUiAction({ type: "navigate", route: "/" })).toEqual({
			type: "navigate",
			route: "/",
		});
		expect(parseUiAction({ type: "pointTo", target: "a.b" })).toEqual({
			type: "pointTo",
			target: "a.b",
		});
		expect(parseUiAction({ type: "click", target: "a.b" })).toEqual({
			type: "click",
			target: "a.b",
		});
		expect(
			parseUiAction({ type: "pilih", target: "a.b", value: "2025" }),
		).toEqual({ type: "pilih", target: "a.b", value: "2025" });
	});

	it("menolak jenis tak dikenal, field kosong/salah tipe, dan bukan objek", () => {
		for (const bad of [
			null,
			"click",
			42,
			{},
			{ type: "highlight", target: "a.b" },
			{ type: "navigate" },
			{ type: "navigate", route: "" },
			{ type: "pointTo", target: 5 },
			{ type: "pilih", target: "a.b" },
			{ type: "pilih", value: "x" },
		])
			expect(parseUiAction(bad)).toBeNull();
	});

	it("tidak membawa field tambahan dari input mentah", () => {
		const a = parseUiAction({ type: "click", target: "a.b", evil: "x" });
		expect(a).toEqual({ type: "click", target: "a.b" });
	});
});
