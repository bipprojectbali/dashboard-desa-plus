import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { AssistantGuideCard } from "@/components/assistant/assistant-guide-card";
import {
	GUIDE_GAP,
	GUIDE_MARGIN,
	placeGuideCard,
} from "@/components/assistant/pointer/guide-place";
import {
	endGuide,
	guideNext,
	guideStop,
	isGuideActive,
	startGuide,
} from "@/components/assistant/pointer/guide-session";
import { guideStore } from "@/components/assistant/pointer/guide-store";
import {
	cancelPointer,
	cancelPointerIfRunning,
} from "@/components/assistant/pointer/pointer-cancel";
import { executeUiAction } from "@/components/assistant/pointer/pointer-executor";
import {
	hidePointer,
	pointerStore,
} from "@/components/assistant/pointer/pointer-store";
import { runPointerActions } from "@/components/assistant/pointer-run";
import { type PointerTarget, WALL_TARGETS } from "@/config/assistant-pointer";

/** Fitur 2 panduan bertahap: sesi klien, penempatan kartu, dan kartu catatan. */

const view = (id: string, route = "/r"): PointerTarget => ({
	id,
	route,
	label: id,
	deskripsi: id,
	requiredFeature: "view-keuangan",
	kind: "view",
});
const targets = [view("t.a"), view("t.b"), view("t.c"), view("t.d", "/lain")];
const routes = ["/r", "/lain"].map((route) => ({
	route,
	label: route,
	requiredFeature: "view-keuangan" as const,
}));

const guideAction = (ids: string[], extra: Record<string, unknown> = {}) => ({
	type: "guide",
	steps: ids.map((target, i) => ({ target, text: `Penjelasan ${i + 1}` })),
	...extra,
});

let pointed: string[] = [];
let navigated: string[] = [];
let path = "/r";
const env = (over: Record<string, unknown> = {}) => ({
	doc: document,
	targets,
	routes,
	anchorTimeoutMs: 60,
	settleMs: 0,
	reducedMotion: () => false,
	pointAt: async (el: HTMLElement) => {
		pointed.push(el.getAttribute("data-ai-target") ?? "");
	},
	navigate: (route: string) => {
		navigated.push(route);
		path = route;
	},
	pathname: () => path,
	...over,
});

function mountTargets(ids: string[]) {
	for (const id of ids) {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", id);
		document.body.append(el);
	}
}

const realFetch = globalThis.fetch;
const realSetTimeout = globalThis.setTimeout;
let fetchCalls = 0;
beforeEach(() => {
	document.body.innerHTML = "";
	pointed = [];
	navigated = [];
	path = "/r";
	fetchCalls = 0;
	globalThis.fetch = (() => {
		fetchCalls++;
		return Promise.reject(new Error("fetch tidak boleh dipanggil"));
	}) as unknown as typeof fetch;
});
afterEach(() => {
	globalThis.fetch = realFetch;
	globalThis.setTimeout = realSetTimeout;
	endGuide();
	hidePointer();
});

