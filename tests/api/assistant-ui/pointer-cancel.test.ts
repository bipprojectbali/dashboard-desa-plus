import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	cancelPointer,
	isPointerRunActive,
	onPointerCancel,
} from "@/components/assistant/pointer/pointer-cancel";
import { pointAtElement } from "@/components/assistant/pointer/pointer-dom";
import { executeUiActions } from "@/components/assistant/pointer/pointer-executor";
import {
	hidePointer,
	pointerStore,
	showPointer,
} from "@/components/assistant/pointer/pointer-store";
import {
	ASSISTANT_PANEL_ATTR,
	attachPointerCancel,
	type NavigationSource,
} from "@/components/assistant/pointer/use-pointer-cancel";
import type { PointerTarget } from "@/config/assistant-pointer";

const target: PointerTarget = {
	id: "t.kartu",
	route: "/r",
	label: "kartu",
	deskripsi: "kartu",
	requiredFeature: "view-keuangan",
	kind: "view",
};
const routes = [
	{ route: "/r", label: "R", requiredFeature: "view-keuangan" as const },
];

type NavListener = (e: { pathChanged: boolean }) => void;
let navListeners: NavListener[] = [];
const fakeRouter: NavigationSource = {
	subscribe: (_event, listener) => {
		navListeners.push(listener);
		return () => {
			navListeners = navListeners.filter((l) => l !== listener);
		};
	},
};
const emitNavigate = (pathChanged = true) => {
	for (const l of navListeners) l({ pathChanged });
};

let detach: () => void = () => {};
const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));
const key = (k: string, init: KeyboardEventInit = {}, el?: Element) =>
	(el ?? document.body).dispatchEvent(
		new KeyboardEvent("keydown", { key: k, bubbles: true, ...init }),
	);
const wheel = (el: Element = document.body) =>
	el.dispatchEvent(new Event("wheel", { bubbles: true }));

/** Mulai run yang menunggu elemen yang tak kunjung muncul (anchor wait). */
function startWaiting(navigate?: () => Promise<void>) {
	const promise = executeUiActions([{ type: "pointTo", target: "t.kartu" }], {
		doc: document,
		targets: [target],
		routes,
		anchorTimeoutMs: 5000,
		reducedMotion: () => false,
		navigate,
		pathname: () => "/r",
	});
	return promise;
}

beforeEach(() => {
	document.body.innerHTML = "";
	navListeners = [];
	detach = attachPointerCancel(window, fakeRouter);
});
afterEach(() => {
	detach();
	hidePointer();
	pointerStore.animate = true;
	cancelPointer();
});

