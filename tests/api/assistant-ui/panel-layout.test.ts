import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assistantPanelStyles } from "@/components/assistant/assistant.logic";

/**
 * Regresi bug F1-c: gaya di prop `style` <Drawer.Content> ikut diteruskan
 * Mantine 8 ke pembungkus `inner` selayar penuh → layar tertutup gelap dan
 * panel turun ke kiri bawah. Gaya panel wajib lewat `styles.content`.
 */

const PANEL_SOURCE = readFileSync(
	join(
		import.meta.dir,
		"../../../src/components/assistant/assistant-panel.tsx",
	),
	"utf8",
);

describe("tata letak panel asisten", () => {
	it("<Drawer.Content> dan <Drawer.Body> tidak memakai prop style", () => {
		const tags = PANEL_SOURCE.match(/<Drawer\.(Content|Body)\b[^>]*>/g) ?? [];
		expect(tags).toHaveLength(2);
		for (const tag of tags) expect(tag).not.toContain("style=");
		expect(PANEL_SOURCE).toContain("styles={assistantPanelStyles(dark)}");
	});

	it("gaya hanya untuk content & body; inner tidak disentuh", () => {
		const styles = assistantPanelStyles(false);
		expect(Object.keys(styles).sort()).toEqual(["body", "content"]);
		expect(styles.content).toMatchObject({
			display: "flex",
			flexDirection: "column",
		});
		expect(styles.body).toMatchObject({ flex: 1, minHeight: 0, padding: 0 });
	});

	it("latar panel mengikuti tema terang/gelap", () => {
		expect(assistantPanelStyles(false).content.background).toBe("white");
		expect(assistantPanelStyles(true).content.background).toBe("#141d34");
	});
});