describe("sesi panduan", () => {
	it("langkah 1 tampil; Lanjut ke langkah berikut; langkah terakhir Selesai mengakhiri; tanpa request API", async () => {
		mountTargets(["t.a", "t.b", "t.c"]);
		const out = await startGuide(guideAction(["t.a", "t.b", "t.c"]), env());
		expect(out).toEqual({ ok: true });
		expect(guideStore).toMatchObject({
			active: true,
			stage: "shown",
			index: 0,
			total: 3,
			text: "Penjelasan 1",
		});
		await guideNext();
		expect(guideStore).toMatchObject({ index: 1, text: "Penjelasan 2" });
		await guideNext();
		expect(guideStore.index).toBe(2);
		await guideNext();
		expect(guideStore.active).toBe(false);
		expect(isGuideActive()).toBe(false);
		expect(pointed).toEqual(["t.a", "t.b", "t.c"]);
		expect(fetchCalls).toBe(0);
	});

	it("Stop mengakhiri panduan tanpa request API; Lanjut sesudahnya diabaikan", async () => {
		mountTargets(["t.a", "t.b"]);
		await startGuide(guideAction(["t.a", "t.b"]), env());
		guideStop();
		expect(guideStore.active).toBe(false);
		await guideNext();
		expect(pointed).toEqual(["t.a"]);
		expect(fetchCalls).toBe(0);
	});

	it("pemicu pembatalan (Esc, navigasi manual, panel ditutup) mengakhiri panduan", async () => {
		mountTargets(["t.a", "t.b"]);
		await startGuide(guideAction(["t.a", "t.b"]), env());
		cancelPointer();
		expect(guideStore.active).toBe(false);
		expect(isGuideActive()).toBe(false);
	});

	it("gulir saat kursor masih meluncur membatalkan langkah dan panduan", async () => {
		mountTargets(["t.a"]);
		await startGuide(
			guideAction(["t.a", "t.b"]),
			env({ anchorTimeoutMs: 2000 }),
		);
		const next = guideNext();
		expect(guideStore.stage).toBe("moving");
		cancelPointerIfRunning();
		expect(await next).toBeUndefined();
		expect(guideStore.active).toBe(false);
	});

	it("gulir saat membaca kartu (tidak ada run aktif) tidak mengakhiri panduan", async () => {
		mountTargets(["t.a", "t.b"]);
		await startGuide(guideAction(["t.a", "t.b"]), env());
		cancelPointerIfRunning();
		expect(guideStore.active).toBe(true);
	});

	it("satu langkah tak valid → tidak ada yang berjalan", async () => {
		mountTargets(["t.a"]);
		for (const bad of [
			guideAction(["t.a", "x.liar"]),
			guideAction([]),
			guideAction(Array.from({ length: 6 }, () => "t.a")),
			{ type: "guide", steps: [{ target: "t.a", text: "  " }] },
			{ type: "pointTo", target: "t.a" },
			null,
		]) {
			const out = await startGuide(bad, env());
			expect(out.ok).toBe(false);
		}
		expect(pointed).toEqual([]);
		expect(guideStore.active).toBe(false);
	});

	it("target di rute yang tidak terdaftar ditolak sebelum langkah pertama", async () => {
		mountTargets(["t.a"]);
		const out = await startGuide(
			guideAction(["t.a", "t.b"]),
			env({ routes: [] }),
		);
		expect(out).toEqual({ ok: false, reason: "unknown-target" });
		expect(pointed).toEqual([]);
	});

	it("langkah lintas halaman: navigasi otomatis ke rute terdaftar sebelum menunjuk", async () => {
		mountTargets(["t.a", "t.d"]);
		await startGuide(guideAction(["t.a", "t.d"]), env());
		expect(navigated).toEqual([]);
		await guideNext();
		expect(navigated).toEqual(["/lain"]);
		expect(pointed).toEqual(["t.a", "t.d"]);
	});

	it("langkah gagal (elemen tak muncul) mengakhiri panduan dan memanggil onFailure", async () => {
		mountTargets(["t.a"]);
		let failed = 0;
		await startGuide(guideAction(["t.a", "t.b"]), env(), {
			onFailure: () => failed++,
		});
		await guideNext();
		expect(failed).toBe(1);
		expect(guideStore.active).toBe(false);
	});

	it("panduan baru menggantikan yang lama", async () => {
		mountTargets(["t.a", "t.b", "t.c"]);
		await startGuide(guideAction(["t.a", "t.b"]), env());
		await startGuide(guideAction(["t.c"]), env());
		expect(guideStore).toMatchObject({
			total: 1,
			index: 0,
			text: "Penjelasan 1",
		});
	});
});

describe("runPointerActions", () => {
	it("aksi guide memulai panduan; aksi biasa sesudahnya mengakhirinya", async () => {
		mountTargets(["t.a", "t.b"]);
		await runPointerActions([guideAction(["t.a", "t.b"])], env());
		expect(guideStore.active).toBe(true);
		await runPointerActions([{ type: "pointTo", target: "t.b" }], env());
		expect(guideStore.active).toBe(false);
		expect(pointed).toEqual(["t.a", "t.b"]);
	});

	it("executeUiAction tunggal menolak guide (hanya sesi panduan yang menjalankannya)", async () => {
		expect(await executeUiAction(guideAction(["t.a"]), env())).toEqual({
			ok: false,
			reason: "invalid-action",
		});
	});
});

