import { describe, expect, it } from "bun:test";
import { createBukaHalamanTool } from "@/api/assistant/tools/buka-halaman.tool";
import { createKlikElemenTool } from "@/api/assistant/tools/klik-elemen.tool";
import { createPilihTool } from "@/api/assistant/tools/pilih.tool";
import { POINTER_TOOLS } from "@/api/assistant/tools/pointer";
import { ASSISTANT_TOOLS } from "@/api/assistant/tools/registry";
import { createTunjukkanElemenTool } from "@/api/assistant/tools/tunjukkan-elemen.tool";
import type { ToolContext, ToolDefinition } from "@/api/assistant/tools/types";
import type { PointerTarget } from "@/config/assistant-pointer";

const ALL = ["view-keuangan", "view-bumdes", "use-ai-assistant"];

function ctx(
	over: Partial<ToolContext> = {},
	features: string[] = ALL,
): ToolContext {
	return {
		user: { id: "u1", role: "user" },
		allowedFeatures: new Set(features),
		now: new Date("2026-10-02T02:00:00Z"),
		...over,
	};
}

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
	view("t.kartu"),
	view("t.tombol-lihat", { clickable: true }),
	view("t.tombol-tulis", { kind: "write", clickable: true }),
	view("t.pilih-enum", { pilih: { kind: "enum", values: ["a", "b"] } }),
	view("t.pilih-tahun", { pilih: { kind: "tahun" } }),
	view("t.bumdes", { route: "/bumdes", requiredFeature: "view-bumdes" }),
];
const deps = { targets: TARGETS, loadTahun: async () => [2024, 2025] };

const run = (tool: ToolDefinition, args: Record<string, unknown>, c = ctx()) =>
	tool.handler(args, c);

describe("POINTER_TOOLS", () => {
	it("empat tool, dan BELUM masuk ASSISTANT_TOOLS (didaftarkan di F2-b)", () => {
		expect(POINTER_TOOLS.map((t) => t.name)).toEqual([
			"buka_halaman",
			"tunjukkan_elemen",
			"klik_elemen",
			"pilih",
		]);
		for (const t of POINTER_TOOLS)
			expect(ASSISTANT_TOOLS.some((a) => a.name === t.name)).toBe(false);
	});

	it("enum parameter mencerminkan registry: klik hanya view+clickable, pilih hanya view+pilih", () => {
		const klik = createKlikElemenTool(deps).parameters.properties.target;
		expect(klik.enum).toEqual(["t.tombol-lihat"]);
		const pilih = createPilihTool(deps).parameters.properties.target;
		expect(pilih.enum).toEqual(["t.pilih-enum", "t.pilih-tahun"]);
	});
});

describe("buka_halaman", () => {
	const tool = createBukaHalamanTool();
	it("mengembalikan aksi navigate untuk rute terdaftar", async () => {
		const r = await run(tool, { route: "/keuangan-anggaran" });
		expect(r).toMatchObject({
			ok: true,
			data: { actions: [{ type: "navigate", route: "/keuangan-anggaran" }] },
		});
	});
	it("menolak rute tak terdaftar dan menyebut rute yang tersedia", async () => {
		const r = await run(tool, { route: "/admin" });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("/keuangan-anggaran");
	});
	it("menolak rute tanpa izin & tidak membocorkannya di daftar rute tersedia", async () => {
		const c = ctx({}, ["use-ai-assistant"]);
		const r = await run(tool, { route: "/keuangan-anggaran" }, c);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("tidak punya akses");
		const r2 = await run(tool, { route: "/x" }, c);
		if (!r2.ok) expect(r2.error).not.toContain("/keuangan-anggaran");
	});
});

