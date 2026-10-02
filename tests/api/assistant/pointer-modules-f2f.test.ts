import { describe, expect, it } from "bun:test";
import { createBukaHalamanTool } from "@/api/assistant/tools/buka-halaman.tool";
import { createKlikElemenTool } from "@/api/assistant/tools/klik-elemen.tool";
import { createTunjukkanElemenTool } from "@/api/assistant/tools/tunjukkan-elemen.tool";
import type { ToolContext } from "@/api/assistant/tools/types";
import {
	BUMDES_TARGETS,
	findPointerRoute,
	JENNA_TARGETS,
	KEAMANAN_TARGETS,
	POINTER_TARGETS,
	type PointerTarget,
	SOSIAL_TARGETS,
} from "@/config/assistant-pointer";

/** F2-f: target BUMDes, Sosial, Keamanan & Jenna Analytic di registry dan tool penunjuk. */

const MODULES: Array<{
	prefix: string;
	route: string;
	feature: PointerTarget["requiredFeature"];
	targets: readonly PointerTarget[];
	clickable: string[];
}> = [
	{
		prefix: "bumdes",
		route: "/bumdes",
		feature: "view-bumdes",
		targets: BUMDES_TARGETS,
		clickable: ["bumdes.rentang-bulan", "bumdes.rentang-minggu"],
	},
	{
		prefix: "sosial",
		route: "/sosial",
		feature: "view-sosial",
		targets: SOSIAL_TARGETS,
		clickable: [
			"sosial.tab-balita",
			"sosial.tab-ibu-hamil",
			"sosial.tab-penyakit",
		],
	},
	{
		prefix: "keamanan",
		route: "/keamanan",
		feature: "view-keamanan",
		targets: KEAMANAN_TARGETS,
		clickable: [],
	},
	{
		prefix: "jenna",
		route: "/jenna-analytic",
		feature: "view-jenna-analytic",
		targets: JENNA_TARGETS,
		clickable: [],
	},
];

const ctx = (features: string[], pageRoute = "/"): ToolContext => ({
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(features),
	now: new Date("2026-10-02T02:00:00Z"),
	pageRoute,
});

describe("registry BUMDes, Sosial, Keamanan & Jenna", () => {
	for (const m of MODULES) {
		it(`${m.prefix}: id ${m.prefix}.*, rute & izin sesuai modul, semua view tanpa pilih`, () => {
			expect(m.targets.length).toBeGreaterThan(0);
			for (const t of m.targets) {
				expect(t.id).toMatch(new RegExp(`^${m.prefix}\\.[a-z0-9-]+$`));
				expect(t.route).toBe(m.route);
				expect(t.requiredFeature).toBe(m.feature);
				expect(t.kind).toBe("view");
				expect(t.pilih).toBeUndefined();
				expect(findPointerRoute(t.route)?.requiredFeature).toBe(m.feature);
			}
		});

		it(`${m.prefix}: hanya elemen tampilan murni yang clickable`, () => {
			expect(
				m.targets
					.filter((t) => t.clickable)
					.map((t) => t.id)
					.sort(),
			).toEqual(m.clickable);
		});
	}

	it("id unik di seluruh registry dan tidak ada target tulis baru", () => {
		const ids = POINTER_TARGETS.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const m of MODULES)
			for (const t of m.targets) expect(t.kind).not.toBe("write");
	});

	it("tombol Coba lagi (memicu cache-invalidate) tidak boleh clickable", () => {
		for (const id of ["sosial.coba-lagi", "keamanan.coba-lagi"])
			expect(POINTER_TARGETS.find((t) => t.id === id)?.clickable).toBeFalsy();
	});
});

describe("tool penunjuk pada target modul F2-f", () => {
	const tunjuk = createTunjukkanElemenTool();
	const klik = createKlikElemenTool();
	const buka = createBukaHalamanTool();

	it("tanpa izin modul → tunjukkan_elemen ditolak untuk semua modul", async () => {
		const c = ctx(["use-ai-assistant"]);
		for (const m of MODULES) {
			const target = m.targets[0]?.id ?? "";
			const r = await tunjuk.handler({ target }, c);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.error).toContain("tidak punya akses");
		}
	});

	it("izin satu modul tidak membuka modul lain", async () => {
		const c = ctx(["use-ai-assistant", "view-sosial"]);
		expect((await tunjuk.handler({ target: "sosial.posyandu" }, c)).ok).toBe(
			true,
		);
		for (const target of [
			"bumdes.kpi-omzet",
			"keamanan.peta",
			"jenna.jam-tersibuk",
		])
			expect((await tunjuk.handler({ target }, c)).ok).toBe(false);
	});

	it("dengan izin → navigate lalu pointTo dari halaman lain", async () => {
		for (const m of MODULES) {
			const target = m.targets[0]?.id ?? "";
			const r = await tunjuk.handler(
				{ target },
				ctx(["use-ai-assistant", m.feature]),
			);
			expect(r).toMatchObject({
				ok: true,
				data: {
					actions: [
						{ type: "navigate", route: m.route },
						{ type: "pointTo", target },
					],
				},
			});
		}
	});

	it("klik_elemen: tombol rentang & tab diterima; kartu, filter, dan Coba lagi ditolak", async () => {
		const bumdes = ctx(["use-ai-assistant", "view-bumdes"], "/bumdes");
		expect(
			(await klik.handler({ target: "bumdes.rentang-bulan" }, bumdes)).ok,
		).toBe(true);
		for (const target of ["bumdes.filter", "bumdes.kpi-omzet"])
			expect((await klik.handler({ target }, bumdes)).ok).toBe(false);

		const sosial = ctx(["use-ai-assistant", "view-sosial"], "/sosial");
		expect(
			(await klik.handler({ target: "sosial.tab-balita" }, sosial)).ok,
		).toBe(true);
		expect(
			(await klik.handler({ target: "sosial.coba-lagi" }, sosial)).ok,
		).toBe(false);

		const aman = ctx(["use-ai-assistant", "view-keamanan"], "/keamanan");
		expect(
			(await klik.handler({ target: "keamanan.coba-lagi" }, aman)).ok,
		).toBe(false);
	});

	it("klik_elemen tanpa izin modul ditolak", async () => {
		const c = ctx(["use-ai-assistant"], "/sosial");
		expect((await klik.handler({ target: "sosial.tab-balita" }, c)).ok).toBe(
			false,
		);
	});

	it("enum tunjukkan_elemen memuat target baru", () => {
		const e = tunjuk.parameters.properties.target?.enum ?? [];
		for (const id of [
			"bumdes.kpi-omzet",
			"sosial.kpi-stunting",
			"keamanan.peta",
			"jenna.topik-pertanyaan",
		])
			expect(e).toContain(id);
	});

	it("buka_halaman memuat rute modul baru dan menghormati izin", async () => {
		for (const m of MODULES) {
			const ok = await buka.handler(
				{ route: m.route },
				ctx(["use-ai-assistant", m.feature]),
			);
			expect(ok.ok).toBe(true);
			const no = await buka.handler(
				{ route: m.route },
				ctx(["use-ai-assistant"]),
			);
			expect(no.ok).toBe(false);
		}
	});
});
