import { describe, expect, it } from "bun:test";
import { buildSystemPrompt } from "@/api/assistant/prompt/system-prompt";
import { createPanduLangkahTool } from "@/api/assistant/tools/pandu-langkah.tool";
import {
	POINTER_TOOLS,
	scopePointerTools,
} from "@/api/assistant/tools/pointer";
import type { ToolContext } from "@/api/assistant/tools/types";
import {
	appendUiActions,
	extractUiActions,
} from "@/api/assistant/tools/ui-actions";
import {
	POINTER_TARGETS,
	type PointerTarget,
	WALL_TARGETS,
} from "@/config/assistant-pointer";
import {
	GUIDE_MAX_STEPS,
	GUIDE_MAX_TEXT,
	type UiAction,
} from "@/types/ai-assistant-pointer";

/** Fitur 2 panduan bertahap: tool server pandu_langkah (#43). */

const view = (
	id: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget => ({
	id,
	route: "/keuangan-anggaran",
	label: id,
	deskripsi: id,
	requiredFeature: "view-keuangan",
	kind: "view",
	...extra,
});
const TARGETS: PointerTarget[] = [
	view("t.a"),
	view("t.b"),
	view("t.c"),
	view("t.d"),
	view("t.e"),
	view("t.f"),
	view("t.bumdes", { route: "/bumdes", requiredFeature: "view-bumdes" }),
	view("t.tulis", { kind: "write" }),
];
const tool = createPanduLangkahTool({
	targets: TARGETS,
	autoAdvanceSec: async () => 12,
});

const ctx = (features: string[], pageRoute = "/"): ToolContext => ({
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(["use-ai-assistant", ...features]),
	now: new Date("2026-10-02T02:00:00Z"),
	pageRoute,
});
const step = (target: string, penjelasan: unknown = "Bagian ini penting.") => ({
	target,
	penjelasan,
});
const call = (langkah: unknown, c = ctx(["view-keuangan", "view-bumdes"])) =>
	tool.handler({ langkah }, c);

describe("pandu_langkah — validasi", () => {
	it("izin use-ai-assistant, enum langkah.target dari registry, 1–5 langkah", () => {
		expect(tool.requiredFeature).toBe("use-ai-assistant");
		const langkah = tool.parameters.properties.langkah;
		expect(langkah?.minItems).toBe(1);
		expect(langkah?.maxItems).toBe(GUIDE_MAX_STEPS);
		expect(langkah?.items?.properties.target?.enum).toEqual(
			TARGETS.map((t) => t.id),
		);
	});

	it("1–5 langkah valid → satu aksi guide, tanpa aksi navigate dari server", async () => {
		const r = await call([
			step("t.a"),
			step("t.bumdes", "  Ringkasan BUMDes "),
		]);
		expect(r).toMatchObject({
			ok: true,
			data: {
				actions: [
					{
						type: "guide",
						steps: [
							{ target: "t.a", text: "Bagian ini penting." },
							{ target: "t.bumdes", text: "Ringkasan BUMDes" },
						],
					},
				],
			},
		});
		const actions = (r as { data: { actions: Array<Record<string, unknown>> } })
			.data.actions;
		expect(actions).toHaveLength(1);
		expect(actions[0]).not.toHaveProperty("autoAdvanceSec");
	});

	it("menolak 0, lebih dari 5 langkah, dan bukan array", async () => {
		for (const bad of [
			[],
			Array.from({ length: GUIDE_MAX_STEPS + 1 }, () => step("t.a")),
			"t.a",
			undefined,
		])
			expect((await call(bad)).ok).toBe(false);
		expect(
			(await call(Array.from({ length: GUIDE_MAX_STEPS }, () => step("t.a"))))
				.ok,
		).toBe(true);
	});

	it("penjelasan wajib dan maksimal GUIDE_MAX_TEXT karakter", async () => {
		for (const text of ["", "   ", undefined, 5])
			expect((await call([{ target: "t.a", penjelasan: text }])).ok).toBe(
				false,
			);
		const tooLong = await call([step("t.a"), step("t.b", "x".repeat(501))]);
		expect(tooLong).toMatchObject({ ok: false });
		if (!tooLong.ok) expect(tooLong.error).toContain("Langkah 2");
		expect((await call([step("t.a", "x".repeat(GUIDE_MAX_TEXT))])).ok).toBe(
			true,
		);
	});

	it("satu langkah tak valid → seluruh panduan ditolak (tidak ada aksi sebagian)", async () => {
		const r = await call([step("t.a"), step("x.tidak-ada")]);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("Langkah 2");
		expect((await call([step("t.a"), 5])).ok).toBe(false);
	});

	it("target di luar izin user ditolak, izin satu modul tidak membuka modul lain", async () => {
		const r = await call(
			[step("t.a"), step("t.bumdes")],
			ctx(["view-keuangan"]),
		);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("Langkah 2");
		expect((await call([step("t.a")], ctx([]))).ok).toBe(false);
	});

	it("target write boleh ditunjuk (hanya menunjuk) dengan catatan peringatan", async () => {
		const r = await call([step("t.tulis")]);
		expect(r.ok).toBe(true);
	});
});

describe("pandu_langkah — /wall", () => {
	const wallTool = createPanduLangkahTool({ autoAdvanceSec: async () => 12 });
	const wall = (features: string[]) => ctx(features, "/wall");
	const first = WALL_TARGETS.find((t) => t.requiredFeature === "view-keuangan");

	it("di /wall hanya target wall.* dan menyertakan autoAdvanceSec dari pengaturan", async () => {
		expect(first).toBeDefined();
		const r = await wallTool.handler(
			{ langkah: [step(first?.id ?? "")] },
			wall(["view-keuangan"]),
		);
		expect(r).toMatchObject({
			ok: true,
			data: {
				actions: [
					{
						type: "guide",
						autoAdvanceSec: 12,
						steps: [{ target: first?.id }],
					},
				],
			},
		});
	});

	it("di /wall target halaman biasa ditolak, dan wall.* ditolak di halaman biasa", async () => {
		const biasa = POINTER_TARGETS.find((t) => !t.id.startsWith("wall."));
		const onWall = await wallTool.handler(
			{ langkah: [step(biasa?.id ?? "")] },
			wall(["view-keuangan", "view-dashboard"]),
		);
		expect(onWall.ok).toBe(false);
		const offWall = await wallTool.handler(
			{ langkah: [step(first?.id ?? "")] },
			ctx(["view-keuangan"], "/"),
		);
		expect(offWall.ok).toBe(false);
	});

	it("scopePointerTools mempersempit enum langkah.target di /wall sesuai izin", () => {
		const scoped = scopePointerTools(POINTER_TOOLS, wall(["view-keuangan"]));
		const e = scoped.find((t) => t.name === "pandu_langkah")?.parameters
			.properties.langkah?.items?.properties.target?.enum;
		expect(e).toEqual(
			WALL_TARGETS.filter((t) => t.requiredFeature === "view-keuangan").map(
				(t) => t.id,
			),
		);
	});

	it("di halaman biasa parameter tidak diubah", () => {
		const scoped = scopePointerTools(POINTER_TOOLS, ctx(["view-keuangan"]));
		expect(scoped.map((t) => t.parameters)).toEqual(
			POINTER_TOOLS.map((t) => t.parameters),
		);
	});
});

describe("aksi guide — penggabungan", () => {
	const guide = {
		type: "guide" as const,
		steps: [{ target: "t.a", text: "x" }],
	};

	it("guide menggantikan aksi lain dan guide pertama tidak ditimpa", () => {
		const current: UiAction[] = [{ type: "navigate", route: "/" }];
		appendUiActions(
			current,
			extractUiActions({ ok: true, data: { actions: [guide] } }),
		);
		expect(current).toEqual([guide]);
		appendUiActions(current, [{ type: "pointTo", target: "t.b" }]);
		expect(current).toEqual([guide]);
	});
});

describe("prompt panduan", () => {
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

	it("menyebut pandu_langkah hanya bila diminta dan boleh menawarkan lewat teks", () => {
		const p = buildSystemPrompt(base);
		expect(p).toContain("pandu_langkah");
		expect(p).toMatch(/hanya (bila|jika) (pengguna )?meminta/i);
	});
});
