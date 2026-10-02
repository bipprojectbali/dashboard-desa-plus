import { afterEach, describe, expect, it } from "bun:test";
import { subscribe } from "valtio/vanilla";
import {
	pointAtElement,
	waitForScrollEnd,
} from "@/components/assistant/pointer/pointer-dom";
import { executeUiActions } from "@/components/assistant/pointer/pointer-executor";
import {
	curvePoint,
	easeInOutCubic,
	type MotionTiming,
	viewportCenter,
} from "@/components/assistant/pointer/pointer-motion";
import {
	beginPointerSequence,
	cursorPosition,
	endPointerSequence,
	hidePointer,
	type PointerRect,
	pointerStore,
	refreshPointer,
	showPointer,
} from "@/components/assistant/pointer/pointer-store";
import type { PointerRoute, PointerTarget } from "@/config/assistant-pointer";

/** Gerak kursor: spawn di tengah, luncur dari posisi terakhir, tunggu gulir, ring setelah tiba. */

const FAST: MotionTiming = {
	glideMs: 60,
	spawnDwellMs: 10,
	scrollGraceMs: 20,
	scrollPollMs: 5,
};
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function elAt(rect: PointerRect): HTMLElement & { move(r: PointerRect): void } {
	const el = document.createElement("div") as unknown as HTMLElement & {
		move(r: PointerRect): void;
	};
	let cur = rect;
	el.getBoundingClientRect = () =>
		({ ...cur, top: cur.y, left: cur.x }) as DOMRect;
	el.scrollIntoView = () => {};
	el.move = (r) => {
		cur = r;
	};
	document.body.append(el);
	return el;
}

afterEach(() => {
	hidePointer();
	document.body.innerHTML = "";
	delete (window as { onscrollend?: unknown }).onscrollend;
});

describe("curva & easing", () => {
	it("curvePoint mulai di asal, berakhir di tujuan, dan melengkung (tidak lurus)", () => {
		const a = { x: 0, y: 0 };
		const b = { x: 400, y: 0 };
		expect(curvePoint(a, b, 0)).toEqual(a);
		expect(curvePoint(a, b, 1)).toEqual(b);
		expect(Math.abs(curvePoint(a, b, 0.5).y)).toBeGreaterThan(1);
		expect(curvePoint(a, a, 0.5)).toEqual(a);
	});
	it("easeInOutCubic monoton dari 0 ke 1", () => {
		expect(easeInOutCubic(0)).toBe(0);
		expect(easeInOutCubic(1)).toBe(1);
		expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
		expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
	});
});

describe("showPointer — spawn & luncur", () => {
	it("aksi pertama: kursor muncul di TENGAH viewport, ring belum tampil", async () => {
		const el = elAt({ x: 700, y: 500, width: 100, height: 40 });
		const done = showPointer(el, { animate: true, ...FAST });
		expect(pointerStore.cursor).toEqual(viewportCenter());
		expect(pointerStore.phase).toBe("spawning");
		expect(pointerStore.ringVisible).toBe(false);
		await done;
	});

	it("meluncur lewat fase gliding, ring baru tampil setelah tiba di target", async () => {
		const el = elAt({ x: 700, y: 500, width: 100, height: 40 });
		const ringWhileGliding: boolean[] = [];
		const stop = subscribe(pointerStore, () => {
			if (pointerStore.phase === "gliding")
				ringWhileGliding.push(pointerStore.ringVisible);
		});
		await showPointer(el, { animate: true, ...FAST });
		stop();
		expect(ringWhileGliding.length).toBeGreaterThan(0);
		expect(ringWhileGliding.every((v) => !v)).toBe(true);
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.ringVisible).toBe(true);
		expect(pointerStore.cursor).toEqual(
			cursorPosition(pointerStore.rect as PointerRect),
		);
	});

	it("aksi kedua berangkat dari posisi terakhir (tidak spawn ulang di tengah)", async () => {
		const a = elAt({ x: 100, y: 100, width: 80, height: 40 });
		const b = elAt({ x: 800, y: 600, width: 80, height: 40 });
		await showPointer(a, { animate: true, ...FAST });
		const last = pointerStore.cursor;
		const phases: string[] = [];
		const stop = subscribe(pointerStore, () => phases.push(pointerStore.phase));
		const done = showPointer(b, { animate: true, ...FAST });
		expect(pointerStore.cursor).toEqual(last);
		expect(pointerStore.phase).toBe("gliding");
		await done;
		stop();
		expect(phases).not.toContain("spawning");
		expect(pointerStore.cursor).toEqual(
			cursorPosition(pointerStore.rect as PointerRect),
		);
	});

	it("reduced motion: tanpa spawn/luncur — langsung di target dengan ring", () => {
		const el = elAt({ x: 700, y: 500, width: 100, height: 40 });
		void showPointer(el, { animate: false });
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.cursor).toEqual({ x: 750, y: 520 });
		expect(pointerStore.ringVisible).toBe(true);
		expect(pointerStore.animate).toBe(false);
	});

	it("aksi baru membatalkan luncuran lama (tidak saling timpa)", async () => {
		const a = elAt({ x: 100, y: 100, width: 80, height: 40 });
		const b = elAt({ x: 800, y: 600, width: 80, height: 40 });
		const first = showPointer(a, { animate: true, ...FAST, glideMs: 400 });
		await wait(40);
		await showPointer(b, { animate: true, ...FAST });
		await first;
		expect(pointerStore.cursor).toEqual(
			cursorPosition(pointerStore.rect as PointerRect),
		);
		expect(pointerStore.rect?.x).toBe(800);
	});
});

