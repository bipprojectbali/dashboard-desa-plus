import { describe, expect, it } from "bun:test";
import { buildSystemPrompt } from "@/api/assistant/prompt/system-prompt";
import { createBukaHalamanTool } from "@/api/assistant/tools/buka-halaman.tool";
import { createKlikElemenTool } from "@/api/assistant/tools/klik-elemen.tool";
import { createPilihTool } from "@/api/assistant/tools/pilih.tool";
import {
	POINTER_TOOLS,
	scopePointerTools,
} from "@/api/assistant/tools/pointer";
import { WALL_ONLY_NOTE } from "@/api/assistant/tools/pointer.guard";
import { createTunjukkanElemenTool } from "@/api/assistant/tools/tunjukkan-elemen.tool";
import type { ToolContext } from "@/api/assistant/tools/types";
import { ALL_WIDGET_IDS } from "@/components/wall/wall-layout-utils";
import { allWidgets } from "@/components/wall/widget-registry";
import {
	deriveWallTargets,
	isWallRoute,
	POINTER_ROUTES,
	POINTER_TARGETS,
	WALL_CATEGORY_FEATURE,
	WALL_TARGETS,
} from "@/config/assistant-pointer";

/** F2-w: target widget layar NOC diturunkan dari WIDGETS; di /wall penunjuk dibatasi ke wall.*. */

const ctx = (features: string[], pageRoute?: string): ToolContext => ({
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(["use-ai-assistant", ...features]),
	now: new Date("2026-10-02T02:00:00Z"),
	pageRoute,
});

const ALL_VIEW = [
	"view-dashboard",
	"view-keuangan",
	"view-pengaduan",
	"view-demografi",
	"view-kinerja-divisi",
	"view-keamanan",
	"view-sosial",
	"view-bumdes",
	"view-jenna-analytic",
];

describe("registry wall.* diturunkan dari WIDGETS", () => {
	it("jumlah & id sama persis dengan semua widget katalog", () => {
		expect(WALL_TARGETS).toHaveLength(ALL_WIDGET_IDS.length);
		expect(WALL_TARGETS.map((t) => t.id)).toEqual(
			ALL_WIDGET_IDS.map((id) => `wall.${id}`),
		);
	});

	it("derivasi dari definisi widget nyata (allWidgets) menghasilkan registry yang sama", () => {
		expect(deriveWallTargets(allWidgets())).toEqual([...WALL_TARGETS]);
	});

	it("label = judul widget; semua view, tidak ada yang clickable/pilih; rute /wall", () => {
		for (const w of allWidgets()) {
			const t = WALL_TARGETS.find((x) => x.id === `wall.${w.id}`);
			expect(t?.label).toBe(w.title);
			expect(t?.deskripsi).toContain(w.title);
			expect(t?.kind).toBe("view");
			expect(t?.clickable).toBeFalsy();
			expect(t?.pilih).toBeUndefined();
			expect(t?.route).toBe("/wall");
		}
	});

	it("izin per kategori widget sesuai modul sumbernya", () => {
		expect(WALL_CATEGORY_FEATURE).toEqual({
			beranda: "view-dashboard",
			keuangan: "view-keuangan",
			pengaduan: "view-pengaduan",
			demografi: "view-demografi",
			divisi: "view-kinerja-divisi",
			keamanan: "view-keamanan",
			sosial: "view-sosial",
			bumdes: "view-bumdes",
			jenna: "view-jenna-analytic",
			ops: "sync-noc",
		});
		for (const w of allWidgets()) {
			const t = WALL_TARGETS.find((x) => x.id === `wall.${w.id}`);
			expect(t?.requiredFeature).toBe(WALL_CATEGORY_FEATURE[w.category]);
		}
	});

	it("wall.* tidak ikut registry halaman biasa & /wall bukan rute navigasi", () => {
		expect(POINTER_TARGETS.some((t) => t.id.startsWith("wall."))).toBe(false);
		expect(POINTER_ROUTES.some((r) => r.route === "/wall")).toBe(false);
	});

	it("isWallRoute mengenali /wall (+ slash/query) saja", () => {
		for (const r of ["/wall", "/wall/", "/wall?key=abc"])
			expect(isWallRoute(r)).toBe(true);
		for (const r of ["/", "/wallpaper", "/keuangan-anggaran", "", undefined])
			expect(isWallRoute(r)).toBe(false);
	});
});

