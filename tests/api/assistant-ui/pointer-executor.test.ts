import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { pointAtElement } from "@/components/assistant/pointer/pointer-dom";
import {
	executeUiAction,
	executeUiActions,
} from "@/components/assistant/pointer/pointer-executor";
import { optionMatches } from "@/components/assistant/pointer/pointer-select";
import {
	cursorPosition,
	hidePointer,
	pointerStore,
} from "@/components/assistant/pointer/pointer-store";
import type { PointerTarget } from "@/config/assistant-pointer";

const view = (
	id: string,
	extra: Partial<PointerTarget> = {},
): PointerTarget => ({
	id,
	route: "/r",
	label: id,
	deskripsi: id,
	requiredFeature: "view-keuangan",
	kind: "view",
	...extra,
});

const targets: PointerTarget[] = [
	view("t.kartu"),
	view("t.tombol", { clickable: true }),
	view("t.tulis", { kind: "write", clickable: true }),
	view("t.pilih", { pilih: { kind: "tahun" } }),
];
const routes = [
	{ route: "/r", label: "R", requiredFeature: "view-keuangan" as const },
];

function add(html: string): HTMLElement {
	const host = document.createElement("div");
	host.innerHTML = html;
	document.body.append(host);
	return host;
}

const pointed: HTMLElement[] = [];
const baseEnv = () => ({
	doc: document,
	targets,
	routes,
	anchorTimeoutMs: 120,
	settleMs: 0,
	reducedMotion: () => false,
	pointAt: async (el: HTMLElement) => {
		pointed.push(el);
	},
});

beforeEach(() => {
	document.body.innerHTML = "";
	pointed.length = 0;
});
afterEach(() => hidePointer());

describe("executeUiAction — validasi", () => {
	it("menolak aksi dengan bentuk/jenis tidak valid", async () => {
		for (const bad of [
			null,
			{},
			{ type: "evaluate", code: "1" },
			{ type: "click" },
		])
			expect(await executeUiAction(bad, baseEnv())).toEqual({
				ok: false,
				reason: "invalid-action",
			});
	});

	it("menolak target & rute di luar registry", async () => {
		add('<div data-ai-target="x.liar"></div>');
		expect(
			await executeUiAction({ type: "pointTo", target: "x.liar" }, baseEnv()),
		).toEqual({ ok: false, reason: "unknown-target" });
		expect(
			await executeUiAction(
				{ type: "navigate", route: "/admin" },
				{ ...baseEnv(), navigate: () => {} },
			),
		).toEqual({ ok: false, reason: "unknown-route" });
	});

	it("navigate ditolak bila tidak ada fungsi navigasi", async () => {
		expect(
			await executeUiAction({ type: "navigate", route: "/r" }, baseEnv()),
		).toEqual({ ok: false, reason: "navigate-unavailable" });
	});

	it("navigate memanggil fungsi navigasi dengan rute terdaftar", async () => {
		const seen: string[] = [];
		const out = await executeUiAction(
			{ type: "navigate", route: "/r" },
			{ ...baseEnv(), navigate: (r) => void seen.push(r) },
		);
		expect(out).toEqual({ ok: true });
		expect(seen).toEqual(["/r"]);
	});
});

describe("executeUiAction — pointTo & anchor", () => {
	it("anchor ada → ok dan elemen yang benar disorot", async () => {
		const host = add('<section data-ai-target="t.kartu"></section>');
		const out = await executeUiAction(
			{ type: "pointTo", target: "t.kartu" },
			baseEnv(),
		);
		expect(out).toEqual({ ok: true });
		expect(pointed).toEqual([host.firstElementChild as HTMLElement]);
	});

	it("anchor muncul belakangan (data/halaman dimuat) → tetap ditemukan", async () => {
		setTimeout(() => add('<section data-ai-target="t.kartu"></section>'), 40);
		const out = await executeUiAction(
			{ type: "pointTo", target: "t.kartu" },
			baseEnv(),
		);
		expect(out).toEqual({ ok: true });
	});

	it("anchor tidak muncul → anchor-timeout", async () => {
		const t0 = Date.now();
		const out = await executeUiAction(
			{ type: "pointTo", target: "t.kartu" },
			baseEnv(),
		);
		expect(out).toEqual({ ok: false, reason: "anchor-timeout" });
		expect(Date.now() - t0).toBeGreaterThanOrEqual(100);
		expect(pointed).toHaveLength(0);
	});

	it("target write boleh ditunjuk tetapi tidak diklik/dipilih", async () => {
		let clicked = 0;
		const host = add(
			'<button data-ai-target="t.tulis" data-ai-clickable="true">Simpan</button>',
		);
		host.firstElementChild?.addEventListener("click", () => clicked++);
		expect(
			await executeUiAction({ type: "pointTo", target: "t.tulis" }, baseEnv()),
		).toEqual({ ok: true });
		expect(
			await executeUiAction({ type: "click", target: "t.tulis" }, baseEnv()),
		).toEqual({ ok: false, reason: "forbidden-target" });
		expect(
			await executeUiAction(
				{ type: "pilih", target: "t.tulis", value: "1" },
				baseEnv(),
			),
		).toEqual({ ok: false, reason: "forbidden-target" });
		expect(clicked).toBe(0);
	});
});