describe("setelah tiba", () => {
	it("mengikuti gulir langsung (tanpa meluncur ulang)", async () => {
		const el = elAt({ x: 100, y: 300, width: 100, height: 40 });
		await showPointer(el, { animate: true, ...FAST });
		el.move({ x: 100, y: 120, width: 100, height: 40 });
		refreshPointer();
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.cursor).toEqual({ x: 150, y: 140 });
		expect(pointerStore.rect?.y).toBe(120);
	});

	it("elemen lepas dari DOM: ring hilang tetapi kursor tetap", async () => {
		const el = elAt({ x: 100, y: 300, width: 100, height: 40 });
		await showPointer(el, { animate: true, ...FAST });
		el.remove();
		refreshPointer();
		expect(pointerStore.rect).toBeNull();
		expect(pointerStore.ringVisible).toBe(false);
		expect(pointerStore.cursor).not.toBeNull();
	});

	it("setelah ditahan, kursor dan ring memudar lalu hilang", async () => {
		const el = elAt({ x: 100, y: 300, width: 100, height: 40 });
		await showPointer(el, { animate: true, ...FAST, holdMs: 20 });
		await wait(60);
		expect(pointerStore.phase).toBe("leaving");
		expect(pointerStore.ringVisible).toBe(false);
		await wait(450);
		expect(pointerStore.cursor).toBeNull();
		expect(pointerStore.phase).toBe("idle");
	});

	it("dalam rangkaian aksi kursor tidak memudar; baru memudar setelah rangkaian selesai", async () => {
		const el = elAt({ x: 100, y: 300, width: 100, height: 40 });
		beginPointerSequence();
		await showPointer(el, { animate: true, ...FAST, holdMs: 20 });
		await wait(80);
		expect(pointerStore.phase).toBe("arrived");
		endPointerSequence();
		await wait(60);
		expect(pointerStore.phase).toBe("leaving");
	});
});

