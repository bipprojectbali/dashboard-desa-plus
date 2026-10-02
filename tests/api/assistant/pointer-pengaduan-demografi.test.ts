import { describe, expect, it } from "bun:test";
import { createBukaHalamanTool } from "@/api/assistant/tools/buka-halaman.tool";
import { createKlikElemenTool } from "@/api/assistant/tools/klik-elemen.tool";
import { createPilihTool } from "@/api/assistant/tools/pilih.tool";
import { createTunjukkanElemenTool } from "@/api/assistant/tools/tunjukkan-elemen.tool";
import type { ToolContext } from "@/api/assistant/tools/types";
import {
	DEMOGRAFI_TARGETS,
	findPointerRoute,
	PENGADUAN_TARGETS,
	POINTER_TARGETS,
	pointActionsFor,
	SOURCE_POINTER_TARGETS,
	sourceTargetFor,
} from "@/config/assistant-pointer";

/** F2-e: target Pengaduan & Layanan Publik dan Demografi & Kependudukan di registry, tool penunjuk, dan label Sumber. */

const MODULES = [
	{
		prefix: "pengaduan",
		route: "/pengaduan-layanan-publik",
		feature: "view-pengaduan",
		targets: PENGADUAN_TARGETS,
		source: "statistik_pengaduan",
		sourceTarget: "pengaduan.kpi-total",
	},
	{
		prefix: "demografi",
		route: "/demografi-pekerjaan",
		feature: "view-demografi",
		targets: DEMOGRAFI_TARGETS,
		source: "statistik_demografi",
		sourceTarget: "demografi.kpi-penduduk",
	},
] as const;

const ctx = (features: string[], pageRoute = "/"): ToolContext => ({
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(features),
	now: new Date("2026-10-02T02:00:00Z"),
	pageRoute,
});

