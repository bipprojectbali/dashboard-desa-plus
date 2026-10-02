import { describe, expect, it } from "bun:test";
import {
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
import { runPointerActions } from "@/components/assistant/pointer-run";
import { WALL_TARGETS } from "@/config/assistant-pointer";
import {
	env,
	fetchCalls,
	guideAction,
	installGuideTestHooks,
	mountTargets,
	navigated,
	pointed,
	realSetTimeout,
} from "./guide.fixtures";

/** Fitur 2 panduan bertahap: sesi klien, runPointerActions, dan lanjut otomatis /wall. */

installGuideTestHooks();

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