describe("menunggu gulir selesai", () => {
	/** Simulasikan gulir halus: elemen bergeser selama `ms`, lalu berhenti. */
	function smoothScroll(
		el: HTMLElement & { move(r: PointerRect): void },
		ms: number,
	) {
		const t0 = Date.now();
		const timer = setInterval(() => {
			const p = Math.min(1, (Date.now() - t0) / ms);
			el.move({ x: 100, y: 800 - 500 * p, width: 100, height: 40 });
			document.dispatchEvent(new Event("scroll"));
			if (p >= 1) {
				clearInterval(timer);
				document.dispatchEvent(new Event("scrollend"));
			}
		}, 5);
	}

	it("kursor baru muncul SETELAH gulir selesai (fallback tanpa scrollend)", async () => {
		const el = elAt({ x: 100, y: 800, width: 100, height: 40 });
		el.scrollIntoView = () => smoothScroll(el, 150);
		let cursorAt = 0;
		const stop = subscribe(pointerStore, () => {
			if (pointerStore.cursor && !cursorAt) cursorAt = Date.now();
		});
		const t0 = Date.now();
		await pointAtElement(el, false, FAST);
		stop();
		expect(cursorAt - t0).toBeGreaterThanOrEqual(140);
		expect(pointerStore.phase).toBe("arrived");
		expect(pointerStore.rect?.y).toBe(300);
	});

	it("memakai scrollend bila didukung", async () => {
		(window as { onscrollend?: unknown }).onscrollend = null;
		const el = elAt({ x: 0, y: 0, width: 10, height: 10 });
		let resolved = false;
		const p = waitForScrollEnd(el, {
			scrollGraceMs: 500,
			scrollMaxMs: 1000,
		}).then(() => {
			resolved = true;
		});
		document.dispatchEvent(new Event("scroll"));
		await wait(30);
		expect(resolved).toBe(false);
		document.dispatchEvent(new Event("scrollend"));
		await p;
		expect(resolved).toBe(true);
	});

	it("tanpa gulir sama sekali tidak menunggu lama", async () => {
		const el = elAt({ x: 0, y: 0, width: 10, height: 10 });
		const t0 = Date.now();
		await waitForScrollEnd(el, {
			scrollGraceMs: 20,
			scrollMaxMs: 1000,
			scrollPollMs: 5,
		});
		expect(Date.now() - t0).toBeLessThan(200);
	});

	it("dibatasi waktu maksimum bila gulir tak kunjung berhenti", async () => {
		const el = elAt({ x: 0, y: 0, width: 10, height: 10 });
		let y = 0;
		const mover = setInterval(() => {
			y += 3;
			el.move({ x: 0, y, width: 10, height: 10 });
			document.dispatchEvent(new Event("scroll"));
		}, 4);
		const t0 = Date.now();
		await waitForScrollEnd(el, { scrollMaxMs: 80, scrollPollMs: 5 });
		clearInterval(mover);
		expect(Date.now() - t0).toBeLessThan(400);
	});
});

describe("executeUiActions — kursor tetap hidup antar aksi", () => {
	it("pointTo → navigate → pointTo: hanya satu spawn, ring dilepas saat pindah halaman", async () => {
		const a = elAt({ x: 100, y: 100, width: 80, height: 40 });
		a.setAttribute("data-ai-target", "t.a");
		const b = elAt({ x: 600, y: 400, width: 80, height: 40 });
		const view = (id: string): PointerTarget => ({
			id,
			route: "/a",
			label: id,
			deskripsi: id,
			requiredFeature: "view-keuangan",
			kind: "view",
		});
		const targets = [view("t.a"), view("t.b")];
		const routes: PointerRoute[] = [
			{ route: "/a", label: "a", requiredFeature: "view-keuangan" },
			{ route: "/b", label: "b", requiredFeature: "view-keuangan" },
		];
		const phases: string[] = [];
		const stop = subscribe(pointerStore, () => phases.push(pointerStore.phase));
		const nav = { ring: null as boolean | null };
		const out = await executeUiActions(
			[
				{ type: "pointTo", target: "t.a" },
				{ type: "navigate", route: "/b" },
				{ type: "pointTo", target: "t.b" },
			],
			{
				doc: document,
				targets,
				routes,
				anchorTimeoutMs: 200,
				settleMs: 0,
				reducedMotion: () => false,
				navigate: () => {
					nav.ring = pointerStore.rect !== null;
					a.remove();
					b.setAttribute("data-ai-target", "t.b");
				},
				pointAt: (el, reduced) => pointAtElement(el, reduced, FAST),
			},
		);
		stop();
		expect(out).toEqual({ ok: true });
		expect(nav.ring).toBe(false);
		expect(phases.filter((p) => p === "spawning")).toHaveLength(1);
		expect(pointerStore.cursor).toEqual({ x: 640, y: 420 });
		expect(pointerStore.ringVisible).toBe(true);
	});
});
