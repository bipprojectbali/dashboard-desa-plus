import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { POINTER_TOOLS } from "@/api/assistant/tools/pointer";
import {
	sourceItems,
	sourceLabels,
} from "@/components/assistant/assistant.logic";
import { hidePointer } from "@/components/assistant/pointer";
import { runPointerActions } from "@/components/assistant/pointer-run";
import {
	findPointerTarget,
	POINTER_TOOL_NAMES,
	pointActionsFor,
	SOURCE_POINTER_TARGETS,
	sourceTargetFor,
} from "@/config/assistant-pointer";
import { assistantTexts } from "@/locales/assistant";
import {
	assistantStore,
	closeAssistant,
	startNewConversation,
	toggleMaximized,
} from "@/store/assistant";
import {
	clearReturn,
	returnStore,
	returnToChat,
} from "@/store/assistant-return";

/** Penjalan aksi penunjuk di panel (F2-b): navigasi, P6 panel diperbesar, label Sumber. */

const KEUANGAN = "/keuangan-anggaran";
const pointed: HTMLElement[] = [];

/** `navigate` palsu: "memuat" halaman tujuan dengan menaruh elemen target di DOM. */
function fakeNavigate(visited: string[]) {
	return async (route: string) => {
		visited.push(route);
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "keuangan.kpi-total");
		document.body.append(el);
	};
}

const env = (visited: string[] = []) => ({
	navigate: fakeNavigate(visited),
	anchorTimeoutMs: 120,
	settleMs: 0,
	reducedMotion: () => false,
	pointAt: async (el: HTMLElement) => {
		pointed.push(el);
	},
});

function seedConversation() {
	assistantStore.conversationId = "c1";
	assistantStore.messages.push({
		id: "m1",
		role: "assistant",
		content: "halo",
		toolsUsed: [],
	});
}

beforeEach(() => {
	document.body.innerHTML = "";
	pointed.length = 0;
	startNewConversation();
	closeAssistant();
	assistantStore.maximized = false;
	clearReturn();
});
afterEach(() => hidePointer());

describe("runPointerActions", () => {
	it("navigate lalu pointTo: pindah rute, tunggu elemen, lalu menunjuknya", async () => {
		const visited: string[] = [];
		const outcome = await runPointerActions(
			pointActionsFor("keuangan.kpi-total", "/"),
			env(visited),
		);
		expect(outcome).toEqual({ ok: true });
		expect(visited).toEqual([KEUANGAN]);
		expect(pointed).toHaveLength(1);
		expect(pointed[0]?.getAttribute("data-ai-target")).toBe(
			"keuangan.kpi-total",
		);
	});

	it("target di luar registry ditolak dan tidak ada yang ditunjuk", async () => {
		const outcome = await runPointerActions(
			[{ type: "pointTo", target: "admin.hapus-semua" }],
			env(),
		);
		expect(outcome).toEqual({ ok: false, reason: "unknown-target" });
		expect(pointed).toHaveLength(0);
	});

	it("rute di luar registry ditolak sebelum navigasi", async () => {
		const visited: string[] = [];
		const outcome = await runPointerActions(
			[{ type: "navigate", route: "/admin" }],
			env(visited),
		);
		expect(outcome).toEqual({ ok: false, reason: "unknown-route" });
		expect(visited).toEqual([]);
	});

	it("daftar aksi kosong tidak menyentuh panel", async () => {
		assistantStore.open = true;
		assistantStore.maximized = true;
		expect(await runPointerActions([], env())).toEqual({ ok: true });
		expect(assistantStore.open).toBe(true);
		expect(returnStore.awaitingReturn).toBe(false);
	});
});

describe("P7 — reduced motion terhubung ke penjalan panel", () => {
	it("tanpa env.reducedMotion, executor membaca prefers-reduced-motion dari matchMedia", async () => {
		const realMatch = window.matchMedia;
		const queries: string[] = [];
		window.matchMedia = ((q: string) => {
			queries.push(q);
			return { matches: true } as MediaQueryList;
		}) as typeof window.matchMedia;
		const seen: boolean[] = [];
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "keuangan.kpi-total");
		document.body.append(el);
		try {
			const { reducedMotion: _omit, ...rest } = env();
			await runPointerActions(pointActionsFor("keuangan.kpi-total", KEUANGAN), {
				...rest,
				pointAt: async (_el, reduced) => {
					seen.push(reduced);
				},
			});
		} finally {
			window.matchMedia = realMatch;
		}
		expect(queries).toContain("(prefers-reduced-motion: reduce)");
		expect(seen).toEqual([true]);
	});
});