describe("lanjut otomatis /wall", () => {
	const wallId = WALL_TARGETS[0]?.id ?? "";
	const wallId2 = WALL_TARGETS[1]?.id ?? "";

	function captureTimers() {
		const timers: Array<{ ms: number; fn: () => void }> = [];
		globalThis.setTimeout = ((fn: () => void, ms?: number) => {
			if ((ms ?? 0) >= 3000) {
				timers.push({ ms: ms ?? 0, fn });
				return 0 as unknown as ReturnType<typeof setTimeout>;
			}
			return realSetTimeout(fn, ms);
		}) as unknown as typeof setTimeout;
		return timers;
	}

	it("di /wall tiap langkah dijadwalkan N detik dan maju sendiri; langkah terakhir mengakhiri", async () => {
		mountTargets([wallId, wallId2]);
		const timers = captureTimers();
		await startGuide(
			guideAction([wallId, wallId2], { autoAdvanceSec: 7 }),
			env({ pathname: () => "/wall", targets: [] }),
		);
		expect(guideStore.autoAdvanceSec).toBe(7);
		expect(timers.map((t) => t.ms)).toEqual([7000]);
		timers[0]?.fn();
		await new Promise((r) => realSetTimeout(r, 20));
		expect(guideStore.index).toBe(1);
		expect(timers.map((t) => t.ms)).toEqual([7000, 7000]);
		timers[1]?.fn();
		await new Promise((r) => realSetTimeout(r, 20));
		expect(guideStore.active).toBe(false);
		expect(navigated).toEqual([]);
		expect(fetchCalls).toBe(0);
	});

	it("autoAdvanceSec dijepit ke 3–60 detik", async () => {
		mountTargets([wallId]);
		const timers = captureTimers();
		await startGuide(
			guideAction([wallId], { autoAdvanceSec: 1 }),
			env({ pathname: () => "/wall" }),
		);
		expect(timers.map((t) => t.ms)).toEqual([3000]);
	});

	it("di halaman biasa autoAdvanceSec diabaikan (tetap manual)", async () => {
		mountTargets(["t.a", "t.b"]);
		const timers = captureTimers();
		await startGuide(guideAction(["t.a", "t.b"], { autoAdvanceSec: 8 }), env());
		expect(guideStore.autoAdvanceSec).toBeNull();
		expect(timers).toEqual([]);
	});

	it("di /wall target halaman biasa ditolak, tidak ada navigasi", async () => {
		mountTargets(["t.a"]);
		const out = await startGuide(
			guideAction(["t.a"], { autoAdvanceSec: 8 }),
			env({ pathname: () => "/wall" }),
		);
		expect(out).toEqual({ ok: false, reason: "unknown-target" });
		expect(navigated).toEqual([]);
	});

	it("Stop membatalkan timer lanjut otomatis", async () => {
		mountTargets([wallId, wallId2]);
		const timers = captureTimers();
		await startGuide(
			guideAction([wallId, wallId2], { autoAdvanceSec: 5 }),
			env({ pathname: () => "/wall" }),
		);
		guideStop();
		timers[0]?.fn();
		await new Promise((r) => realSetTimeout(r, 20));
		expect(guideStore.active).toBe(false);
		expect(pointed).toEqual([wallId]);
	});
});