describe("server di /wall", () => {
	const tunjuk = createTunjukkanElemenTool();
	const onWall = ctx(ALL_VIEW, "/wall");

	it("tunjukkan_elemen wall.* → hanya pointTo, tanpa navigate", async () => {
		const r = await tunjuk.handler({ target: "wall.keuangan-kpi" }, onWall);
		expect(r).toMatchObject({
			ok: true,
			data: { actions: [{ type: "pointTo", target: "wall.keuangan-kpi" }] },
		});
		const slash = await tunjuk.handler(
			{ target: "wall.keuangan-kpi" },
			ctx(ALL_VIEW, "/wall/"),
		);
		if (!slash.ok) throw new Error(slash.error);
		expect((slash.data as { actions: unknown[] }).actions).toHaveLength(1);
	});

	it("buka_halaman ditolak dengan pesan ramah", async () => {
		const r = await createBukaHalamanTool().handler(
			{ route: "/keuangan-anggaran" },
			onWall,
		);
		expect(r).toEqual({ ok: false, error: WALL_ONLY_NOTE });
		expect(WALL_ONLY_NOTE).toContain("layar NOC");
	});

	it("target halaman biasa ditolak (tanpa navigate)", async () => {
		const r = await tunjuk.handler({ target: "keuangan.laporan" }, onWall);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain(WALL_ONLY_NOTE);
	});

	it("klik_elemen & pilih ditolak walau targetnya wall.*", async () => {
		for (const tool of [createKlikElemenTool(), createPilihTool()]) {
			const r = await tool.handler(
				{ target: "wall.keuangan-kpi", nilai: "2025" },
				onWall,
			);
			expect(r).toEqual({ ok: false, error: WALL_ONLY_NOTE });
		}
	});

	it("izin tetap dari DB: tanpa modul → ditolak; ops hanya untuk sync-noc", async () => {
		const noPerm = await tunjuk.handler(
			{ target: "wall.keuangan-kpi" },
			ctx(["view-dashboard"], "/wall"),
		);
		expect(noPerm.ok).toBe(false);
		if (!noPerm.ok) expect(noPerm.error).toContain("tidak punya akses");
		expect(
			(await tunjuk.handler({ target: "wall.ops-panel" }, onWall)).ok,
		).toBe(false);
		expect(
			(
				await tunjuk.handler(
					{ target: "wall.ops-panel" },
					ctx(["sync-noc"], "/wall"),
				)
			).ok,
		).toBe(true);
	});

	it("pageRoute '/wall' dari klien tidak memberi akses data: id wall tak dikenal ditolak", async () => {
		const r = await tunjuk.handler({ target: "wall.tidak-ada" }, onWall);
		expect(r.ok).toBe(false);
	});
});

describe("perilaku di luar /wall tidak berubah", () => {
	const tunjuk = createTunjukkanElemenTool();

	it("wall.* ditolak di halaman biasa dan tidak ada di enum tool", async () => {
		const c = ctx(ALL_VIEW, "/");
		const r = await tunjuk.handler({ target: "wall.keuangan-kpi" }, c);
		expect(r.ok).toBe(false);
		const e = tunjuk.parameters.properties.target?.enum ?? [];
		expect(e.some((id) => String(id).startsWith("wall."))).toBe(false);
		const scoped = scopePointerTools(POINTER_TOOLS, c);
		expect(scoped.map((t) => t.parameters)).toEqual(
			POINTER_TOOLS.map((t) => t.parameters),
		);
	});

	it("navigasi & penunjukan biasa tetap jalan", async () => {
		const c = ctx(["view-keuangan"], "/");
		expect(
			await createBukaHalamanTool().handler({ route: "/keuangan-anggaran" }, c),
		).toMatchObject({ ok: true });
		expect(
			await tunjuk.handler({ target: "keuangan.laporan" }, c),
		).toMatchObject({
			ok: true,
			data: {
				actions: [
					{ type: "navigate", route: "/keuangan-anggaran" },
					{ type: "pointTo", target: "keuangan.laporan" },
				],
			},
		});
	});
});

describe("tool & prompt untuk /wall", () => {
	it("enum tunjukkan_elemen di /wall = widget yang diizinkan user", () => {
		const scoped = scopePointerTools(
			POINTER_TOOLS,
			ctx(["view-keuangan"], "/wall"),
		);
		const e = scoped.find((t) => t.name === "tunjukkan_elemen")?.parameters
			.properties.target?.enum;
		expect(e).toEqual(
			WALL_TARGETS.filter((t) => t.requiredFeature === "view-keuangan").map(
				(t) => t.id,
			),
		);
	});

	it("prompt: aturan layar NOC hanya muncul bila onWall", () => {
		const base = {
			assistantName: "Jenna",
			personaNote: null,
			userRole: "user",
			now: new Date("2026-10-02T02:00:00Z"),
			lang: "id" as const,
			unavailableModules: [],
			hasDataTools: true,
			hasPointerTools: true,
		};
		const wall = buildSystemPrompt({ ...base, onWall: true });
		expect(wall).toContain("Layar NOC");
		expect(wall).toContain("wall.*");
		expect(buildSystemPrompt(base)).not.toContain("Layar NOC");
		expect(
			buildSystemPrompt({ ...base, hasPointerTools: false, onWall: true }),
		).not.toContain("Layar NOC");
	});
});