describe("P6 — panel diperbesar", () => {
	const actions = pointActionsFor("keuangan.kpi-total", KEUANGAN);
	const showTarget = () => {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", "keuangan.kpi-total");
		document.body.append(el);
	};

	it("mode diperbesar: panel ditutup sementara, tombol kembali muncul, percakapan utuh", async () => {
		showTarget();
		assistantStore.open = true;
		toggleMaximized();
		seedConversation();
		await runPointerActions(actions, env());
		expect(assistantStore.open).toBe(false);
		expect(returnStore.awaitingReturn).toBe(true);
		expect(assistantStore.conversationId).toBe("c1");
		expect(assistantStore.messages).toHaveLength(1);

		returnToChat();
		expect(assistantStore.open).toBe(true);
		expect(assistantStore.maximized).toBe(true);
		expect(returnStore.awaitingReturn).toBe(false);
		expect(assistantStore.conversationId).toBe("c1");
		expect(assistantStore.messages.map((m) => m.content)).toEqual(["halo"]);
	});

	it("mode normal 440px: panel tetap terbuka, tanpa tombol kembali", async () => {
		showTarget();
		assistantStore.open = true;
		await runPointerActions(actions, env());
		expect(assistantStore.open).toBe(true);
		expect(returnStore.awaitingReturn).toBe(false);
	});

	it("panel sudah tertutup (diperbesar) tidak memunculkan tombol kembali", async () => {
		showTarget();
		assistantStore.maximized = true;
		await runPointerActions(actions, env());
		expect(returnStore.awaitingReturn).toBe(false);
	});
});

describe("label Sumber yang bisa diklik (P3)", () => {
	it("pemetaan: setiap target ada di registry dan tool-nya punya label modul", () => {
		for (const [tool, id] of Object.entries(SOURCE_POINTER_TARGETS)) {
			expect(findPointerTarget(id)).toBeDefined();
			expect(assistantTexts.id.sources[tool]).toBeDefined();
			expect(assistantTexts.en.sources[tool]).toBeDefined();
		}
		expect(SOURCE_POINTER_TARGETS.ringkasan_keuangan).toBe(
			"keuangan.kpi-total",
		);
	});

	it("daftar nama tool penunjuk klien sama dengan POINTER_TOOLS server", () => {
		expect([...POINTER_TOOL_NAMES].sort()).toEqual(
			POINTER_TOOLS.map((t) => t.name).sort(),
		);
	});

	it("modul bertarget → bisa diklik bila user berizin; tanpa target/izin → teks biasa", () => {
		const text = assistantTexts.id;
		const used = ["ringkasan_keuangan", "kinerja_divisi"];
		expect(sourceItems(used, text, ["view-keuangan"])).toEqual([
			{ label: "Keuangan & Anggaran", target: "keuangan.kpi-total" },
			{ label: "Kinerja Divisi", target: undefined },
		]);
		expect(sourceTargetFor("ringkasan_keuangan", [])).toBeUndefined();
	});

	it("tool penunjuk tidak muncul sebagai sumber", () => {
		const used = ["tunjukkan_elemen", "buka_halaman", "ringkasan_keuangan"];
		expect(sourceLabels(used, assistantTexts.id)).toEqual([
			"Keuangan & Anggaran",
		]);
	});

	it("klik label menunjuk kartu (navigasi bila perlu) tanpa memanggil API apa pun", async () => {
		const realFetch = globalThis.fetch;
		const calls: unknown[] = [];
		globalThis.fetch = ((...args: unknown[]) => {
			calls.push(args);
			throw new Error("API tidak boleh dipanggil");
		}) as unknown as typeof fetch;
		try {
			const visited: string[] = [];
			const actions = pointActionsFor("keuangan.kpi-total", "/");
			expect(actions.map((a) => a.type)).toEqual(["navigate", "pointTo"]);
			expect(await runPointerActions(actions, env(visited))).toEqual({
				ok: true,
			});
			expect(visited).toEqual([KEUANGAN]);
			expect(calls).toEqual([]);
		} finally {
			globalThis.fetch = realFetch;
		}
	});

	it("sudah di halaman target → hanya pointTo; target tak dikenal → tidak ada aksi", () => {
		expect(pointActionsFor("keuangan.kpi-total", KEUANGAN)).toEqual([
			{ type: "pointTo", target: "keuangan.kpi-total" },
		]);
		expect(pointActionsFor("nope.x", "/")).toEqual([]);
	});
});