describe("tunjukkan_elemen", () => {
	const tool = createTunjukkanElemenTool(deps);
	it("pointTo saja bila sudah di halaman target", async () => {
		const r = await run(
			tool,
			{ target: "t.kartu" },
			ctx({ pageRoute: "/keuangan-anggaran" }),
		);
		expect(r).toMatchObject({
			ok: true,
			data: { actions: [{ type: "pointTo", target: "t.kartu" }] },
		});
	});
	it("menambahkan navigate lebih dulu bila halaman berbeda", async () => {
		const r = await run(tool, { target: "t.kartu" }, ctx({ pageRoute: "/" }));
		expect(r).toMatchObject({
			ok: true,
			data: {
				actions: [
					{ type: "navigate", route: "/keuangan-anggaran" },
					{ type: "pointTo", target: "t.kartu" },
				],
			},
		});
	});
	it("menolak target tak terdaftar", async () => {
		const r = await run(tool, { target: "t.tidak-ada" });
		expect(r.ok).toBe(false);
	});
	it("menolak target tanpa izin modul", async () => {
		const r = await run(
			tool,
			{ target: "t.bumdes" },
			ctx({}, ["use-ai-assistant", "view-keuangan"]),
		);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("tidak punya akses");
	});
	it("target write hanya ditunjuk, dengan catatan 'tekan sendiri'", async () => {
		const r = await run(tool, { target: "t.tombol-tulis" });
		expect(r.ok).toBe(true);
		if (r.ok) expect(JSON.stringify(r.data)).toContain("sendiri");
	});
});

describe("klik_elemen", () => {
	const tool = createKlikElemenTool(deps);
	it("mengembalikan aksi click untuk target view yang clickable", async () => {
		const r = await run(
			tool,
			{ target: "t.tombol-lihat" },
			ctx({ pageRoute: "/keuangan-anggaran" }),
		);
		expect(r).toMatchObject({
			ok: true,
			data: { actions: [{ type: "click", target: "t.tombol-lihat" }] },
		});
	});
	it("menolak target write walau ditandai clickable", async () => {
		const r = await run(tool, { target: "t.tombol-tulis" });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("mengubah data");
	});
	it("menolak target view yang tidak clickable (daftar izin)", async () => {
		const r = await run(tool, { target: "t.kartu" });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("tidak ditandai boleh diklik");
	});
	it("menolak target tak terdaftar & tanpa izin", async () => {
		expect((await run(tool, { target: "x.y" })).ok).toBe(false);
		const r = await run(
			tool,
			{ target: "t.tombol-lihat" },
			ctx({}, ["use-ai-assistant"]),
		);
		expect(r.ok).toBe(false);
	});
});

describe("pilih", () => {
	const tool = createPilihTool(deps);
	it("nilai enum valid → aksi pilih", async () => {
		const r = await run(
			tool,
			{ target: "t.pilih-enum", nilai: "b" },
			ctx({ pageRoute: "/keuangan-anggaran" }),
		);
		expect(r).toMatchObject({
			ok: true,
			data: {
				actions: [{ type: "pilih", target: "t.pilih-enum", value: "b" }],
			},
		});
	});
	it("nilai enum tidak valid ditolak", async () => {
		const r = await run(tool, { target: "t.pilih-enum", nilai: "c" });
		expect(r.ok).toBe(false);
	});
	it("tahun ada di data → aksi pilih (nilai string)", async () => {
		const r = await run(
			tool,
			{ target: "t.pilih-tahun", nilai: "2025" },
			ctx({ pageRoute: "/keuangan-anggaran" }),
		);
		expect(r).toMatchObject({
			ok: true,
			data: {
				actions: [{ type: "pilih", target: "t.pilih-tahun", value: "2025" }],
			},
		});
	});
	it("tahun tidak ada di data / bukan angka ditolak", async () => {
		const r = await run(tool, { target: "t.pilih-tahun", nilai: "1999" });
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toContain("2024, 2025");
		expect(
			(await run(tool, { target: "t.pilih-tahun", nilai: "abc" })).ok,
		).toBe(false);
	});
	it("menolak target tanpa kontrol pilihan, target write, & tanpa izin", async () => {
		expect((await run(tool, { target: "t.kartu", nilai: "1" })).ok).toBe(false);
		expect((await run(tool, { target: "t.tombol-tulis", nilai: "1" })).ok).toBe(
			false,
		);
		const r = await run(
			tool,
			{ target: "t.pilih-enum", nilai: "a" },
			ctx({}, ["use-ai-assistant"]),
		);
		expect(r.ok).toBe(false);
	});
	it("menambahkan navigate bila halaman berbeda", async () => {
		const r = await run(
			tool,
			{ target: "t.pilih-enum", nilai: "a" },
			ctx({ pageRoute: "/" }),
		);
		expect(r).toMatchObject({
			ok: true,
			data: { actions: [{ type: "navigate" }, { type: "pilih" }] },
		});
	});
});
