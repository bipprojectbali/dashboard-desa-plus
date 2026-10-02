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

	const MODULES: Array<{ prefix: string; files: string[] }> = [
		{
			prefix: "keuangan.",
			files: [
				"src/components/keuangan-anggaran.tsx",
				...sourceFiles("src/components/keuangan"),
			],
		},
		{
			prefix: "beranda.",
			files: [
				"src/components/dashboard-content.tsx",
				...sourceFiles("src/components/dashboard"),
			],
		},
		{
			prefix: "divisi.",
			files: [
				"src/components/kinerja-divisi.tsx",
				...sourceFiles("src/components/kinerja-divisi"),
			],
		},
		{
			prefix: "bumdes.",
			files: [
				"src/components/bumdes-page.tsx",
				...sourceFiles("src/components/umkm"),
			],
		},
		{
			prefix: "sosial.",
			files: [
				"src/components/sosial-page.tsx",
				...sourceFiles("src/components/sosial"),
			],
		},
		{
			prefix: "keamanan.",
			files: [
				"src/components/keamanan-page.tsx",
				...sourceFiles("src/components/keamanan"),
			],
		},
		{
			prefix: "jenna.",
			files: ["src/components/jenna-analytic.tsx"],
		},
		{
			prefix: "pengaduan.",
			files: [
				"src/components/pengaduan-layanan-publik.tsx",
				...sourceFiles("src/components/pengaduan"),
			],
		},
		{
			prefix: "demografi.",
			files: [
				"src/components/demografi-pekerjaan.tsx",
				...sourceFiles("src/components/demografi"),
			],
		},
	];

	for (const { prefix, files } of MODULES) {
		it(`setiap data-ai-target ${prefix}* di komponen ada di registry, dan sebaliknya`, () => {
			const marked = new Set<string>();
			for (const f of files) {
				const src = read(f);
				for (const m of src.matchAll(
					/data-ai-target"?[=:]\s*\{?["']([^"']+)["']/g,
				))
					marked.add(m[1] ?? "");
				// kpi-cards & dashboard-content memakai `target:`/`aiTarget=` lalu meneruskannya ke data-ai-target
				for (const m of src.matchAll(
					/(?:target:\s*|aiTarget=)"([a-z]+\.[^"]+)"/g,
				))
					marked.add(m[1] ?? "");
			}
			const registered = POINTER_TARGETS.filter((t) =>
				t.id.startsWith(prefix),
			).map((t) => t.id);
			expect([...marked].sort()).toEqual([...registered].sort());
		});
	}

	it("data-ai-clickable hanya ada pada target yang clickable di registry", () => {
		const clickable = POINTER_TARGETS.filter((t) => t.clickable).map(
			(t) => t.id,
		);
		const pages = [
			"src/components/keuangan-anggaran.tsx",
			"src/components/kinerja-divisi.tsx",
		];
		const all = MODULES.flatMap((m) => m.files);
		const marked = all.reduce(
			(n, f) => n + (read(f).match(/data-ai-clickable/g)?.length ?? 0),
			0,
		);
		expect(marked).toBe(clickable.length);
		expect(clickable.sort()).toEqual([
			"bumdes.rentang-bulan",
			"bumdes.rentang-minggu",
			"divisi.coba-lagi",
			"keuangan.coba-lagi",
			"sosial.tab-balita",
			"sosial.tab-ibu-hamil",
			"sosial.tab-penyakit",
		]);
		for (const f of pages)
			expect(read(f).match(/data-ai-clickable/g)?.length).toBe(1);
	});

	it("POINTER_ROUTES sama dengan menu sidebar (tidak melenceng)", () => {
		const sidebar = read("src/components/sidebar.tsx");
		const paths = [...sidebar.matchAll(/path:\s*"([^"]+)"/g)].map(
			(m) => m[1] ?? "",
		);
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
