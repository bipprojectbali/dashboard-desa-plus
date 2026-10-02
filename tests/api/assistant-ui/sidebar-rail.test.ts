import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assistantSpaceFor } from "@/components/assistant/use-assistant-space";
import {
	expandedState,
	INITIAL_SIDEBAR_STATE,
	isRailEligible,
	SIDEBAR_FULL_WIDTH,
	SIDEBAR_RAIL_BELOW_VIEWPORT,
	SIDEBAR_RAIL_MIN_VIEWPORT,
	SIDEBAR_RAIL_WIDTH,
	type SidebarModeInput,
	sidebarModeFor,
	sidebarWidthFor,
	toggledState,
} from "@/components/layout/sidebar-layout";
import en from "@/locales/en";
import id from "@/locales/id";

/** #44 sidebar ringkas: rel ikon saat panel terbuka di layar < 1600px atau saat diminimize user; fullscreen menyembunyikan penuh. */

const read = (p: string) =>
	readFileSync(join(import.meta.dir, "../../..", p), "utf8");

const PANEL = assistantSpaceFor(true, false);
const base: SidebarModeInput = {
	...INITIAL_SIDEBAR_STATE,
	panelSpace: PANEL,
	viewportWidth: 1366,
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

	it("diminimize user → rel ikon di semua lebar layar, dengan atau tanpa panel", () => {
		for (const panelSpace of [0, PANEL])
			for (const viewportWidth of [800, 1366, 1600, 1920])
				expect(mode({ panelSpace, viewportWidth, minimized: true })).toBe(
					"rail",
				);
	});

	it("fullscreen menyembunyikan penuh, mengalahkan minimize dan panel", () => {
		for (const panelSpace of [0, PANEL])
			for (const viewportWidth of [1366, 1920])
				for (const minimized of [false, true])
					expect(
						mode({ panelSpace, viewportWidth, minimized, hidden: true }),
					).toBe("hidden");
	});

	it("user memperlebar rel otomatis → penuh selama panel terbuka", () => {
		expect(mode({ widened: true })).toBe("full");
		expect(mode({ widened: true, hidden: true })).toBe("hidden");
	});

	it("minimize mengalahkan perlebaran (pilihan user selalu menang)", () => {
		expect(mode({ widened: true, minimized: true })).toBe("rail");
	});

	it("pemulihan: pilihan user tidak diubah panel, jadi menutup panel mengembalikan keadaan semula", () => {
		for (const minimized of [false, true]) {
			const before = mode({ panelSpace: 0, minimized });
			const during = mode({ minimized });
			const after = mode({ panelSpace: 0, minimized });
			expect(after).toBe(before);
			expect(during).toBe("rail");
		}
	});
});

describe("toggledState (tombol header)", () => {
	const toggle = (o: Partial<SidebarModeInput>, eligible: boolean) => {
		const input = { ...base, ...o };
		const next = toggledState(input, sidebarModeFor(input), eligible);
		return { next, mode: sidebarModeFor({ ...input, ...next }) };
	};

	it("penuh → rel ikon (minimize), bukan hilang", () => {
		expect(toggle({ panelSpace: 0 }, false).mode).toBe("rail");
		expect(toggle({ panelSpace: 0 }, false).next.minimized).toBe(true);
	});

	it("rel ikon (minimize) → penuh", () => {
		const r = toggle({ panelSpace: 0, minimized: true }, false);
		expect(r.mode).toBe("full");
		expect(r.next).toEqual(INITIAL_SIDEBAR_STATE);
	});

	it("rel otomatis oleh panel → penuh (tidak ada klik mati)", () => {
		expect(toggle({}, true).mode).toBe("full");
	});

	it("rel minimize saat panel sempit → penuh, lalu kembali ke rel saat diminimize lagi", () => {
		const first = toggle({ minimized: true }, true);
		expect(first.mode).toBe("full");
		const second = toggle({ ...first.next }, true);
		expect(second.mode).toBe("rail");
	});

	it("keluar dari fullscreen mengembalikan keadaan sebelumnya (rel/penuh)", () => {
		expect(toggle({ hidden: true, minimized: true }, false).mode).toBe("rail");
		expect(toggle({ hidden: true, panelSpace: 0 }, false).mode).toBe("full");
	});

	it("expandedState: perlebaran hanya dicatat bila rel otomatis berlaku", () => {
		expect(expandedState(true)).toEqual({
			minimized: false,
			widened: true,
			hidden: false,
		});
		expect(expandedState(false).widened).toBe(false);
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
	const layout = read("src/components/layout/main-layout.tsx");

	it("MainLayout memakai useSidebarLayout dan menyetel lebar/collapse navbar dari mode", () => {
		expect(layout).toContain("useSidebarLayout(assistantSpace)");
		expect(layout).toContain("width: sidebarLayout.width");
		expect(layout).toContain('desktop: sidebarLayout.mode === "hidden"');
		expect(layout).toContain("rail={isRail}");
	});

	it("transisi navbar mengikuti animasiTransisi dan reduced-motion", () => {
		expect(layout).toContain(
			"transitionDuration={animasiTransisi && !reducedMotion ? 200 : 0}",
		);
	});

	it("tombol header memakai toggle sidebar (minimize ↔ penuh), ikon cari rel membuka pencarian global", () => {
		expect(layout).toContain("onSidebarToggle={sidebarLayout.toggle}");
		expect(layout).toContain("onSearch={() => setSearchOpen(true)}");
		expect(layout).toContain("<GlobalSearch");
	});

	it("gestur fullscreen (klik tiga kali) menyembunyikan penuh lewat hide, bukan minimize", () => {
		expect(layout).toContain(
			'useSidebarFullscreen(\n\t\tsidebarLayout.mode === "hidden",\n\t\tsidebarLayout.hide,',
		);
		const hook = read("src/hooks/use-sidebar-fullscreen.ts");
		expect(hook).toContain("onHide()");
		expect(hook).not.toContain("toggleSidebar");
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
