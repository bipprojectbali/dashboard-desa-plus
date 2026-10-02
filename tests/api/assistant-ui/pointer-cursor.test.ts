import { afterEach, describe, expect, it } from "bun:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AssistantCursor } from "@/components/assistant/pointer/assistant-cursor";
import {
	hidePointer,
	pointerStore,
} from "@/components/assistant/pointer/pointer-store";

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function mount() {
	const host = document.createElement("div");
	document.body.append(host);
	const root = createRoot(host);
	await act(async () => root.render(createElement(AssistantCursor)));
	return async () => {
		await act(async () => root.unmount());
		host.remove();
	};
}

const find = () =>
	document.querySelector<HTMLElement>('[data-testid="assistant-pointer"]');
const cursorBox = () =>
	document.querySelector<HTMLElement>(
		'[data-testid="assistant-pointer-cursor"]',
	);
const ring = () =>
	document.querySelector<HTMLElement>('[data-testid="assistant-pointer-ring"]');

const RECT = { x: 10, y: 20, width: 100, height: 50 };

afterEach(() => {
	hidePointer();
	pointerStore.animate = true;
});

describe("AssistantCursor", () => {
	it("tidak merender apa pun bila tidak ada kursor", async () => {
		const unmount = await mount();
		expect(find()).toBeNull();
		await unmount();
	});

	it("merender overlay yang tak menangkap klik & disembunyikan dari pembaca layar", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.cursor = { x: 50, y: 40 };
			pointerStore.phase = "arrived";
		});
		const overlay = find();
		expect(overlay).not.toBeNull();
		expect(overlay?.getAttribute("aria-hidden")).toBe("true");
		expect(overlay?.style.pointerEvents).toBe("none");
		await unmount();
	});

	it("fase spawning: kursor transparan di posisi awal, ring belum tampil", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.rect = RECT;
			pointerStore.cursor = { x: 512, y: 384 };
			pointerStore.phase = "spawning";
			pointerStore.ringVisible = false;
		});
		expect(find()?.getAttribute("data-phase")).toBe("spawning");
		expect(cursorBox()?.querySelector("svg")?.style.opacity).toBe("0");
		expect(ring()?.style.opacity).toBe("0");
		expect(ring()?.getAttribute("data-visible")).toBe("false");
		await unmount();
	});

	it("posisi kursor tidak memakai transisi CSS (tanpa 'mengejar' saat gulir)", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.rect = RECT;
			pointerStore.cursor = { x: 100, y: 100 };
			pointerStore.phase = "arrived";
			pointerStore.ringVisible = true;
		});
		const before = cursorBox()?.style.transform;
		expect(cursorBox()?.style.transition ?? "").toBe("");
		expect(before).toContain("translate(");
		expect(cursorBox()?.querySelector("svg")?.style.transition).toContain(
			"opacity",
		);
		await act(async () => {
			pointerStore.cursor = { x: 200, y: 150 };
		});
		expect(cursorBox()?.style.transform).not.toBe(before);
		expect(cursorBox()?.style.transition ?? "").toBe("");
		await unmount();
	});

	it("setelah tiba ring tampil penuh dan berdenyut", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.rect = RECT;
			pointerStore.cursor = { x: 60, y: 45 };
			pointerStore.phase = "arrived";
			pointerStore.ringVisible = true;
		});
		expect(ring()?.style.opacity).toBe("1");
		expect(ring()?.getAttribute("data-visible")).toBe("true");
		await unmount();
	});

	it("fase leaving: kursor dan ring memudar", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.rect = RECT;
			pointerStore.cursor = { x: 60, y: 45 };
			pointerStore.phase = "leaving";
			pointerStore.ringVisible = false;
		});
		expect(cursorBox()?.querySelector("svg")?.style.opacity).toBe("0");
		expect(ring()?.style.opacity).toBe("0");
		await unmount();
	});

	it("reduced motion (animate=false): tanpa transisi sama sekali", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.animate = false;
			pointerStore.rect = RECT;
			pointerStore.cursor = { x: 60, y: 45 };
			pointerStore.phase = "arrived";
			pointerStore.ringVisible = true;
		});
		expect(cursorBox()?.querySelector("svg")?.style.transition).toBe("none");
		expect(ring()?.style.transition).toBe("none");
		await unmount();
	});
});
