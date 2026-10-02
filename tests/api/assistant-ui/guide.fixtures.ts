import { afterEach, beforeEach } from "bun:test";
import { endGuide } from "@/components/assistant/pointer/guide-session";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import type { PointerTarget } from "@/config/assistant-pointer";

/** Bahan bersama test panduan bertahap: target/rute palsu, env executor, dan hook bersih-bersih. */

export const view = (id: string, route = "/r"): PointerTarget => ({
	id,
	route,
	label: id,
	deskripsi: id,
	requiredFeature: "view-keuangan",
	kind: "view",
});
export const targets = [
	view("t.a"),
	view("t.b"),
	view("t.c"),
	view("t.d", "/lain"),
];
export const routes = ["/r", "/lain"].map((route) => ({
	route,
	label: route,
	requiredFeature: "view-keuangan" as const,
}));

export const guideAction = (
	ids: string[],
	extra: Record<string, unknown> = {},
) => ({
	type: "guide",
	steps: ids.map((target, i) => ({ target, text: `Penjelasan ${i + 1}` })),
	...extra,
});

export let pointed: string[] = [];
export let navigated: string[] = [];
export let path = "/r";
export const env = (over: Record<string, unknown> = {}) => ({
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

export function mountTargets(ids: string[]) {
	for (const id of ids) {
		const el = document.createElement("div");
		el.setAttribute("data-ai-target", id);
		document.body.append(el);
	}
}

export const realSetTimeout = globalThis.setTimeout;
const realFetch = globalThis.fetch;
export let fetchCalls = 0;

/** Pasang hook per test: DOM bersih, state penunjuk direset, dan fetch dilarang. */
export function installGuideTestHooks() {
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
}
