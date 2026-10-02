import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assistantSpaceFor } from "@/components/assistant/use-assistant-space";
import {
	isRailEligible,
	SIDEBAR_FULL_WIDTH,
	SIDEBAR_RAIL_BELOW_VIEWPORT,
	SIDEBAR_RAIL_MIN_VIEWPORT,
	SIDEBAR_RAIL_WIDTH,
	type SidebarModeInput,
	sidebarModeFor,
	sidebarWidthFor,
} from "@/components/layout/sidebar-layout";
import en from "@/locales/en";
import id from "@/locales/id";

/** #44 sidebar ringkas (S-c): rel ikon saat panel terbuka di layar < 1600px, pilihan user dipulihkan. */

const read = (p: string) =>
	readFileSync(join(import.meta.dir, "../../..", p), "utf8");

const PANEL = assistantSpaceFor(true, false);
const base: SidebarModeInput = {
	panelSpace: PANEL,
	viewportWidth: 1366,
	userCollapsed: false,
	widened: false,
};
const mode = (o: Partial<SidebarModeInput>) =>
	sidebarModeFor({ ...base, ...o });

describe("sidebarModeFor", () => {
	it("panel tertutup → penuh di semua lebar layar", () => {
		for (const viewportWidth of [800, 1000, 1366, 1599, 1600, 1920])
			expect(mode({ panelSpace: 0, viewportWidth })).toBe("full");
	});

	it("panel terbuka + layar 992..1599 → rel ikon", () => {
		for (const viewportWidth of [992, 1280, 1366, 1599])
			expect(mode({ viewportWidth })).toBe("rail");
	});

	it("panel terbuka + layar ≥ 1600 → tidak berubah (penuh)", () => {
		expect(mode({ viewportWidth: SIDEBAR_RAIL_BELOW_VIEWPORT })).toBe("full");
		expect(mode({ viewportWidth: 2560 })).toBe("full");
	});

	it("di bawah breakpoint md panel melayang → sidebar tidak disempitkan", () => {
		expect(mode({ viewportWidth: SIDEBAR_RAIL_MIN_VIEWPORT - 1 })).toBe("full");
		expect(mode({ viewportWidth: 0 })).toBe("full");
	});

	it("mode perbesar (ruang panel 0) → tidak berubah", () => {
		expect(
			mode({ panelSpace: assistantSpaceFor(true, true), viewportWidth: 1366 }),
		).toBe("full");
	});

	it("sidebar yang disembunyikan user tetap tersembunyi, dengan atau tanpa panel", () => {
		for (const panelSpace of [0, PANEL])
			for (const viewportWidth of [1366, 1920])
				expect(mode({ panelSpace, viewportWidth, userCollapsed: true })).toBe(
					"hidden",
				);
	});

	it("user memperlebar rel → penuh selama panel terbuka", () => {
		expect(mode({ widened: true })).toBe("full");
		expect(mode({ widened: true, userCollapsed: true })).toBe("hidden");
	});

	it("pemulihan: pilihan user tidak diubah panel, jadi menutup panel mengembalikan keadaan semula", () => {
		const choices = [false, true];
		for (const userCollapsed of choices) {
			const before = mode({ panelSpace: 0, userCollapsed });
			const during = mode({ userCollapsed });
			const after = mode({ panelSpace: 0, userCollapsed });
			expect(after).toBe(before);
			expect(during).toBe(userCollapsed ? "hidden" : "rail");
		}
	});
});

describe("isRailEligible & lebar", () => {
	it("hanya bila ada ruang panel dan layar dalam rentang", () => {
		expect(isRailEligible(PANEL, 1366)).toBe(true);
		expect(isRailEligible(0, 1366)).toBe(false);
		expect(isRailEligible(PANEL, 1600)).toBe(false);
		expect(isRailEligible(PANEL, 991)).toBe(false);
	});

	it("lebar: rel 72, selain itu 300", () => {
		expect(SIDEBAR_RAIL_WIDTH).toBe(72);
		expect(SIDEBAR_FULL_WIDTH).toBe(300);
		expect(sidebarWidthFor("rail")).toBe(72);
		expect(sidebarWidthFor("full")).toBe(300);
		expect(sidebarWidthFor("hidden")).toBe(300);
	});
});

describe("pemasangan", () => {
	it("MainLayout memakai useSidebarLayout dan menyetel lebar/collapse navbar dari mode", () => {
		const src = read("src/components/layout/main-layout.tsx");
		expect(src).toContain("useSidebarLayout(sidebarCollapsed, assistantSpace)");
		expect(src).toContain("width: sidebarLayout.width");
		expect(src).toContain('desktop: sidebarLayout.mode === "hidden"');
		expect(src).toContain("<Sidebar rail={isRail}");
	});

	it("transisi navbar mengikuti animasiTransisi dan reduced-motion", () => {
		expect(read("src/components/layout/main-layout.tsx")).toContain(
			"transitionDuration={animasiTransisi && !reducedMotion ? 200 : 0}",
		);
	});

	it("toggle header membuang perlebaran manual (menampilkan lagi → mulai dari rel)", () => {
		const src = read("src/components/layout/main-layout.tsx");
		expect(src).toContain("sidebarLayout.reset();");
		expect(src).toContain("onSidebarToggle={handleToggleSidebar}");
	});

	it("/wall dan /profile tidak memakai sidebar rel", () => {
		for (const f of [
			"src/components/wall/wall-page.tsx",
			"src/routes/profile/route.tsx",
		])
			expect(read(f)).not.toContain("useSidebarLayout");
	});
});

describe("sidebar.tsx", () => {
	const src = read("src/components/sidebar.tsx");

	it("setiap menu punya ikon dari @tabler/icons-react (tanpa paket baru)", () => {
		const items = src.match(/path:\s*"[^"]+"/g)?.length ?? 0;
		const icons = src.match(/icon:\s*Icon[A-Za-z]+/g)?.length ?? 0;
		expect(items).toBeGreaterThan(0);
		expect(icons).toBe(items);
		expect(src).toContain('from "@tabler/icons-react"');
	});

	it("rel menampilkan tooltip nama menu dan tombol perlebar", () => {
		expect(src).toContain("<Tooltip");
		expect(src).toContain("label={item.name}");
		expect(src).toContain("aria-label={item.name}");
		expect(src).toContain("t.sidebar.perlebarMenu");
		expect(src).toContain("onClick={onWiden}");
	});

	it("teks tombol perlebar tersedia di id & en", () => {
		expect(id.sidebar.perlebarMenu.length).toBeGreaterThan(0);
		expect(en.sidebar.perlebarMenu.length).toBeGreaterThan(0);
	});
});
