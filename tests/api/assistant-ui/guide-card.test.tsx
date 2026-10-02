import { describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { AssistantGuideCard } from "@/components/assistant/assistant-guide-card";
import {
	GUIDE_GAP,
	GUIDE_MARGIN,
	placeGuideCard,
} from "@/components/assistant/pointer/guide-place";
import { startGuide } from "@/components/assistant/pointer/guide-session";
import { guideStore } from "@/components/assistant/pointer/guide-store";
import { pointerStore } from "@/components/assistant/pointer/pointer-store";
import {
	env,
	fetchCalls,
	guideAction,
	installGuideTestHooks,
	mountTargets,
	realSetTimeout,
} from "./guide.fixtures";

/** Fitur 2 panduan bertahap: penempatan kartu dan kartu catatan. */

installGuideTestHooks();

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