describe("placeGuideCard", () => {
	const viewport = { width: 1200, height: 800 };
	const card = { width: 320, height: 200 };
	const rect = (x: number, y: number, width: number, height: number) => ({
		x,
		y,
		width,
		height,
	});

	it("di bawah target bila muat, tidak menutupi target", () => {
		const r = rect(400, 100, 200, 100);
		const p = placeGuideCard({ rect: r, viewport, card });
		expect(p.side).toBe("below");
		expect(p.top).toBeGreaterThanOrEqual(r.y + r.height + GUIDE_GAP);
	});

	it("di atas target bila bawah tidak muat", () => {
		const r = rect(400, 600, 200, 100);
		const p = placeGuideCard({ rect: r, viewport, card });
		expect(p.side).toBe("above");
		expect(p.top + card.height).toBeLessThanOrEqual(r.y - GUIDE_GAP);
	});

	it("ke samping bila atas-bawah tidak muat (target tinggi)", () => {
		const r = rect(100, 20, 200, 760);
		const p = placeGuideCard({ rect: r, viewport, card });
		expect(p.side).toBe("right");
		expect(p.left).toBeGreaterThanOrEqual(r.x + r.width + GUIDE_GAP);
	});

	it("tidak masuk kolom panel (avoidRight) dan tetap di dalam layar", () => {
		const r = rect(500, 100, 250, 80);
		const p = placeGuideCard({ rect: r, viewport, card, avoidRight: 440 });
		expect(p.left + card.width).toBeLessThanOrEqual(viewport.width - 440);
		expect(p.left).toBeGreaterThanOrEqual(GUIDE_MARGIN);
	});

	it("target memenuhi layar → kartu dipasang di dasar layar", () => {
		const p = placeGuideCard({
			rect: rect(0, 0, 1200, 800),
			viewport,
			card,
		});
		expect(p.side).toBe("pinned");
		expect(p.top + card.height).toBeLessThanOrEqual(viewport.height);
	});
});

describe("AssistantGuideCard", () => {
	function mount() {
		const host = document.createElement("div");
		document.body.append(host);
		const root = createRoot(host);
		flushSync(() =>
			root.render(
				<MantineProvider>
					<AssistantGuideCard />
				</MantineProvider>,
			),
		);
		return {
			update: (fn: () => void) => {
				fn();
				flushSync(() =>
					root.render(
						<MantineProvider>
							<AssistantGuideCard />
						</MantineProvider>,
					),
				);
			},
			unmount: () => root.unmount(),
		};
	}

	it("teks penjelasan dirender sebagai teks biasa (HTML tidak ditafsirkan)", async () => {
		mountTargets(["t.a", "t.b"]);
		const evil = '<img src=x onerror="window.pwned=1"><b>tebal</b>';
		await startGuide(
			{
				type: "guide",
				steps: [
					{ target: "t.a", text: evil },
					{ target: "t.b", text: "x" },
				],
			},
			env(),
		);
		pointerStore.rect = { x: 100, y: 100, width: 200, height: 80 };
		const m = mount();
		const text = document.querySelector('[data-testid="assistant-guide-text"]');
		expect(text?.textContent).toBe(evil);
		expect(text?.querySelector("img, b")).toBeNull();
		expect(
			document.querySelector('[data-testid="assistant-guide-step"]')
				?.textContent,
		).toBe("Langkah 1 dari 2");
		m.unmount();
	});

	it("tombol Lanjut/Stop bekerja tanpa request API; langkah terakhir berlabel Selesai", async () => {
		mountTargets(["t.a", "t.b"]);
		await startGuide(guideAction(["t.a", "t.b"]), env());
		pointerStore.rect = { x: 100, y: 100, width: 200, height: 80 };
		const m = mount();
		const next = document.querySelector<HTMLButtonElement>(
			'[data-testid="assistant-guide-next"]',
		);
		expect(next?.textContent).toBe("Lanjut");
		next?.click();
		await new Promise((r) => realSetTimeout(r, 20));
		expect(guideStore.index).toBe(1);
		m.update(() => {
			pointerStore.rect = { x: 120, y: 120, width: 200, height: 80 };
		});
		expect(
			document.querySelector('[data-testid="assistant-guide-next"]')
				?.textContent,
		).toBe("Selesai");
		document
			.querySelector<HTMLButtonElement>('[data-testid="assistant-guide-stop"]')
			?.click();
		expect(guideStore.active).toBe(false);
		expect(fetchCalls).toBe(0);
		m.unmount();
	});

	it("kartu tersembunyi saat kursor masih bergerak atau tanpa panduan", async () => {
		mountTargets(["t.a"]);
		pointerStore.rect = { x: 100, y: 100, width: 200, height: 80 };
		const m = mount();
		expect(
			document.querySelector('[data-testid="assistant-guide-card"]'),
		).toBeNull();
		m.unmount();
	});
});
