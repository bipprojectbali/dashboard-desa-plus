import { afterEach, describe, expect, it } from "bun:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AssistantCursor } from "@/components/assistant/pointer/assistant-cursor";
import { pointerStore } from "@/components/assistant/pointer/pointer-store";

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

afterEach(() => {
	pointerStore.rect = null;
});

describe("AssistantCursor", () => {
	it("tidak merender apa pun bila tidak ada sorotan", async () => {
		const unmount = await mount();
		expect(find()).toBeNull();
		await unmount();
	});

	it("merender overlay yang tak menangkap klik & disembunyikan dari pembaca layar", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.animate = true;
			pointerStore.rect = { x: 10, y: 20, width: 100, height: 50 };
		});
		const overlay = find();
		expect(overlay).not.toBeNull();
		expect(overlay?.getAttribute("aria-hidden")).toBe("true");
		expect(overlay?.style.pointerEvents).toBe("none");
		expect(overlay?.querySelector("svg")?.style.transition).toContain(
			"transform",
		);
		await unmount();
	});

	it("tanpa animasi (reduced motion) kursor tidak memakai transisi", async () => {
		const unmount = await mount();
		await act(async () => {
			pointerStore.animate = false;
			pointerStore.rect = { x: 10, y: 20, width: 100, height: 50 };
		});
		const svg = find()?.querySelector("svg");
		expect(svg?.style.transition).toBe("none");
		await unmount();
	});
});
