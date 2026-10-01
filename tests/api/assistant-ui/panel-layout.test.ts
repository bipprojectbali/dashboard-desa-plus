import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	assistantPanelStyles,
	PANEL_BODY_STYLE,
} from "@/components/assistant/assistant-panel.styles";

/**
 * Regresi bug F1-c: gaya di prop `style` <Drawer.Content> ikut diteruskan
 * Mantine 8 ke pembungkus `inner` selayar penuh → layar tertutup gelap dan
 * panel turun ke kiri bawah. Gaya panel wajib lewat `styles.content`.
 */

const src = (file: string) =>
	readFileSync(
		join(import.meta.dir, "../../../src/components/assistant", file),
		"utf8",
	);

describe("tata letak panel asisten", () => {
	it("komponen Drawer.* tidak memakai prop style; gaya lewat styles", () => {
		const panel = src("assistant-panel.tsx");
		const tags = panel.match(/<Drawer\.\w+\b[^>]*>/g) ?? [];
		expect(tags.some((t) => t.startsWith("<Drawer.Content"))).toBe(true);
		for (const tag of tags) expect(tag).not.toContain("style=");
		expect(panel).toContain("styles={assistantPanelStyles(dark)}");
	});

	it("gaya Drawer hanya untuk content; inner tidak disentuh", () => {
		const styles = assistantPanelStyles(false);
		expect(Object.keys(styles)).toEqual(["content"]);
		expect(styles.content).toMatchObject({
			display: "flex",
			flexDirection: "column",
		});
	});

	it("isi panel mengisi sisa tinggi agar pesan bergulir & composer di bawah", () => {
		expect(PANEL_BODY_STYLE).toMatchObject({ flex: 1, minHeight: 0 });
	});

	it("latar panel mengikuti tema terang/gelap", () => {
		expect(assistantPanelStyles(false).content.background).toBe("white");
		expect(assistantPanelStyles(true).content.background).toBe("#141d34");
	});
});