describe("registry Pengaduan & Demografi", () => {
	for (const m of MODULES) {
		it(`${m.prefix}: id ${m.prefix}.*, rute & izin sesuai modul, semua view tanpa clickable`, () => {
			expect(m.targets.length).toBeGreaterThan(0);
			for (const t of m.targets) {
				expect(t.id).toMatch(new RegExp(`^${m.prefix}\\.[a-z0-9-]+$`));
				expect(t.route).toBe(m.route);
				expect(t.requiredFeature).toBe(m.feature);
				expect(t.kind).toBe("view");
				expect(t.clickable).toBeFalsy();
				expect(findPointerRoute(t.route)?.requiredFeature).toBe(m.feature);
			}
		});
	}

	it("id unik di seluruh registry", () => {
		const ids = POINTER_TARGETS.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("tidak ada target yang punya pilih (tahun agama tidak cocok dengan validasi tahun APBDes)", () => {
		for (const t of [...PENGADUAN_TARGETS, ...DEMOGRAFI_TARGETS])
			expect(t.pilih).toBeUndefined();
	});

	it("tombol Coba lagi (memicu fetch ke server) tidak boleh clickable", () => {
		for (const id of ["pengaduan.coba-lagi", "demografi.coba-lagi"])
			expect(POINTER_TARGETS.find((t) => t.id === id)?.clickable).toBeFalsy();
	});

	it("deskripsi tidak memuat data warga (kebijakan #16: pointer tidak membaca layar)", () => {
		for (const t of [...PENGADUAN_TARGETS, ...DEMOGRAFI_TARGETS])
			expect(t.deskripsi + t.label).not.toMatch(/nik|alamat rumah|telepon/i);
	});
});

describe("tool penunjuk pada target Pengaduan & Demografi", () => {
	const tunjuk = createTunjukkanElemenTool();
	const klik = createKlikElemenTool();
	const pilih = createPilihTool();
	const buka = createBukaHalamanTool();

	it("tanpa izin modul → tunjukkan_elemen ditolak untuk semua target", async () => {
		const c = ctx(["use-ai-assistant"]);
		for (const m of MODULES)
			for (const t of m.targets) {
				const r = await tunjuk.handler({ target: t.id }, c);
				expect(r.ok).toBe(false);
				if (!r.ok) expect(r.error).toContain("tidak punya akses");
			}
	});

	it("izin satu modul tidak membuka modul lain", async () => {
		const c = ctx(["use-ai-assistant", "view-pengaduan"]);
		expect((await tunjuk.handler({ target: "pengaduan.tren" }, c)).ok).toBe(
			true,
		);
		expect((await tunjuk.handler({ target: "demografi.agama" }, c)).ok).toBe(
			false,
		);
		const d = ctx(["use-ai-assistant", "view-demografi"]);
		expect((await tunjuk.handler({ target: "demografi.agama" }, d)).ok).toBe(
			true,
		);
		expect((await tunjuk.handler({ target: "pengaduan.tren" }, d)).ok).toBe(
			false,
		);
	});

	it("dengan izin → navigate lalu pointTo dari halaman lain, pointTo saja di halaman sama", async () => {
		for (const m of MODULES) {
			const target = m.targets[0]?.id ?? "";
			expect(
				await tunjuk.handler({ target }, ctx(["use-ai-assistant", m.feature])),
			).toMatchObject({
				ok: true,
				data: {
					actions: [
						{ type: "navigate", route: m.route },
						{ type: "pointTo", target },
					],
				},
			});
			expect(
				await tunjuk.handler(
					{ target },
					ctx(["use-ai-assistant", m.feature], m.route),
				),
			).toMatchObject({
				ok: true,
				data: { actions: [{ type: "pointTo", target }] },
			});
		}
	});

	it("klik_elemen menolak semua target modul ini (tidak ada yang clickable)", async () => {
		for (const m of MODULES)
			for (const t of m.targets) {
				const r = await klik.handler(
					{ target: t.id },
					ctx(["use-ai-assistant", m.feature], m.route),
				);
				expect(r.ok).toBe(false);
			}
	});

	it("pilih menolak semua target modul ini (hanya ditunjuk)", async () => {
		const c = ctx(
			["use-ai-assistant", "view-demografi", "view-pengaduan"],
			"/demografi-pekerjaan",
		);
		for (const target of ["demografi.tahun-agama", "demografi.agama"]) {
			const r = await pilih.handler({ target, nilai: "2024" }, c);
			expect(r.ok).toBe(false);
		}
	});

	it("enum tool memuat target baru; pilih dan klik tidak memuat target modul ini", () => {
		const e = tunjuk.parameters.properties.target?.enum ?? [];
		for (const id of [
			"pengaduan.kpi-ditolak",
			"pengaduan.ide-inovatif",
			"demografi.banjar",
			"demografi.tahun-agama",
		])
			expect(e).toContain(id);
		const p = pilih.parameters.properties.target?.enum ?? [];
		expect(
			p.filter((id) => /^(pengaduan|demografi)\./.test(String(id))),
		).toEqual([]);
		const k = klik.parameters.properties.target?.enum ?? [];
		expect(
			k.filter((id) => /^(pengaduan|demografi)\./.test(String(id))),
		).toEqual([]);
	});

	it("buka_halaman memuat rute baru dan menghormati izin", async () => {
		for (const m of MODULES) {
			expect(
				(
					await buka.handler(
						{ route: m.route },
						ctx(["use-ai-assistant", m.feature]),
					)
				).ok,
			).toBe(true);
			expect(
				(await buka.handler({ route: m.route }, ctx(["use-ai-assistant"]))).ok,
			).toBe(false);
		}
	});
});

describe("label Sumber Pengaduan & Demografi", () => {
	for (const m of MODULES) {
		it(`${m.source} → ${m.sourceTarget}, ada di registry dan hanya bila berizin`, () => {
			expect(SOURCE_POINTER_TARGETS[m.source]).toBe(m.sourceTarget);
			expect(sourceTargetFor(m.source, [m.feature])).toBe(m.sourceTarget);
			expect(sourceTargetFor(m.source, ["view-dashboard"])).toBeUndefined();
			expect(sourceTargetFor(m.source, [])).toBeUndefined();
		});

		it(`${m.source}: klik label dari halaman lain → navigate lalu pointTo; di halaman sama → pointTo saja`, () => {
			expect(pointActionsFor(m.sourceTarget, "/")).toEqual([
				{ type: "navigate", route: m.route },
				{ type: "pointTo", target: m.sourceTarget },
			]);
			expect(pointActionsFor(m.sourceTarget, m.route)).toEqual([
				{ type: "pointTo", target: m.sourceTarget },
			]);
		});
	}
});