describe("pengendali pembatalan penunjuk", () => {
	it("wheel selagi run menunggu elemen → run berhenti dengan hasil cancelled", async () => {
		const run = startWaiting();
		await sleepMs(20);
		expect(isPointerRunActive()).toBe(true);
		wheel();
		expect(await run).toEqual({ ok: false, reason: "cancelled" });
		expect(isPointerRunActive()).toBe(false);
	});

	it("sentuh (touchmove) membatalkan run yang berjalan", async () => {
		const run = startWaiting();
		await sleepMs(20);
		document.body.dispatchEvent(new Event("touchmove", { bubbles: true }));
		expect(await run).toEqual({ ok: false, reason: "cancelled" });
	});

	for (const k of [
		"PageUp",
		"PageDown",
		" ",
		"ArrowUp",
		"ArrowDown",
		"Home",
		"End",
	]) {
		it(`tombol gulir "${k}" membatalkan run yang berjalan`, async () => {
			const run = startWaiting();
			await sleepMs(20);
			key(k);
			expect(await run).toEqual({ ok: false, reason: "cancelled" });
		});
	}

	it("tombol gulir saat fokus di kolom isian, di panel, atau dengan modifier tidak membatalkan", async () => {
		document.body.innerHTML = `<input id="i"><div ${ASSISTANT_PANEL_ATTR}="true"><button id="p">x</button></div>`;
		const run = startWaiting();
		await sleepMs(20);
		key(" ", {}, document.getElementById("i") as Element);
		key("ArrowDown", {}, document.getElementById("p") as Element);
		key("ArrowDown", { ctrlKey: true });
		key("a");
		wheel(document.getElementById("p") as Element);
		await sleepMs(20);
		expect(isPointerRunActive()).toBe(true);
		cancelPointer();
		expect(await run).toEqual({ ok: false, reason: "cancelled" });
	});

	it("Esc membatalkan run, dan menyembunyikan sorotan yang masih tampil tanpa run", async () => {
		const run = startWaiting();
		await sleepMs(20);
		key("Escape");
		expect(await run).toEqual({ ok: false, reason: "cancelled" });

		const el = document.createElement("div");
		document.body.append(el);
		await showPointer(el, { animate: false });
		expect(pointerStore.cursor).not.toBeNull();
		key("Escape");
		expect(pointerStore.cursor).toBeNull();
		expect(pointerStore.phase).toBe("idle");
	});

	it("navigasi manual membatalkan; navigasi milik penunjuk sendiri tidak", async () => {
		const run = startWaiting();
		await sleepMs(20);
		emitNavigate(false);
		expect(isPointerRunActive()).toBe(true);
		emitNavigate(true);
		expect(await run).toEqual({ ok: false, reason: "cancelled" });

		// Navigasi oleh executor: event router muncul di dalam navigate() → bukan manual.
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "t.kartu");
		document.body.append(el);
		const outcome = await executeUiActions(
			[
				{ type: "navigate", route: "/r" },
				{ type: "pointTo", target: "t.kartu" },
			],
			{
				doc: document,
				targets: [target],
				routes,
				anchorTimeoutMs: 200,
				reducedMotion: () => false,
				pathname: () => "/r",
				navigate: async () => emitNavigate(true),
				pointAt: async () => {},
			},
		);
		expect(outcome).toEqual({ ok: true });
	});

	it("navigasi selesai tetapi user membatalkan di tengah → aksi berikutnya tidak berjalan", async () => {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "t.kartu");
		document.body.append(el);
		let pointed = 0;
		const outcome = await executeUiActions(
			[
				{ type: "navigate", route: "/r" },
				{ type: "pointTo", target: "t.kartu" },
			],
			{
				doc: document,
				targets: [target],
				routes,
				anchorTimeoutMs: 200,
				reducedMotion: () => false,
				pathname: () => "/r",
				navigate: async () => {
					key("Escape");
				},
				pointAt: async () => {
					pointed++;
				},
			},
		);
		expect(outcome).toEqual({ ok: false, reason: "cancelled" });
		expect(pointed).toBe(0);
	});

	it("wheel selagi kursor meluncur menghentikan luncuran dan menyembunyikan kursor", async () => {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "t.kartu");
		document.body.append(el);
		const run = executeUiActions([{ type: "pointTo", target: "t.kartu" }], {
			doc: document,
			targets: [target],
			routes,
			reducedMotion: () => false,
			pathname: () => "/r",
			pointAt: (e) =>
				showPointer(e, { animate: true, spawnDwellMs: 5, glideMs: 5000 }),
		});
		await sleepMs(60);
		expect(pointerStore.phase).toBe("gliding");
		wheel();
		expect(await run).toEqual({ ok: false, reason: "cancelled" });
		expect(pointerStore.cursor).toBeNull();
		expect(pointerStore.phase).toBe("idle");
	});

	it("run baru setelah pembatalan tetap berjalan normal", async () => {
		const first = startWaiting();
		await sleepMs(20);
		key("Escape");
		expect((await first).ok).toBe(false);

		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "t.kartu");
		document.body.append(el);
		const pointed: Element[] = [];
		const second = await executeUiActions(
			[{ type: "pointTo", target: "t.kartu" }],
			{
				doc: document,
				targets: [target],
				routes,
				reducedMotion: () => false,
				pathname: () => "/r",
				pointAt: async (e) => {
					pointed.push(e);
				},
			},
		);
		expect(second).toEqual({ ok: true });
		expect(pointed).toEqual([el]);
	});

	it("gulir SETELAH kursor tiba tidak membatalkan: kursor & sorotan tetap, dan tetap mengikuti target", async () => {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "t.kartu");
		document.body.append(el);
		const outcome = await executeUiActions(
			[{ type: "pointTo", target: "t.kartu" }],
			{
				doc: document,
				targets: [target],
				routes,
				reducedMotion: () => true,
				pathname: () => "/r",
				pointAt: (e) => pointAtElement(e, true),
			},
		);
		expect(outcome).toEqual({ ok: true });
		expect(pointerStore.phase).toBe("arrived");
		wheel();
		key("PageDown");
		document.body.dispatchEvent(new Event("touchmove", { bubbles: true }));
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.cursor).not.toBeNull();
		expect(pointerStore.ringVisible).toBe(true);
	});

	it("pembatalan senyap dan memberi tahu pendengar (panduan bertahap)", async () => {
		let calls = 0;
		const off = onPointerCancel(() => {
			calls++;
		});
		const run = startWaiting();
		await sleepMs(20);
		wheel();
		await run;
		expect(calls).toBe(1);
		key("Escape");
		expect(calls).toBe(2);
		off();
		key("Escape");
		expect(calls).toBe(2);
	});

	it("pelepas menghapus semua pendengar", async () => {
		detach();
		const run = startWaiting();
		await sleepMs(20);
		wheel();
		key("Escape");
		emitNavigate(true);
		expect(isPointerRunActive()).toBe(true);
		cancelPointer();
		await run;
	});
});

describe("pemasangan pembatalan", () => {
	const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

	it("menutup panel membatalkan penunjuk, dan panel bertanda untuk dikecualikan dari gulir", () => {
		const fab = read("src/components/assistant/assistant-fab.tsx");
		expect(fab).toMatch(/cancelPointer\(\);\s*closeAssistant\(\)/);
		expect(fab).toContain("usePointerCancel()");
		expect(read("src/components/assistant/assistant-panel.tsx")).toContain(
			"ASSISTANT_PANEL_ATTR",
		);
	});

	it("pembatalan tidak memunculkan pesan galat di panel", () => {
		expect(read("src/components/assistant/use-pointer-runner.ts")).toMatch(
			/reason !== "cancelled"/,
		);
	});
});