describe("executeUiAction — click (daftar izin ganda)", () => {
	it("klik hanya bila registry clickable DAN elemen bertanda data-ai-clickable", async () => {
		let clicked = 0;
		const host = add(
			'<button data-ai-target="t.tombol" data-ai-clickable="true">Ok</button>',
		);
		host.firstElementChild?.addEventListener("click", () => clicked++);
		expect(
			await executeUiAction({ type: "click", target: "t.tombol" }, baseEnv()),
		).toEqual({ ok: true });
		expect(clicked).toBe(1);
	});

	it("elemen tanpa data-ai-clickable tidak diklik", async () => {
		let clicked = 0;
		const host = add('<button data-ai-target="t.tombol">Ok</button>');
		host.firstElementChild?.addEventListener("click", () => clicked++);
		expect(
			await executeUiAction({ type: "click", target: "t.tombol" }, baseEnv()),
		).toEqual({ ok: false, reason: "not-clickable" });
		expect(clicked).toBe(0);
	});

	it("target view yang tidak clickable di registry ditolak sebelum menyentuh DOM", async () => {
		let clicked = 0;
		const host = add(
			'<div data-ai-target="t.kartu" data-ai-clickable="true"></div>',
		);
		host.firstElementChild?.addEventListener("click", () => clicked++);
		expect(
			await executeUiAction({ type: "click", target: "t.kartu" }, baseEnv()),
		).toEqual({ ok: false, reason: "not-clickable" });
		expect(clicked).toBe(0);
	});
});

describe("executeUiAction — pilih (Mantine Select)", () => {
	/** Meniru Mantine: input di dalam wrapper; klik membuka listbox di portal body. */
	function mountSelect(options: string[]): { picked: string[] } {
		const picked: string[] = [];
		const host = add(
			'<div data-ai-target="t.pilih"><input aria-controls="lb" aria-expanded="false" /></div>',
		);
		const input = host.querySelector("input") as HTMLInputElement;
		input.addEventListener("click", () => {
			input.setAttribute("aria-expanded", "true");
			const lb = document.createElement("div");
			lb.id = "lb";
			for (const o of options) {
				const opt = document.createElement("div");
				opt.setAttribute("role", "option");
				opt.textContent = o;
				opt.addEventListener("click", () => picked.push(o));
				lb.append(opt);
			}
			document.body.append(lb);
		});
		return { picked };
	}

	it("membuka dropdown lalu memilih opsi sesuai nilai", async () => {
		const { picked } = mountSelect(["2024", "2025"]);
		const out = await executeUiAction(
			{ type: "pilih", target: "t.pilih", value: "2025" },
			baseEnv(),
		);
		expect(out).toEqual({ ok: true });
		expect(picked).toEqual(["2025"]);
	});

	it("opsi tidak ada → option-not-found dan dropdown ditutup (Escape)", async () => {
		mountSelect(["2024"]);
		let escaped = false;
		document.querySelector("input")?.addEventListener("keydown", (e) => {
			if ((e as KeyboardEvent).key === "Escape") escaped = true;
		});
		const out = await executeUiAction(
			{ type: "pilih", target: "t.pilih", value: "1999" },
			baseEnv(),
		);
		expect(out).toEqual({ ok: false, reason: "option-not-found" });
		expect(escaped).toBe(true);
	});

	it("optionMatches: cocok persis atau per kata, bukan substring", () => {
		expect(optionMatches("2025", "2025")).toBe(true);
		expect(optionMatches("Tahun 2025", "2025")).toBe(true);
		expect(optionMatches("12025", "2025")).toBe(false);
		expect(optionMatches("2025", "202")).toBe(false);
	});
});

describe("executeUiActions", () => {
	it("berhenti di kegagalan pertama", async () => {
		add('<section data-ai-target="t.kartu"></section>');
		const out = await executeUiActions(
			[
				{ type: "pointTo", target: "t.kartu" },
				{ type: "click", target: "t.kartu" },
				{ type: "pointTo", target: "t.kartu" },
			],
			baseEnv(),
		);
		expect(out).toEqual({ ok: false, reason: "not-clickable" });
		expect(pointed).toHaveLength(1);
	});
});

describe("pointAtElement & reduced motion", () => {
	const FAST = {
		glideMs: 30,
		spawnDwellMs: 5,
		scrollGraceMs: 10,
		scrollPollMs: 5,
	};
	function stubEl(): { el: HTMLElement; calls: ScrollIntoViewOptions[] } {
		const el = document.createElement("div");
		const calls: ScrollIntoViewOptions[] = [];
		el.scrollIntoView = ((o: ScrollIntoViewOptions) =>
			void calls.push(o)) as typeof el.scrollIntoView;
		document.body.append(el);
		return { el, calls };
	}

	it("reduced motion: gulir langsung, kursor langsung di tujuan, sorotan tetap tampil", async () => {
		const { el, calls } = stubEl();
		await pointAtElement(el, true);
		expect(calls[0]?.behavior).toBe("auto");
		expect(pointerStore.animate).toBe(false);
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.ringVisible).toBe(true);
		expect(pointerStore.rect).not.toBeNull();
	});

	it("gerak normal: gulir halus lalu kursor beranimasi dan ring tampil setelah tiba", async () => {
		const { el, calls } = stubEl();
		await pointAtElement(el, false, FAST);
		expect(calls[0]?.behavior).toBe("smooth");
		expect(pointerStore.animate).toBe(true);
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.ringVisible).toBe(true);
	});

	it("hidePointer menyembunyikan sorotan; cursorPosition dibatasi dekat tepi atas", async () => {
		const { el } = stubEl();
		await pointAtElement(el, true);
		hidePointer();
		expect(pointerStore.rect).toBeNull();
		expect(pointerStore.cursor).toBeNull();
		expect(cursorPosition({ x: 10, y: 100, width: 200, height: 1000 })).toEqual(
			{ x: 110, y: 128 },
		);
		expect(cursorPosition({ x: 0, y: 0, width: 20, height: 20 })).toEqual({
			x: 10,
			y: 10,
		});
	});
});
