import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	ASSISTANT_HEADER_HEIGHT,
	ASSISTANT_PANEL_WIDTH,
	assistantPanelStyles,
} from "@/components/assistant/assistant-panel.styles";
import {
	assistantAsideConfig,
	assistantSpaceFor,
} from "@/components/assistant/use-assistant-space";

/** Ruang yang disisakan halaman untuk panel asisten (satu sumber: MainLayout, /profile, /wall). */

const read = (p: string) =>
	readFileSync(join(import.meta.dir, "../../..", p), "utf8");

describe("assistantSpaceFor", () => {
	it("terbuka + mode normal → selebar panel (440)", () => {
		expect(assistantSpaceFor(true, false)).toBe(ASSISTANT_PANEL_WIDTH);
		expect(ASSISTANT_PANEL_WIDTH).toBe(440);
	});

	it("tertutup → 0", () => {
		expect(assistantSpaceFor(false, false)).toBe(0);
	});

	it("diperbesar → 0 (panel menutupi halaman, ditangani P6)", () => {
		expect(assistantSpaceFor(true, true)).toBe(0);
		expect(assistantSpaceFor(false, true)).toBe(0);
	});
});

describe("assistantAsideConfig", () => {
	it("lebar panel, breakpoint md, hanya terbuka di desktop saat ada ruang", () => {
		expect(assistantAsideConfig(440)).toEqual({
			width: 440,
			breakpoint: "md",
			collapsed: { desktop: false, mobile: true },
		});
	});

	it("tanpa ruang → aside diciutkan (halaman tidak bergeser)", () => {
		expect(assistantAsideConfig(0)).toMatchObject({
			collapsed: { desktop: true, mobile: true },
		});
	});
});

describe("panel di bawah header", () => {
	it("withHeader menurunkan panel lewat styles.content, bukan inner", () => {
		const s = assistantPanelStyles(false, ASSISTANT_HEADER_HEIGHT);
		expect(Object.keys(s)).toEqual(["content"]);
		expect(s.content.marginTop).toBe(60);
		expect(s.content.height).toBe("calc(100% - 60px)");
	});

	it("tanpa offset (wall) gaya panel tidak berubah", () => {
		const s = assistantPanelStyles(false);
		expect(s.content.marginTop).toBeUndefined();
		expect(s.content.height).toBeUndefined();
	});

	it("FAB memberi withHeader kecuali variant wall", () => {
		expect(read("src/components/assistant/assistant-fab.tsx")).toContain(
			'withHeader={variant !== "wall"}',
		);
	});
});

describe("pemakai ruang panel", () => {
	it("MainLayout & /profile memakai aside AppShell dari helper yang sama", () => {
		for (const f of [
			"src/components/layout/main-layout.tsx",
			"src/routes/profile/route.tsx",
		]) {
			const src = read(f);
			expect(src).toContain("assistantAsideConfig(assistantSpace)");
			expect(src).toContain("useAssistantSpace()");
		}
	});

	it("/wall memakai helper yang sama, tanpa hitung ulang", () => {
		const src = read("src/components/wall/wall-page.tsx");
		expect(src).toContain("useAssistantSpace()");
		expect(src).not.toContain("ASSISTANT_PANEL_WIDTH");
	});
});
