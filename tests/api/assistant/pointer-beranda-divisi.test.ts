import { describe, expect, it } from "bun:test";
import {
	type ChatServiceDeps,
	runChatTurn,
} from "@/api/assistant/chat/chat.service";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider, type MockStep } from "@/api/assistant/provider/mock";
import { createKinerjaDivisiTool } from "@/api/assistant/tools/divisi.tool";
import { createKlikElemenTool } from "@/api/assistant/tools/klik-elemen.tool";
import { POINTER_TOOLS } from "@/api/assistant/tools/pointer";
import { createTunjukkanElemenTool } from "@/api/assistant/tools/tunjukkan-elemen.tool";
import type { ToolContext } from "@/api/assistant/tools/types";
import {
	BERANDA_TARGETS,
	DIVISI_TARGETS,
	findPointerRoute,
	pointActionsFor,
	SOURCE_POINTER_TARGETS,
	sourceTargetFor,
} from "@/config/assistant-pointer";
import {
	createMemoryRepo,
	enabledSettings,
} from "./__fixtures__/memory-chat-repo";
import { DIVISI } from "./__fixtures__/wall-data";

/** F2-d: target Beranda & Kinerja Divisi di registry, tool, label Sumber, dan alur "tunjukkan divisi teraktif". */

const ctx = (features: string[], pageRoute = "/"): ToolContext => ({
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(features),
	now: new Date("2026-10-02T02:00:00Z"),
	pageRoute,
});

describe("registry Beranda & Kinerja Divisi", () => {
	it("Beranda: id beranda.*, rute '/', izin view-dashboard, semua view tanpa klik/pilih", () => {
		expect(BERANDA_TARGETS.length).toBeGreaterThan(0);
		for (const t of BERANDA_TARGETS) {
			expect(t.id).toMatch(/^beranda\.[a-z0-9-]+$/);
			expect(t.route).toBe("/");
			expect(t.requiredFeature).toBe("view-dashboard");
			expect(t.kind).toBe("view");
			expect(t.clickable).toBeFalsy();
			expect(t.pilih).toBeUndefined();
		}
	});

	it("Divisi: id divisi.*, rute /kinerja-divisi, izin view-kinerja-divisi; hanya 'coba-lagi' yang clickable", () => {
		for (const t of DIVISI_TARGETS) {
			expect(t.id).toMatch(/^divisi\.[a-z0-9-]+$/);
			expect(t.route).toBe("/kinerja-divisi");
			expect(t.requiredFeature).toBe("view-kinerja-divisi");
			expect(t.kind).toBe("view");
		}
		expect(DIVISI_TARGETS.filter((t) => t.clickable).map((t) => t.id)).toEqual([
			"divisi.coba-lagi",
		]);
	});

	it("izin target sama dengan izin rutenya", () => {
		for (const t of [...BERANDA_TARGETS, ...DIVISI_TARGETS]) {
			const route = findPointerRoute(t.route);
			expect(route).toBeDefined();
			expect(route?.requiredFeature).toBe(t.requiredFeature);
		}
	});
});

describe("tool penunjuk pada target Beranda & Divisi", () => {
	const tunjuk = createTunjukkanElemenTool();

	it("tanpa izin modul → ditolak untuk Beranda maupun Divisi", async () => {
		const c = ctx(["use-ai-assistant"]);
		for (const target of ["beranda.apbdes", "divisi.teraktif"]) {
			const r = await tunjuk.handler({ target }, c);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.error).toContain("tidak punya akses");
		}
	});

	it("izin satu modul tidak membuka modul lain", async () => {
		const c = ctx(["use-ai-assistant", "view-dashboard"]);
		expect((await tunjuk.handler({ target: "beranda.apbdes" }, c)).ok).toBe(
			true,
		);
		expect((await tunjuk.handler({ target: "divisi.teraktif" }, c)).ok).toBe(
			false,
		);
	});

	it("klik_elemen: hanya divisi.coba-lagi yang bisa diklik; kartu & Export PDF ditolak", async () => {
		const klik = createKlikElemenTool();
		const c = ctx(
			["use-ai-assistant", "view-kinerja-divisi"],
			"/kinerja-divisi",
		);
		expect(await klik.handler({ target: "divisi.coba-lagi" }, c)).toMatchObject(
			{
				ok: true,
				data: { actions: [{ type: "click", target: "divisi.coba-lagi" }] },
			},
		);
		for (const target of ["divisi.teraktif", "divisi.export-pdf"])
			expect((await klik.handler({ target }, c)).ok).toBe(false);
	});

	it("enum target tunjukkan_elemen memuat target baru", () => {
		const e = tunjuk.parameters.properties.target?.enum ?? [];
		expect(e).toContain("beranda.sdgs");
		expect(e).toContain("divisi.teraktif");
	});
});

describe("label Sumber Beranda & Kinerja Divisi", () => {
	it("pemetaan tool → target ada di registry", () => {
		expect(SOURCE_POINTER_TARGETS.ringkasan_beranda).toBe(
			"beranda.total-penduduk",
		);
		expect(SOURCE_POINTER_TARGETS.kinerja_divisi).toBe("divisi.teraktif");
	});

	it("target hanya dikembalikan bila user berizin modulnya", () => {
		expect(sourceTargetFor("kinerja_divisi", ["view-kinerja-divisi"])).toBe(
			"divisi.teraktif",
		);
		expect(
			sourceTargetFor("kinerja_divisi", ["view-dashboard"]),
		).toBeUndefined();
		expect(sourceTargetFor("ringkasan_beranda", ["view-dashboard"])).toBe(
			"beranda.total-penduduk",
		);
		expect(sourceTargetFor("ringkasan_beranda", [])).toBeUndefined();
	});

	it("klik label dari halaman lain → navigate lalu pointTo; di halaman sama → pointTo saja", () => {
		expect(pointActionsFor("divisi.teraktif", "/")).toEqual([
			{ type: "navigate", route: "/kinerja-divisi" },
			{ type: "pointTo", target: "divisi.teraktif" },
		]);
		expect(pointActionsFor("beranda.total-penduduk", "/")).toEqual([
			{ type: "pointTo", target: "beranda.total-penduduk" },
		]);
	});
});

describe("alur nyata: divisi teraktif", () => {
	const FEATURES = [
		"use-ai-assistant",
		"view-kinerja-divisi",
		"view-dashboard",
	];
	const call = (name: string, args: Record<string, unknown>): MockStep => ({
		type: "tool_calls",
		toolCalls: [{ id: `c-${name}`, name, args }],
	});

	function turn(steps: MockStep[], message: string, route: string) {
		const deps: ChatServiceDeps = {
			loadSettings: async () => enabledSettings(),
			resolveProvider: async () => ({
				ok: true,
				provider: new MockProvider(steps),
				slot: "chat",
				model: "mock",
			}),
			getUsage: async () => ({ messagesToday: 0, tokensToday: 0 }),
			rateLimiter: new SlidingWindowRateLimiter(),
			tools: [
				createKinerjaDivisiTool({ buildDivisi: async () => DIVISI }),
				...POINTER_TOOLS,
			],
			repo: createMemoryRepo().repo,
		};
		return runChatTurn(
			{
				principal: {
					user: { id: "u1", role: "user" },
					allowedFeatures: FEATURES,
				},
				message,
				pageContext: { route },
			},
			deps,
		);
	}

	it("'Siapa divisi teraktif?' → dijawab dari tool data, tanpa aksi penunjuk", async () => {
		const res = await turn(
			[call("kinerja_divisi", {}), { type: "text", text: "Pembangunan." }],
			"Siapa divisi teraktif?",
			"/",
		);
		if (!res.ok) throw new Error(res.error);
		expect(res.value.message.toolsUsed).toEqual(["kinerja_divisi"]);
		expect(res.value.actions ?? []).toEqual([]);
	});

	it("'Tunjukkan divisi teraktif' dari Beranda → navigate /kinerja-divisi lalu pointTo divisi.teraktif", async () => {
		const res = await turn(
			[
				call("tunjukkan_elemen", { target: "divisi.teraktif" }),
				{ type: "text", text: "Ini kartunya." },
			],
			"Tunjukkan divisi teraktif",
			"/",
		);
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([
			{ type: "navigate", route: "/kinerja-divisi" },
			{ type: "pointTo", target: "divisi.teraktif" },
		]);
	});

	it("'Di mana?' saat sudah di Kinerja Divisi → hanya pointTo", async () => {
		const res = await turn(
			[
				call("tunjukkan_elemen", { target: "divisi.teraktif" }),
				{ type: "text", text: "Di sini." },
			],
			"Di mana?",
			"/kinerja-divisi",
		);
		if (!res.ok) throw new Error(res.error);
		expect(res.value.actions).toEqual([
			{ type: "pointTo", target: "divisi.teraktif" },
		]);
	});
});
